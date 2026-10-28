import { describe, expect, it } from 'vitest'

import { GR_TONES } from '../../shared/tones'
import { componentSheet, lookElement } from '../../../__tests__/componentSheet'
import {
  derivedThemeVars,
  getColorDistance,
  getContrastRatio,
  readComponentThemeVars,
  resolveColorExpression,
  themeVarsByName,
  THEME_MODES,
} from '../../../__tests__/cssContrast'
import { grBadgeLookAttrs } from '../grBadgeStyles'

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

/**
 * Порог для графического объекта (WCAG 1.4.11). Он ниже текстового не по
 * снисхождению: кружок опознаётся формой и положением, а не начертанием.
 */
const AA_NON_TEXT = 3
const THEMES = THEME_MODES

type BadgeMode = { name: string, dark: boolean }

const MODES: BadgeMode[] = [
  { name: 'soft', dark: false },
  { name: 'solid', dark: true },
]

const { look } = componentSheet('GrBadge/GrBadge.vue')

/** Вид метки из её листа: тот же каскад, что видит браузер. */
function badgeLook(tone: (typeof GR_TONES)[number], dark: boolean) {
  return look(lookElement('span', { 'data-gr-badge': '', ...grBadgeLookAttrs({ tone, size: 'sm', radius: 'round', dark }) }))
}

function badgeColors(tone: (typeof GR_TONES)[number], dark: boolean) {
  const style = badgeLook(tone, dark)

  return { text: style.color, background: style['background-color'], border: style['border-color'] }
}

/** Маркер на мягкой метке `badgeTone`; свой тон у него есть, только если отличается. */
function dotColor(badgeTone: (typeof GR_TONES)[number], dotTone: (typeof GR_TONES)[number]) {
  const badge = lookElement('span', { 'data-gr-badge': '', ...grBadgeLookAttrs({ tone: badgeTone, size: 'sm', radius: 'round' }) })
  const dot = lookElement('span', { 'data-gr-badge-dot': '', 'data-gr-tone': dotTone === badgeTone ? undefined : dotTone })
  badge.append(dot)

  return look(dot)['background-color']
}

describe('GrBadge · контраст', () => {
  it('текст на подложке проходит AA во всех тонах, режимах и темах', () => {
    const failures: string[] = []

    for (const theme of THEMES) {
      for (const mode of MODES) {
        for (const tone of GR_TONES) {
          const { text, background } = badgeColors(tone, mode.dark)
          // Покомпонентный слой поверх глобальной темы: filled-бейдж красится
          // `--gr-badge-*`, и без этих значений гейт мерил бы фолбэк, то есть не
          // то, что увидит пользователь.
          const vars = { ...themeVarsByName[theme], ...readComponentThemeVars('GrBadge', theme) }
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

  /**
   * Второй вопрос, отдельный от «читается ли текст»: **видно ли саму плашку** на
   * фоне под ней. Гейт появился после реального дефекта: чип `GrAutocomplete`
   * красился примесью `--gr-muted` без рамки, и на светлой теме это давало 1.02:1
   * к фону поля — три единицы из 255. Контрастом такое не измерить (порог 3:1 из
   * WCAG 1.4.11 не проходит и наша штатная пара `--gr-muted`/`--gr-brd`), поэтому
   * мерим воспринимаемое расстояние: порог заметности ΔE ≈ 2.3.
   */
  it('граница плашки различима на фоне страницы в обеих темах', () => {
    const JND = 2.3
    const failures: string[] = []

    for (const theme of THEMES) {
      const vars = { ...themeVarsByName[theme], ...readComponentThemeVars('GrBadge', theme) }
      const pageBackground = resolveColorExpression('var(--gr-bg)', vars, derivedThemeVars)

      for (const tone of GR_TONES) {
        // soft: границу держит рамка — сама подложка от фона почти не отличается.
        const softBorder = badgeColors(tone, false).border
        // filled: границу держит заливка.
        const solidFill = badgeColors(tone, true).background

        for (const [mode, expression] of [['soft', softBorder], ['solid', solidFill]] as const) {
          const distance = getColorDistance(
            resolveColorExpression(expression, vars, derivedThemeVars),
            pageBackground,
          )

          if (distance < JND)
            failures.push(`${theme}:${mode}:${tone}:ΔE ${distance.toFixed(2)}`)
        }
      }
    }

    expect(failures).toEqual([])
  })

  it('ни один тон не красит литералом вне токенов', () => {
    // `text-white` в solid-карте был именно такой утечкой: литерал не знает
    // полярности заливки и не переживает смену темы.
    for (const dark of [false, true]) {
      for (const tone of GR_TONES) {
        for (const value of Object.values(badgeColors(tone, dark))) {
          expect(value, `${dark ? 'solid' : 'soft'}/${tone}`).not.toMatch(/\b(?:white|black)\b/)
          expect(value, `${dark ? 'solid' : 'soft'}/${tone}`).not.toMatch(/#[0-9a-f]{3,8}\b/i)
        }
      }
    }
  })
})

/**
 * Точка-маркер лежит **на подложке бейджа**, а не на фоне страницы, поэтому
 * пары мерятся против неё.
 *
 * Гейт нужен именно здесь: на светлом весе подложка сама тонирована, и маркер
 * того же семейства на ней теряется. Пара «`--gr-success` на
 * `--gr-success-light`» даёт 2.24:1 — не проходит даже порог для графики,
 * и ровно из-за неё булев `dot` красится `currentColor`, а не тоном.
 */
describe('GrBadge · контраст точки-маркера', () => {
  it('маркер различим на подложке во всех парах тонов и обеих темах', () => {
    const failures: string[] = []

    for (const theme of THEMES) {
      const vars = { ...themeVarsByName[theme], ...readComponentThemeVars('GrBadge', theme) }

      for (const badgeTone of GR_TONES) {
        const background = badgeColors(badgeTone, false).background

        for (const dotTone of GR_TONES) {
          const dot = dotColor(badgeTone, dotTone)

          const ratio = getContrastRatio(
            resolveColorExpression(dot, vars, derivedThemeVars),
            resolveColorExpression(background, vars, derivedThemeVars),
          )

          if (ratio < AA_NON_TEXT)
            failures.push(`${theme}:badge=${badgeTone}:dot=${dotTone}:${ratio.toFixed(2)}`)
        }
      }
    }

    expect(failures).toEqual([])
  })
})
