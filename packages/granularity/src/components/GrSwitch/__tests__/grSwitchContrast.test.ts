import { describe, expect, it } from 'vitest'

import {
  derivedThemeVars,
  getColorClassExpression,
  getContrastRatio,
  resolveColorExpression,
  themeVarsByName,
  type ThemeName,
} from '../../../__tests__/cssContrast'
import { thumbBase, thumbContentColorClass } from '../grSwitchStyles'

/**
 * Содержимое бегунка — спиннер загрузки и иконка действия — лежит на его
 * собственной заливке, а не на дорожке и не на фоне страницы. Мерить надо
 * против неё.
 *
 * Порог 3:1 (WCAG 1.4.11): и спиннер, и знак — графические объекты, они
 * опознаются формой, а не начертанием.
 *
 * Гейт заведён вместе с иконкой, но закрывает и спиннер, живший без проверки.
 */
const AA_NON_TEXT = 3
const THEMES: ThemeName[] = ['light', 'dark']

describe('GrSwitch · контраст содержимого бегунка', () => {
  it('спиннер и знак различимы на заливке бегунка в обеих темах', () => {
    const content = getColorClassExpression(thumbContentColorClass, 'text-[')
    const thumb = getColorClassExpression(thumbBase, 'bg-[')

    if (!content || !thumb)
      throw new Error('GrSwitch: не удалось извлечь цвета бегунка')

    const failures: string[] = []

    for (const theme of THEMES) {
      const vars = themeVarsByName[theme]
      const ratio = getContrastRatio(
        resolveColorExpression(content, vars, derivedThemeVars),
        resolveColorExpression(thumb, vars, derivedThemeVars),
      )

      if (ratio < AA_NON_TEXT)
        failures.push(`${theme}:${ratio.toFixed(2)}`)
    }

    expect(failures).toEqual([])
  })
})
