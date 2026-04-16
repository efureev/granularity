import { createGenerator } from '@unocss/core'
import { presetMini } from 'unocss'
import { describe, expect, it } from 'vitest'

import { normalizeCss } from '../helpers/granularityTestUtils'
import {
  createGranularityCssPreflights,
  getGranularitySafelist,
  presetGranularity,
  resolvePresetGranularityPreflights,
} from '../../unocss/preset'

async function createUno() {
  return createGenerator({
    presets: [presetMini(), presetGranularity()],
  })
}

describe('granularity browser-safe preset', () => {
  it('держит browser-safe core preset без node-only preflights по умолчанию', async () => {
    const safelist = getGranularitySafelist(['DsButton'])
    const uno = await createGenerator({
      presets: [presetMini(), presetGranularity({ components: ['DsButton'] })],
    })

    const { css } = await uno.generate(safelist.join(' '))
    const normalizedCss = normalizeCss(css)

    expect(resolvePresetGranularityPreflights()).toEqual([])
    expect(css).toContain('.bg-\\[var\\(--ds-button-primary-bg\\,var\\(--primary\\)\\)\\]')
    expect(css).toContain('.focus-visible\\:ring-\\[var\\(--ring\\)\\]')
    expect(css).toContain('.animate-spin')
    expect(css).toContain('.border-transparent')
    expect(css).toContain('.hover\\:border-\\[var\\(--brd-hover\\,var\\(--brd\\)\\)\\]:hover')
    expect(css).toContain('.active\\:border-\\[var\\(--brd-active\\,var\\(--brd\\)\\)\\]:active')
    expect(css).toContain('@keyframes granularity-spin')
    expect(normalizedCss).toContain('background-color:transparent')
    expect(normalizedCss).toContain('border-color:transparent')
    expect(normalizedCss).toContain('border-color:var(--brd-hover,var(--brd))')
    expect(normalizedCss).toContain('border-color:var(--brd-active,var(--brd))')
    expect(normalizedCss).not.toContain('--ds-space-4:16px')
    expect(normalizedCss).not.toContain('--primary:#4f46e5')
  })

  it('генерирует backdrop blur utilities, которых нет в mini preset', async () => {
    const uno = await createUno()

    const { css } = await uno.generate('backdrop-blur-2xl')
    const normalizedCss = normalizeCss(css)

    expect(css).toContain('.backdrop-blur-2xl')
    expect(normalizedCss).toContain('--un-backdrop-blur:blur(40px)')
    expect(normalizedCss).toContain('-webkit-backdrop-filter:var(--un-backdrop-blur,)')
    expect(normalizedCss).toContain('backdrop-filter:var(--un-backdrop-blur,)')
  })

  it('генерирует полный набор filter/backdrop filter utilities из wind4 filters rule', async () => {
    const uno = await createUno()

    const { css } = await uno.generate([
      'blur-sm',
      'filter-blur',
      'brightness-75',
      'contrast-125',
      'grayscale',
      'hue-rotate-30',
      'invert-50',
      'saturate-150',
      'sepia',
      'backdrop-blur-2xl',
      'backdrop-brightness-75',
      'backdrop-contrast-125',
      'backdrop-grayscale',
      'backdrop-hue-rotate-30',
      'backdrop-invert-50',
      'backdrop-opacity-50',
      'backdrop-saturate-150',
      'backdrop-sepia',
    ].join(' '))
    const normalizedCss = normalizeCss(css)

    expect(css).toContain('.blur-sm')
    expect(css).toContain('.filter-blur')
    expect(css).toContain('.backdrop-blur-2xl')
    expect(normalizedCss).toContain('--un-blur:blur(4px)')
    expect(normalizedCss).toContain('--un-brightness:brightness(0.75)')
    expect(normalizedCss).toContain('--un-contrast:contrast(1.25)')
    expect(normalizedCss).toContain('--un-grayscale:grayscale(100%)')
    expect(normalizedCss).toContain('--un-hue-rotate:hue-rotate(30deg)')
    expect(normalizedCss).toContain('--un-invert:invert(0.5)')
    expect(normalizedCss).toContain('--un-saturate:saturate(1.5)')
    expect(normalizedCss).toContain('--un-sepia:sepia(100%)')
    expect(normalizedCss).toContain('--un-backdrop-blur:blur(40px)')
    expect(normalizedCss).toContain('--un-backdrop-brightness:brightness(0.75)')
    expect(normalizedCss).toContain('--un-backdrop-contrast:contrast(1.25)')
    expect(normalizedCss).toContain('--un-backdrop-grayscale:grayscale(100%)')
    expect(normalizedCss).toContain('--un-backdrop-hue-rotate:hue-rotate(30deg)')
    expect(normalizedCss).toContain('--un-backdrop-invert:invert(0.5)')
    expect(normalizedCss).toContain('--un-backdrop-opacity:opacity(0.5)')
    expect(normalizedCss).toContain('--un-backdrop-saturate:saturate(1.5)')
    expect(normalizedCss).toContain('--un-backdrop-sepia:sepia(100%)')
  })

  it('генерирует drop-shadow utilities, color и opacity modifiers', async () => {
    const uno = await createUno()

    const { css } = await uno.generate('drop-shadow-sm drop-shadow-color-red-500 drop-shadow-opacity-50')
    const normalizedCss = normalizeCss(css)

    expect(css).toContain('.drop-shadow-sm')
    expect(css).toContain('.drop-shadow-color-red-500')
    expect(css).toContain('.drop-shadow-opacity-50')
    expect(normalizedCss).toContain('--un-drop-shadow:drop-shadow(')
    expect(normalizedCss).toContain('--un-drop-shadow-color:')
    expect(normalizedCss).toContain('--un-drop-shadow-opacity:0.5')
    expect(normalizedCss).toContain('filter:var(--un-blur,)var(--un-brightness,)var(--un-contrast,)var(--un-grayscale,)var(--un-hue-rotate,)var(--un-invert,)var(--un-saturate,)var(--un-sepia,)var(--un-drop-shadow,)')
  })

  it('генерирует base, none и keyword варианты для filter utilities', async () => {
    const uno = await createUno()

    const { css } = await uno.generate('filter backdrop-filter filter-none backdrop-filter-none filter-inherit backdrop-filter-inherit')
    const normalizedCss = normalizeCss(css)

    expect(css).toContain('.filter')
    expect(css).toContain('.backdrop-filter')
    expect(css).toContain('.filter-none')
    expect(css).toContain('.backdrop-filter-none')
    expect(css).toContain('.filter-inherit')
    expect(css).toContain('.backdrop-filter-inherit')
    expect(normalizedCss).toContain('filter:var(--un-blur,)var(--un-brightness,)var(--un-contrast,)var(--un-grayscale,)var(--un-hue-rotate,)var(--un-invert,)var(--un-saturate,)var(--un-sepia,)var(--un-drop-shadow,)')
    expect(normalizedCss).toContain('-webkit-backdrop-filter:var(--un-backdrop-blur,)var(--un-backdrop-brightness,)var(--un-backdrop-contrast,)var(--un-backdrop-grayscale,)var(--un-backdrop-hue-rotate,)var(--un-backdrop-invert,)var(--un-backdrop-opacity,)var(--un-backdrop-saturate,)var(--un-backdrop-sepia,)')
    expect(normalizedCss).toContain('filter:none')
    expect(normalizedCss).toContain('-webkit-backdrop-filter:none')
    expect(normalizedCss).toContain('backdrop-filter:none')
    expect(normalizedCss).toContain('.filter-inherit{filter:inherit;}')
    expect(normalizedCss).toContain('.backdrop-filter-inherit{-webkit-backdrop-filter:inherit;backdrop-filter:inherit;}')
  })

  it('позволяет pure preset-у принять внешние CSS preflight-ы без node imports', async () => {
    const safelist = getGranularitySafelist(['DsButton'])
    const granularityLayer = 'granularity'
    const layeredPreset = presetGranularity({
      components: ['DsButton'],
      layer: granularityLayer,
      preflights: createGranularityCssPreflights([':root { --primary: hotpink; }']),
    })
    const uno = await createGenerator({
      presets: [
        presetMini(),
        layeredPreset,
      ],
    })

    const { css } = await uno.generate(safelist.join(' '))
    const normalizedCss = normalizeCss(css)

    expect(layeredPreset.layer).toBe(granularityLayer)
    expect(layeredPreset.preflights?.map(preflight => preflight.layer)).toEqual([
      granularityLayer,
      granularityLayer,
    ])
    expect(normalizedCss).toContain('--primary:hotpink')
  })
})