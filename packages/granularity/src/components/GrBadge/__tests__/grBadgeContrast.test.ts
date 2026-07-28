import { describe, expect, it } from 'vitest'

import { GR_TONES } from '../../shared/tones'
import {
  derivedThemeVars,
  getColorClassExpression,
  getContrastRatio,
  resolveColorExpression,
  themeVarsByName,
  type ThemeName,
} from '../../../__tests__/cssContrast'
import { darkToneClassByTone, lightToneClassByTone } from '../grBadgeStyles'

/**
 * Контрастная гарантия для `GrBadge` — по образцу теста `GrButton`.
 *
 * Появился после реального регресса: soft-бейджи красили текст насыщенным
 * тоном на его же светлой подложке (`--gr-success` на `--gr-success-light` —
 * 2.24:1), а solid-бейджи хардкодили `text-white`, из-за чего в тёмной теме
 * контраст падал до 1.92:1. Ни юнит-тесты (проверяли строку класса), ни axe
 * (правило `color-contrast` отключено), ни визуальный гейт (допуск 2% пикселей)
 * этого не ловили.
 *
 * Порог — AA 4.5:1: текст бейджа мелкий (11–14px), послаблений для крупного
 * текста здесь нет ни на одном размере.
 */

const AA_NORMAL_TEXT = 4.5
const THEMES: ThemeName[] = ['light', 'dark']

type BadgeMode = { name: string, dark: boolean }

const MODES: BadgeMode[] = [
  { name: 'soft', dark: false },
  { name: 'solid', dark: true },
]

/**
 * Цвета берём из карты тонов, а не из собранного `grBadgeClass`: там есть
 * `text-[13px]` из size-мапы, и обобщённый парсер `text-[` схватил бы размер
 * вместо цвета.
 */
function badgeColors(tone: (typeof GR_TONES)[number], dark: boolean) {
  const className = (dark ? darkToneClassByTone : lightToneClassByTone)[tone]

  const text = getColorClassExpression(className, 'text-[')
  const background = getColorClassExpression(className, 'bg-[')

  if (!text || !background) {
    throw new Error(`GrBadge: не удалось извлечь цвета для ${dark ? 'solid' : 'soft'}/${tone}: ${className}`)
  }

  return { text, background }
}

describe('GrBadge · контраст', () => {
  it('текст на подложке проходит AA во всех тонах, режимах и темах', () => {
    const failures: string[] = []

    for (const theme of THEMES) {
      for (const mode of MODES) {
        for (const tone of GR_TONES) {
          const { text, background } = badgeColors(tone, mode.dark)
          const vars = themeVarsByName[theme]
          const ratio = getContrastRatio(
            resolveColorExpression(text, vars, derivedThemeVars),
            resolveColorExpression(background, vars, derivedThemeVars),
          )

          if (ratio < AA_NORMAL_TEXT) {
            failures.push(`${theme}:${mode.name}:${tone}:${ratio.toFixed(2)}`)
          }
        }
      }
    }

    expect(failures).toEqual([])
  })

  it('ни одна карта тонов не содержит цвета вне токенов', () => {
    // `text-white` в solid-карте был именно такой утечкой: литерал не знает
    // полярности заливки и не переживает смену темы.
    for (const [name, map] of [['soft', lightToneClassByTone], ['solid', darkToneClassByTone]] as const) {
      for (const [tone, className] of Object.entries(map)) {
        expect(className, `${name}/${tone}`).not.toMatch(/\b(?:text|bg|border)-(?:white|black)\b/)
        expect(className, `${name}/${tone}`).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      }
    }
  })
})
