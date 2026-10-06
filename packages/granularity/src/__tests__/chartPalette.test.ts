import { describe, expect, it } from 'vitest'

import { toLab } from '../theme/color'
import { derivedThemeVars, getColorDistance, getContrastRatio, resolveColorExpression, themeVarsByName, type ThemeName } from './cssContrast'

/**
 * Палитра серий графиков: пять ролей `--gr-chart-*`, которые стоят рядом в
 * одной легенде и в одной стопке.
 *
 * Дефект, ради которого гейт написан: `--gr-chart-1` (indigo-600) и
 * `--gr-chart-4` (indigo-500) были одним цветом в двух оттенках, а
 * `--gr-chart-5` (violet-500) — тем же сине-фиолетовым семейством. В стопке из
 * четырёх рядов первая и четвёртая полосы не различались ни заливкой, ни
 * точкой легенды. По ΔE они расходились на 17 — порог в 15, как у тонов,
 * такого не поймал бы, — поэтому здесь два условия: заметное расстояние и
 * разный **тон** (угол в LCh), а не та же краска светлее.
 *
 * Плюс контраст 3:1 к странице и карточке (WCAG 1.4.11): полоса и маркер —
 * графические объекты, и бледный цвет серии теряется на подложке.
 */
const SERIES = [1, 2, 3, 4, 5].map(index => `--gr-chart-${index}`)
const THEMES = Object.keys(themeVarsByName) as ThemeName[]
const SURFACES = ['--gr-bg', '--gr-card'] as const

const MIN_DISTANCE = 40
const MIN_HUE_DEGREES = 30
const AA_NON_TEXT = 3

function hueOf(color: { r: number, g: number, b: number }): number {
  const [, a, b] = toLab([color.r, color.g, color.b])

  return (Math.atan2(b, a) * 180 / Math.PI + 360) % 360
}

function hueGap(first: number, second: number): number {
  const gap = Math.abs(first - second) % 360

  return Math.min(gap, 360 - gap)
}

describe('палитра серий графиков', () => {
  it.each(THEMES)('%s: любые две серии различимы — и расстоянием, и тоном', (theme) => {
    const vars = themeVarsByName[theme]
    const colors = SERIES.map(name => ({ name, color: resolveColorExpression(`var(${name})`, vars, derivedThemeVars) }))
    const offenders: string[] = []

    for (let first = 0; first < colors.length; first++) {
      for (let second = first + 1; second < colors.length; second++) {
        const a = colors[first]
        const b = colors[second]
        const distance = getColorDistance(a.color, b.color)
        const hue = hueGap(hueOf(a.color), hueOf(b.color))

        if (distance < MIN_DISTANCE || hue < MIN_HUE_DEGREES)
          offenders.push(`${a.name}/${b.name}: ΔE ${distance.toFixed(1)}, тон ${hue.toFixed(0)}°`)
      }
    }

    expect(offenders).toEqual([])
  })

  it.each(THEMES)('%s: каждая серия видна на странице и на карточке', (theme) => {
    const vars = themeVarsByName[theme]
    const failures: string[] = []

    for (const name of SERIES) {
      for (const surface of SURFACES) {
        const ratio = getContrastRatio(
          resolveColorExpression(`var(${name})`, vars, derivedThemeVars),
          resolveColorExpression(`var(${surface})`, vars, derivedThemeVars),
        )

        if (ratio < AA_NON_TEXT)
          failures.push(`${name} на ${surface}: ${ratio.toFixed(2)}`)
      }
    }

    expect(failures).toEqual([])
  })
})
