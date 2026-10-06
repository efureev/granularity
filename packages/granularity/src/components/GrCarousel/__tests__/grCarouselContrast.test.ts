import { describe, expect, it } from 'vitest'

import {
  derivedThemeVars,
  getColorClassExpression,
  getContrastRatio,
  resolveColorExpression,
  themeVarsByName,
  type ThemeName,
} from '../../../__tests__/cssContrast'
import { carouselDotStates, grCarouselDotActiveClass } from '../grCarouselStyles'

/**
 * Текущая точка — графический объект, и опознаётся она только цветом и обводом:
 * порог 3:1 (WCAG 1.4.11) против подложки, на которой стоит полоса, и против
 * соседних неактивных точек. Иначе «вы на этом кадре» не читается вовсе.
 *
 * Насыщенные тоны держат свою роль сами — их контраст стережёт палитра. Здесь
 * `neutral`: у него своего насыщенного цвета нет, и выбор токена — решение
 * компонента.
 */
const AA_NON_TEXT = 3
const THEMES: ThemeName[] = ['light', 'dark']
const SURFACES = ['--gr-bg', '--gr-card'] as const

function resolve(expression: string, theme: ThemeName) {
  return resolveColorExpression(expression, themeVarsByName[theme], derivedThemeVars)
}

describe('GrCarousel · контраст текущей точки тона neutral', () => {
  const active = getColorClassExpression(grCarouselDotActiveClass('neutral'), 'bg-[')
  const idle = getColorClassExpression(carouselDotStates.idle, 'bg-[')

  if (!active || !idle)
    throw new Error('GrCarousel: не удалось извлечь цвета точек')

  it('хук `--gr-carousel-dot-active` перебивает тон, а запасной цвет — не `--gr-secondary`', () => {
    expect(active.startsWith('var(--gr-carousel-dot-active,')).toBe(true)
    expect(active).not.toContain('--gr-secondary')
  })

  it.each(THEMES)('видна на подложке страницы и карточки (%s)', (theme) => {
    const failures = SURFACES
      .map(surface => ({ surface, ratio: getContrastRatio(resolve(active, theme), resolve(`var(${surface})`, theme)) }))
      .filter(entry => entry.ratio < AA_NON_TEXT)
      .map(entry => `${entry.surface}:${entry.ratio.toFixed(2)}`)

    expect(failures).toEqual([])
  })

  it.each(THEMES)('отличается от неактивной точки (%s)', (theme) => {
    expect(getContrastRatio(resolve(active, theme), resolve(idle, theme))).toBeGreaterThanOrEqual(AA_NON_TEXT)
  })
})
