import { describe, expect, it } from 'vitest'

import {
  derivedThemeVars,
  getColorClassExpression,
  getColorDistance,
  getContrastRatio,
  resolveColorExpression,
  themeVarsByName,
  type ThemeName,
} from '../../../__tests__/cssContrast'
import { codeBlockRootClass, codeTokenClass } from '../grCodeBlockStyles'
import type { GrCodeRole } from '../../../highlight/tokenizeJson'

/**
 * Контрастная гарантия палитры подсветки — по образцу `GrBadge` и `GrLink`.
 *
 * У палитры два независимых требования, и второе обычно забывают. Первое:
 * каждая роль обязана читаться на фоне блока. Второе: роли обязаны отличаться
 * **друг от друга** — ключ, строка, число и литерал стоят рядом в одной строке,
 * и два близких оттенка там сливаются в один. Ровно на этом пакет уже
 * попадался: `--gr-info` был индиго в двух шагах от `--gr-primary`
 * (`docs/theming.md`, ловушка №5).
 *
 * Порог контраста — AA 4.5:1: кегль блока 10–13px, послаблений для крупного
 * текста здесь нет ни на одной ступени.
 */

const AA_NORMAL_TEXT = 4.5

/**
 * Порог различимости здесь выше, чем 2.3 из `tonePalette.test.ts`, и это не
 * произвол. Там сравниваются тона, стоящие отдельными плашками; здесь роли
 * перемежаются в одной строке плотного моноширинного текста — `{"count": 42}` —
 * и «едва заметной» разницы для них мало.
 *
 * Число выбрано по факту: самая тесная пара палитры — «ключ ↔ число» — даёт 16.6
 * в тёмной теме. Порог 12 оставляет запас и при этом ловит возврат к `info`,
 * который давал 7.8.
 */
const MIN_DELTA_E = 12

/**
 * Пары, которым совпадать разрешено — решение, а не недосмотр.
 *
 * Список закрытый: новая роль, совпавшая с существующей, покраснеет, пока
 * совпадение не объяснят здесь. Ровно так же устроен `INTENTIONAL_EXTRA` у
 * гейта зависимостей ядра.
 */
const INTENTIONALLY_ALIKE: ReadonlyArray<readonly [GrCodeRole, GrCodeRole]> = [
  // Имя переменной в живых темах — обычный текст: подсвечивать каждый
  // идентификатор значит сделать код пестрее, а не читаемее.
  ['punctuation', 'variable'],
  // Имена объявленного — ключ, функция, тип — одна смысловая группа: в разметке
  // они различаются позицией, а не оттенком. Разводить их цветом значило бы
  // изобрести оттенок, которого тема не знает.
  ['key', 'function'],
  ['key', 'type'],
  ['function', 'type'],
]

function isAlike(a: GrCodeRole, b: GrCodeRole): boolean {
  return INTENTIONALLY_ALIKE.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

const THEMES: ThemeName[] = ['light', 'dark']

/** Роли, которые несут смысл и обязаны быть различимы. `plain` цвета не задаёт. */
/**
 * Все роли, у которых есть свой цвет. `plain` не в списке намеренно: у него
 * класса нет вовсе, текст красится цветом блока.
 *
 * Список выведен из карты классов, а не переписан рядом: роль, добавленная в
 * палитру и забытая здесь, осталась бы непроверенной — а именно непроверенный
 * цвет и оказывается нечитаемым.
 */
const COLORED_ROLES: GrCodeRole[] = (Object.keys(codeTokenClass) as GrCodeRole[])
  .filter(role => codeTokenClass[role] !== '')

function expressionOf(role: GrCodeRole): string {
  const expression = getColorClassExpression(codeTokenClass[role], 'text-[')

  if (!expression)
    throw new Error(`GrCodeBlock: не удалось извлечь цвет роли ${role}`)

  return expression
}

function resolve(expression: string, theme: ThemeName) {
  return resolveColorExpression(expression, themeVarsByName[theme], derivedThemeVars)
}

const backgroundExpression = getColorClassExpression(codeBlockRootClass, 'bg-[')

describe('GrCodeBlock — палитра подсветки', () => {
  it('фон блока извлекается из класса поверхности', () => {
    expect(backgroundExpression).toBeTruthy()
  })

  describe.each(THEMES)('тема %s', (theme) => {
    const background = resolve(backgroundExpression!, theme)

    it.each(COLORED_ROLES)('роль %s читается на фоне блока', (role) => {
      const ratio = getContrastRatio(resolve(expressionOf(role), theme), background)

      expect(ratio, `${role} на --gr-code-block-bg: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
    })

    it('номер строки читается на фоне блока', () => {
      const ratio = getContrastRatio(resolve('var(--gr-muted-fg)', theme), background)

      expect(ratio, `номер строки: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
    })

    // Читаемость каждого цвета по отдельности ничего не говорит о том, отличит
    // ли человек ключ от строки, когда они стоят в одной строке.
    it('роли различимы между собой', () => {
      const tooClose: string[] = []

      for (let i = 0; i < COLORED_ROLES.length; i += 1) {
        for (let j = i + 1; j < COLORED_ROLES.length; j += 1) {
          const first = COLORED_ROLES[i]!
          const second = COLORED_ROLES[j]!
          const distance = getColorDistance(resolve(expressionOf(first), theme), resolve(expressionOf(second), theme))

          if (distance < MIN_DELTA_E && !isAlike(first, second))
            tooClose.push(`${first} ↔ ${second}: ΔE ${distance.toFixed(2)}`)
        }
      }

      expect(tooClose, 'соседние роли сливаются в один цвет').toEqual([])
    })
  })
})
