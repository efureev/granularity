import { grThemeTokens } from '../tokens/generated'
import type { GrThemeName } from '../tokens/types'
import { contrast, mixSrgb, parseHex } from './color'
import { resolveRole, type GrThemeTokens } from './roles'

export type ToneRole = 'fill' | 'solid' | 'light' | 'text'

export interface ToneOptions {
  /** Тема, в которой тон будет жить: от неё зависят фон, текст и направление сдвигов. */
  base: GrThemeName | { tokens: GrThemeTokens } | GrThemeTokens
  /**
   * Что выводить. По умолчанию — ровно те роли, которые у этого тона есть **в
   * реестре пакета**: у `--gr-accent` это только `-fg`, у `--gr-primary` нет
   * `-light`. Для имени, которого в реестре нет, выводится полная семья.
   */
  roles?: ToneRole[]
}

const AA_TEXT = 4.5
/** Шаг подбора: 100 шагов по 1% дают точность, которой глаз не различает. */
const STEP = 1
/**
 * Насколько темнеет solid в hover и active.
 *
 * Обычные состояния пакет считает подмесом `--gr-fg` (`tokens/derived.json`), но
 * solid — кнопочная заливка: в светлой теме `--gr-fg` тёмный, в тёмной светлый,
 * и вторая уводила бы кнопку в сторону текста, то есть высветляла. Кнопка при
 * нажатии темнеет в обеих темах, поэтому здесь подмес чёрного.
 *
 * Значения встроенных тем взяты из шкал палитры и лежат в диапазоне 81–99%:
 * `tone` даёт согласованную семью, а не копию пакетных цветов.
 */
const SOLID_HOVER = 92
const SOLID_ACTIVE = 84

export class GrToneError extends Error {
  constructor(role: string, actual: number, expected: number) {
    super(
      `${role}: не удалось выйти на контраст ${expected}:1, максимум ${actual.toFixed(2)}:1.\n`
      + 'Возьмите семя дальше от фона темы либо задайте роль явно.',
    )

    this.name = 'GrToneError'
  }
}

/**
 * Роли, которые у этого тона есть в реестре. Лишняя роль — не «запас», а ошибка
 * сборки («роли, которых у пакета нет»), поэтому набор берётся из данных.
 */
function rolesOf(name: string): ToneRole[] {
  const known = new Set(grThemeTokens.map(token => token.name))
  const prefix = `--gr-${name}`

  if (!known.has(prefix)) return ['fill', 'solid', 'light', 'text']

  return ([
    ['fill', prefix],
    ['solid', `${prefix}-solid`],
    ['light', `${prefix}-light`],
    ['text', `${prefix}-text`],
  ] as const)
    .filter(([, role]) => known.has(role))
    .map(([kind]) => kind)
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
  const roles = options.roles ?? rolesOf(name)

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
    // Solid — кнопочный вес, и он одинаков в обеих темах: тёмная заливка со
    // светлым текстом. Это не симметрия ради симметрии — кнопки всех тонов
    // обязаны выглядеть одной семьёй (docs/theming.md, «Зачем -solid»), а
    // светлая кнопка в тёмной теме читалась бы как другой компонент.
    // Отсюда же направление состояний: заливка темнеет при наведении и нажатии.
    const solidFg = dark ? fg : '#ffffff'

    const solid = shiftUntil(seed, '#000000', solidFg, AA_TEXT, `${prefix}-solid`)

    result[`${prefix}-solid`] = solid
    result[`${prefix}-solid-fg`] = solidFg

    // Состояния solid — темовые роли, а не производные: `color-mix` их не
    // считает, и без них тема с нуля не соберётся вовсе.
    for (const [suffix, amount] of [['-solid-hover', SOLID_HOVER], ['-solid-active', SOLID_ACTIVE]] as const) {
      const state = mixSrgb(solid, '#000000', amount)
      const ratio = contrast(solidFg, state)

      if (ratio < AA_TEXT) throw new GrToneError(`${prefix}${suffix}`, ratio, AA_TEXT)

      result[`${prefix}${suffix}`] = state
    }
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
