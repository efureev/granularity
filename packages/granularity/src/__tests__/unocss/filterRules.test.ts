import { createGenerator } from '@unocss/core'
import { theme } from '@unocss/preset-mini'
import { describe, expect, it } from 'vitest'

import { normalizeCss } from '../helpers/granularityTestUtils'
import { filterRules } from '../../unocss/rules/filters'

async function createFilterRulesUno() {
  return createGenerator({
    theme,
    rules: filterRules,
  })
}

describe('filterRules', () => {
  it('генерирует blur variants для plain, filter и backdrop форм', async () => {
    const uno = await createFilterRulesUno()

    const { css } = await uno.generate('blur-sm blur-none filter-blur backdrop-blur-2xl')
    const normalizedCss = normalizeCss(css)

    expect(css).toContain('.blur-sm')
    expect(css).toContain('.blur-none')
    expect(css).toContain('.filter-blur')
    expect(css).toContain('.backdrop-blur-2xl')
    expect(normalizedCss).toContain('--un-blur:blur(4px)')
    expect(normalizedCss).toContain('--un-blur:blur(0)')
    expect(normalizedCss).toContain('--un-blur:blur(8px)')
    expect(normalizedCss).toContain('--un-backdrop-blur:blur(40px)')
  })

  it('генерирует percent- и degree-based variants для всех поддержанных префиксов', async () => {
    const uno = await createFilterRulesUno()

    const { css } = await uno.generate([
      'brightness-75',
      'filter-brightness-125',
      'backdrop-brightness-50',
      'contrast-75',
      'filter-contrast-125',
      'backdrop-contrast-50',
      'hue-rotate-30',
      'filter-hue-rotate-60',
      'backdrop-hue-rotate-90',
      'saturate-75',
      'filter-saturate-125',
      'backdrop-saturate-50',
      'backdrop-op-50',
      'backdrop-opacity-25',
    ].join(' '))
    const normalizedCss = normalizeCss(css)

    expect(normalizedCss).toContain('--un-brightness:brightness(0.75)')
    expect(normalizedCss).toContain('--un-brightness:brightness(1.25)')
    expect(normalizedCss).toContain('--un-backdrop-brightness:brightness(0.5)')
    expect(normalizedCss).toContain('--un-contrast:contrast(0.75)')
    expect(normalizedCss).toContain('--un-contrast:contrast(1.25)')
    expect(normalizedCss).toContain('--un-backdrop-contrast:contrast(0.5)')
    expect(normalizedCss).toContain('--un-hue-rotate:hue-rotate(30deg)')
    expect(normalizedCss).toContain('--un-hue-rotate:hue-rotate(60deg)')
    expect(normalizedCss).toContain('--un-backdrop-hue-rotate:hue-rotate(90deg)')
    expect(normalizedCss).toContain('--un-saturate:saturate(0.75)')
    expect(normalizedCss).toContain('--un-saturate:saturate(1.25)')
    expect(normalizedCss).toContain('--un-backdrop-saturate:saturate(0.5)')
    expect(normalizedCss).toContain('--un-backdrop-opacity:opacity(0.5)')
    expect(normalizedCss).toContain('--un-backdrop-opacity:opacity(0.25)')
  })

  it('генерирует default, explicit и none variants для grayscale, invert и sepia', async () => {
    const uno = await createFilterRulesUno()

    const { css } = await uno.generate([
      'grayscale',
      'filter-grayscale-50',
      'backdrop-grayscale-none',
      'invert',
      'filter-invert-50',
      'backdrop-invert-none',
      'sepia',
      'filter-sepia-25',
      'backdrop-sepia-none',
    ].join(' '))
    const normalizedCss = normalizeCss(css)

    expect(normalizedCss).toContain('--un-grayscale:grayscale(100%)')
    expect(normalizedCss).toContain('--un-grayscale:grayscale(0.5)')
    expect(normalizedCss).toContain('--un-backdrop-grayscale:grayscale(0)')
    expect(normalizedCss).toContain('--un-invert:invert(100%)')
    expect(normalizedCss).toContain('--un-invert:invert(0.5)')
    expect(normalizedCss).toContain('--un-backdrop-invert:invert(0)')
    expect(normalizedCss).toContain('--un-sepia:sepia(100%)')
    expect(normalizedCss).toContain('--un-sepia:sepia(0.25)')
    expect(normalizedCss).toContain('--un-backdrop-sepia:sepia(0)')
  })

  it('генерирует все формы drop-shadow: base, theme value, none, color и opacity aliases', async () => {
    const uno = await createFilterRulesUno()

    const { css } = await uno.generate([
      'drop-shadow',
      'filter-drop-shadow-sm/50',
      'drop-shadow-none',
      'drop-shadow-red-500',
      'drop-shadow-color-red-500',
      'drop-shadow-op-50',
      'drop-shadow-color-opacity-25',
      'filter-drop-shadow-color-opacity-75',
    ].join(' '))
    const normalizedCss = normalizeCss(css)

    expect(css).toContain('.drop-shadow')
    expect(css).toContain('.filter-drop-shadow-sm\\/50')
    expect(css).toContain('.drop-shadow-none')
    expect(css).toContain('.drop-shadow-red-500')
    expect(css).toContain('.drop-shadow-color-red-500')
    expect(css).toContain('.drop-shadow-op-50')
    expect(css).toContain('.drop-shadow-color-opacity-25')
    expect(css).toContain('.filter-drop-shadow-color-opacity-75')
    expect(normalizedCss).toContain('--un-drop-shadow:drop-shadow(01px2px')
    expect(normalizedCss).toContain('--un-drop-shadow:drop-shadow(01px1px')
    expect(normalizedCss).toContain('--un-drop-shadow:drop-shadow(00var(--un-drop-shadow-color,rgb(000/0)))')
    expect(normalizedCss).toContain('--un-drop-shadow-color:rgb(2396868/var(--un-drop-shadow-opacity))')
    expect(normalizedCss).toContain('--un-drop-shadow-opacity:0.5')
    expect(normalizedCss).toContain('--un-drop-shadow-opacity:0.25')
    expect(normalizedCss).toContain('--un-drop-shadow-opacity:0.75')
  })

  it('генерирует базовые, none и keyword варианты для filter и backdrop-filter', async () => {
    const uno = await createFilterRulesUno()

    const { css } = await uno.generate([
      'filter',
      'backdrop-filter',
      'filter-none',
      'backdrop-filter-none',
      'filter-inherit',
      'filter-initial',
      'backdrop-filter-unset',
      'backdrop-filter-revert-layer',
    ].join(' '))
    const normalizedCss = normalizeCss(css)

    expect(normalizedCss).toContain('.filter{filter:var(--un-blur,)var(--un-brightness,)var(--un-contrast,)var(--un-grayscale,)var(--un-hue-rotate,)var(--un-invert,)var(--un-saturate,)var(--un-sepia,)var(--un-drop-shadow,);}')
    expect(normalizedCss).toContain('.backdrop-filter{-webkit-backdrop-filter:var(--un-backdrop-blur,)var(--un-backdrop-brightness,)var(--un-backdrop-contrast,)var(--un-backdrop-grayscale,)var(--un-backdrop-hue-rotate,)var(--un-backdrop-invert,)var(--un-backdrop-opacity,)var(--un-backdrop-saturate,)var(--un-backdrop-sepia,);backdrop-filter:var(--un-backdrop-blur,)var(--un-backdrop-brightness,)var(--un-backdrop-contrast,)var(--un-backdrop-grayscale,)var(--un-backdrop-hue-rotate,)var(--un-backdrop-invert,)var(--un-backdrop-opacity,)var(--un-backdrop-saturate,)var(--un-backdrop-sepia,);}')
    expect(normalizedCss).toContain('.filter-none{filter:none;}')
    expect(normalizedCss).toContain('.backdrop-filter-none{-webkit-backdrop-filter:none;backdrop-filter:none;}')
    expect(normalizedCss).toContain('.filter-inherit{filter:inherit;}')
    expect(normalizedCss).toContain('.filter-initial{filter:initial;}')
    expect(normalizedCss).toContain('.backdrop-filter-unset{-webkit-backdrop-filter:unset;backdrop-filter:unset;}')
    expect(normalizedCss).toContain('.backdrop-filter-revert-layer{-webkit-backdrop-filter:revert-layer;backdrop-filter:revert-layer;}')
  })
})