import { grThemeTokens } from '../tokens/generated'
import type { GrThemeName } from '../tokens/types'
import { contrast, mixSrgb, parseHex } from './color'
import { resolveRole, type GrThemeTokens } from './roles'

export interface ToneOptions {
  /** Тема, в которой тон будет жить: от неё зависят фон, текст и направление сдвигов. */
  base: GrThemeName | { tokens: GrThemeTokens } | GrThemeTokens
  /** Ролей `-light`/`-text` у тона может не быть — тогда их не выводим. */
  roles?: ('fill' | 'solid' | 'light' | 'text')[]
}

const AA_TEXT = 4.5
/** Шаг подбора: 100 шагов по 1% дают точность, которой глаз не различает. */
const STEP = 1

export class GrToneError extends Error {
  constructor(role: string, actual: number, expected: number) {
    super(
      `${role}: не удалось выйти на контраст ${expected}:1, максимум ${actual.toFixed(2)}:1.\n`
      + 'Возьмите семя дальше от фона темы либо задайте роль явно.',
    )

    this.name = 'GrToneError'
  }
}

function baseTokensOf(base: ToneOptions['base']): GrThemeTokens {
  if (typeof base === 'string')
    return Object.fromEntries(grThemeTokens.map(token => [token.name, token.values[base]]))

  return 'tokens' in base ? (base as { tokens: GrThemeTokens }).tokens : base
}

function requireColor(tokens: GrThemeTokens, role: string): string {
  const value = resolveRole(tokens, role)
  if (!value) throw new Error(`тон выводится от темы, а роль ${role} в ней не цвет`)

  return value
}

/**
 * Сдвигает цвет к цели, пока не наберётся нужный контраст с эталоном.
 * Возвращает первый годный шаг — самый близкий к исходному цвету.
 */
function shiftUntil(from: string, towards: string, against: string, expected: number, role: string): string {
  let best = { value: from, ratio: contrast(from, against) }

  for (let amount = 100; amount >= 0; amount -= STEP) {
    const candidate = mixSrgb(from, towards, amount)
    const ratio = contrast(candidate, against)

    if (ratio >= expected) return candidate
    if (ratio > best.ratio) best = { value: candidate, ratio }
  }

  throw new GrToneError(role, best.ratio, expected)
}

/** Тёмная ли тема: фон темнее текста. Отсюда направление всех сдвигов. */
function isDark(tokens: GrThemeTokens): boolean {
  const [bg, fg] = [requireColor(tokens, '--gr-bg'), requireColor(tokens, '--gr-fg')]
  const luminanceOf = (hex: string): number => parseHex(hex).reduce((sum, channel) => sum + channel, 0)

  return luminanceOf(bg) < luminanceOf(fg)
}

/**
 * Семья ролей тона из одного цвета.
 *
 * Без неё композиция снимает только объём работы: перекрасив `--gr-success`, вы
 * оставляете `-light`, `-text` и `-solid*` от базовой темы, и они расходятся с
 * новым тоном по контрасту — ловушка №3 из `docs/theming.md`. Правила вывода
 * взяты оттуда же (§«Суффиксы ролей»), пороги проверяются на каждом шаге:
 * не вышло — падаем с именем роли, а не отдаём нечитаемое.
 *
 * ```ts
 * extendTheme({ name: 'ocean', base: 'dark', tokens: { ...tone('success', '#3ddc97', { base: 'dark' }) } })
 * ```
 */
export function tone(name: string, seed: string, options: ToneOptions): GrThemeTokens {
  const tokens = baseTokensOf(options.base)
  const roles = options.roles ?? ['fill', 'solid', 'light', 'text']

  const bg = requireColor(tokens, '--gr-bg')
  const fg = requireColor(tokens, '--gr-fg')
  const card = requireColor(tokens, '--gr-card')
  const dark = isDark(tokens)

  const result: GrThemeTokens = {}
  const prefix = `--gr-${name}`

  if (roles.includes('fill')) {
    result[prefix] = seed

    // Текст на заливке — тот из полюсов темы, что читается лучше. Проверяем
    // не только базу: hover/active уводят заливку к `--gr-fg`, и провалиться
    // текст может именно там (ловушка №2).
    const candidates = [fg, bg]
    const scoreOf = (candidate: string): number => Math.min(
      contrast(candidate, seed),
      contrast(candidate, mixSrgb(seed, fg, 92)),
      contrast(candidate, mixSrgb(seed, fg, 84)),
    )

    const [best] = [...candidates].sort((left, right) => scoreOf(right) - scoreOf(left))
    if (scoreOf(best) < AA_TEXT) throw new GrToneError(`${prefix}-fg`, scoreOf(best), AA_TEXT)

    result[`${prefix}-fg`] = best
  }

  if (roles.includes('solid')) {
    // Solid — кнопочный вес: заливка обязана держать текст противоположного
    // полюса. В светлой теме это белый на тёмной заливке, в тёмной — наоборот.
    const solidFg = dark ? bg : '#ffffff'
    const towards = dark ? fg : '#000000'

    result[`${prefix}-solid`] = shiftUntil(seed, towards, solidFg, AA_TEXT, `${prefix}-solid`)
    result[`${prefix}-solid-fg`] = solidFg
  }

  if (roles.includes('light')) {
    // Мягкая подложка: тон, подмешанный в поверхность карточки.
    result[`${prefix}-light`] = mixSrgb(seed, card, dark ? 22 : 14)
  }

  if (roles.includes('text')) {
    const light = result[`${prefix}-light`] ?? mixSrgb(seed, card, dark ? 22 : 14)

    // Текст тона живёт и на мягкой подложке, и на фоне страницы, и на карточке —
    // сдвигаем до худшего из трёх.
    let value = seed
    for (const surface of [light, bg, card])
      value = shiftUntil(value, fg, surface, AA_TEXT, `${prefix}-text`)

    result[`${prefix}-text`] = value
  }

  return result
}
