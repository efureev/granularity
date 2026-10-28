import { describe, expect, it } from 'vitest'

import { componentSheet, lookElement } from '../../../__tests__/componentSheet'
import {
  derivedThemeVars,
  getContrastRatio,
  resolveColorExpression,
  themeVarsByName,
  THEME_MODES,
} from '../../../__tests__/cssContrast'

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
const THEMES = THEME_MODES

describe('GrSwitch · контраст содержимого бегунка', () => {
  it('спиннер и знак различимы на заливке бегунка в обеих темах', () => {
    const { look } = componentSheet('GrSwitch/GrSwitch.vue')
    const thumbElement = lookElement('span', { 'data-gr-switch-thumb': '' })
    const icon = lookElement('span', { 'data-gr-switch-thumb-icon': '' })
    thumbElement.append(icon)
    const content = look(icon).color
    const thumb = look(thumbElement)['background-color']

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
