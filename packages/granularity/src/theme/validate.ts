import { grDerivedTokens, grThemeTokens } from '../tokens/generated'
import { contrast, deltaE, mixSrgb } from './color'
import type { GrTheme } from './extendTheme'
import { resolveRole, type GrThemeTokens } from './roles'

export interface GrThemeIssue {
  kind: 'contrast' | 'distance'
  /** Роль, из-за которой всё встало. */
  token: string
  /** На чём проверяли: поверхность либо второй тон. */
  against: string
  actual: number
  expected: number
  message: string
}

/**
 * AA для обычного текста.
 *
 * Порога для самой заливки здесь нет намеренно: `--gr-success` в светлой теме
 * даёт 2.42:1 к фону, и это не дефект — информацию бейдж несёт текстом `-fg`
 * поверх заливки, а не самой заливкой. Правило «≥3:1 к фону» уронило бы
 * встроенные темы пакета, то есть проверяло бы не то, о чём договаривались.
 */
const AA_TEXT = 4.5
/** Порог заметности ΔE: ниже — для глаза один цвет, каким бы разным ни был hex. */
const NOTICEABLE = 2.3

/**
 * Тона, выведенные из данных, а не списком: тон — это роль, у которой есть
 * пара `-fg`. Новый тон пакета попадает под проверки сам.
 */
function toneNames(): string[] {
  const names = new Set(grThemeTokens.map(token => token.name))

  return [...names]
    .filter(name => names.has(`${name}-fg`))
    .map(name => name.replace('--gr-', ''))
}

function derivedOf(role: string): { amount: number, mixWith: string }[] {
  return grDerivedTokens
    .filter(token => token.base === role)
    .map(token => ({ amount: token.amount, mixWith: token.mixWith }))
}

export function validateTheme(theme: GrTheme | { name: string, tokens: GrThemeTokens }): GrThemeIssue[] {
  const { tokens } = theme
  const issues: GrThemeIssue[] = []

  const value = (role: string): string | null => resolveRole(tokens, role)

  function requireContrast(token: string, against: string, expected: number, what: string): void {
    const [foreground, background] = [value(token), value(against)]
    // Роль не разворачивается в цвет (например `rgb(… / .45)` у подложки) —
    // считать нечего: молчаливая «проверка» хуже её отсутствия.
    if (!foreground || !background)
      return

    const actual = contrast(foreground, background)
    if (actual >= expected)
      return

    issues.push({
      kind: 'contrast',
      token,
      against,
      actual: Math.round(actual * 100) / 100,
      expected,
      message: `${what}: ${token} на ${against} даёт ${actual.toFixed(2)}:1 при пороге ${expected}:1`,
    })
  }

  /** Заливка в hover/active уходит темнее — текст на ней может провалиться именно там. */
  function requireContrastWithStates(fgRole: string, fillRole: string, what: string): void {
    requireContrast(fgRole, fillRole, AA_TEXT, what)

    const fill = value(fillRole)
    const foreground = value(fgRole)
    if (!fill || !foreground)
      return

    for (const { amount, mixWith } of derivedOf(fillRole)) {
      const mixed = value(mixWith)
      if (!mixed)
        continue

      const state = contrast(foreground, mixSrgb(fill, mixed, amount))
      if (state >= AA_TEXT)
        continue

      issues.push({
        kind: 'contrast',
        token: fgRole,
        against: `${fillRole} (${amount}%)`,
        actual: Math.round(state * 100) / 100,
        expected: AA_TEXT,
        message: `${what}: ${fgRole} на состоянии ${fillRole} (${amount}%) даёт ${state.toFixed(2)}:1 при пороге ${AA_TEXT}:1`,
      })
    }
  }

  // Основной текст — только на поверхностях БЕЗ собственной пары `-fg`.
  // У карточки, поповера и сайдбара она есть, и проверяется ниже вместе с
  // тонами: сайдбар вправе быть инвертированным (тёмная панель в светлой теме),
  // и требовать на нём общий `--gr-fg` значило бы запретить это.
  const withOwnFg = new Set(toneNames().map(tone => `--gr-${tone}`))

  for (const surface of ['--gr-bg', '--gr-card', '--gr-popover', '--gr-sidebar']) {
    if (withOwnFg.has(surface))
      continue

    requireContrast('--gr-fg', surface, AA_TEXT, 'основной текст')
  }

  for (const surface of ['--gr-bg', '--gr-card', '--gr-muted', '--gr-secondary'])
    requireContrast('--gr-muted-fg', surface, AA_TEXT, 'вторичный текст')

  for (const tone of toneNames()) {
    const fill = `--gr-${tone}`

    requireContrastWithStates(`${fill}-fg`, fill, `текст на заливке ${tone}`)

    // Состояния solid — свои роли темы, а не производные формулой, поэтому
    // текст на них проверяется отдельно: у темы с нуля это единственная защита.
    for (const state of ['-hover', '-active']) {
      if (tokens[`${fill}${state}`] === undefined)
        continue

      requireContrast(`${fill}-fg`, `${fill}${state}`, AA_TEXT, `текст на состоянии ${tone}${state}`)
    }

    if (tokens[`${fill}-text`] !== undefined) {
      requireContrast(`${fill}-text`, `${fill}-light`, AA_TEXT, `текст тона ${tone}`)
      requireContrast(`${fill}-text`, '--gr-bg', AA_TEXT, `текст тона ${tone}`)
      requireContrast(`${fill}-text`, '--gr-card', AA_TEXT, `текст тона ${tone}`)
    }
  }

  // Ловушка №5: два тона в двух шагах друг от друга. Пакет наступил на это сам —
  // `info` был индиго рядом с `primary`, и ссылки обоих тонов красились одинаково.
  const distinct = ['primary', 'success', 'warning', 'danger', 'info', 'slate', 'azure']

  for (let i = 0; i < distinct.length; i += 1) {
    for (let j = i + 1; j < distinct.length; j += 1) {
      const [first, second] = [`--gr-${distinct[i]}`, `--gr-${distinct[j]}`]
      const [firstValue, secondValue] = [value(first), value(second)]
      if (!firstValue || !secondValue)
        continue

      const distance = deltaE(firstValue, secondValue)
      if (distance >= NOTICEABLE)
        continue

      issues.push({
        kind: 'distance',
        token: first,
        against: second,
        actual: Math.round(distance * 100) / 100,
        expected: NOTICEABLE,
        message: `тона неразличимы: ΔE между ${first} и ${second} равно ${distance.toFixed(2)} при пороге ${NOTICEABLE}`,
      })
    }
  }

  return issues
}
