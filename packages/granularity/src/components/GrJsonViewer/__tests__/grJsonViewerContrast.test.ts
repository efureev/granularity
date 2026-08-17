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
import { jsonValueClass, jsonViewerKeyClass, jsonViewerRootClass } from '../grJsonViewerStyles'

/**
 * Палитра просмотрщика повторяет роли `GrCodeBlock`, но собственными токенами,
 * поэтому и проверяется собственным гейтом: копия, которую никто не проверяет,
 * расходится с оригиналом молча.
 *
 * Требований два. Первое: каждая роль читается на фоне панели. Второе: роли
 * отличаются **друг от друга** — ключ и значение стоят в одной строке через
 * двоеточие, и два близких оттенка там сливаются.
 */

const AA_NORMAL_TEXT = 4.5

/**
 * Порог различимости тот же, что у блока кода: роли перемежаются в одной строке
 * плотного моноширинного текста, и «едва заметной» разницы для них мало.
 */
const MIN_DELTA_E = 12

const THEMES: ThemeName[] = ['light', 'dark']

/** Роли, несущие смысл. `object`/`array`/`unsupported`/`truncation` — служебные. */
const COLORED = [
  ['key', jsonViewerKeyClass],
  ['string', jsonValueClass.string],
  ['number', jsonValueClass.number],
  ['literal', jsonValueClass.boolean],
] as const

function resolve(expression: string, theme: ThemeName) {
  return resolveColorExpression(expression, themeVarsByName[theme], derivedThemeVars)
}

function expressionOf(className: string): string {
  const expression = getColorClassExpression(className, 'text-[')

  if (!expression) throw new Error(`не удалось извлечь цвет из ${className}`)

  return expression
}

const backgroundExpression = getColorClassExpression(jsonViewerRootClass, 'bg-[')

describe('GrJsonViewer — палитра значений', () => {
  it('фон панели извлекается из корневого класса', () => {
    expect(backgroundExpression).toBeTruthy()
  })

  describe.each(THEMES)('тема %s', (theme) => {
    const background = resolve(backgroundExpression!, theme)

    it.each(COLORED)('роль %s читается на фоне панели', (name, className) => {
      const ratio = getContrastRatio(resolve(expressionOf(className), theme), background)

      expect(ratio, `${name} на --gr-json-viewer-bg: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
    })

    it('роли различимы между собой', () => {
      const tooClose: string[] = []

      for (let i = 0; i < COLORED.length; i++) {
        for (let j = i + 1; j < COLORED.length; j++) {
          const [leftName, leftClass] = COLORED[i]
          const [rightName, rightClass] = COLORED[j]
          const distance = getColorDistance(
            resolve(expressionOf(leftClass), theme),
            resolve(expressionOf(rightClass), theme),
          )

          if (distance < MIN_DELTA_E) tooClose.push(`${leftName} ↔ ${rightName}: ΔE ${distance.toFixed(1)}`)
        }
      }

      expect(tooClose, `слишком близки:\n${tooClose.join('\n')}`).toEqual([])
    })
  })
})
