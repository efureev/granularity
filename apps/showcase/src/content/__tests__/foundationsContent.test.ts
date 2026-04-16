import { describe, expect, it } from 'vitest'

import {
  showcaseFoundationGuides,
  showcaseFoundationStats,
  showcaseFoundationTokens,
  showcaseFoundationsChecklist,
  showcaseInstallationNarrative,
  showcaseQuickStartCards,
  showcaseThemeTokens,
} from '../foundations'

describe('showcase foundations content', () => {
  it('собирает полный foundations coverage для styling, themes, tokens, unocss и localization', () => {
    expect(showcaseFoundationGuides.map(guide => guide.id)).toEqual([
      'styling',
      'themes',
      'tokens',
      'unocss',
      'localization',
    ])
    expect(showcaseFoundationGuides.every(guide => guide.narrativeSource.length > 80)).toBe(true)
    expect(showcaseFoundationGuides.every(guide => guide.codeSamples.length > 0)).toBe(true)
  })

  it('подключает narrative docs и source layers пакета как источники foundations guidance', () => {
    expect(showcaseFoundationGuides.find(guide => guide.id === 'styling')?.sourcePath).toBe('packages/granularity/docs/styling.md')
    expect(showcaseFoundationGuides.find(guide => guide.id === 'unocss')?.narrativeSource).toContain('@feugene/granularity/uno-node')
    expect(showcaseFoundationGuides.find(guide => guide.id === 'localization')?.narrativeSource).toContain('DS_I18N_BLOCK')
    expect(showcaseFoundationGuides.find(guide => guide.id === 'tokens')?.narrativeSource).toContain('--ds-space-4')
  })

  it('собирает текущий registry foundation tokens прямо из tokens.css', () => {
    expect(showcaseFoundationTokens.length).toBeGreaterThan(40)
    expect(showcaseFoundationTokens.find(token => token.name === '--ds-slate-500')).toMatchObject({
      hexValue: '#64748b',
      section: 'Palette scale',
    })
    expect(showcaseFoundationTokens.find(token => token.name === '--ds-font-ui')?.description).toContain('Основной стек шрифта')
    expect(showcaseFoundationTokens.find(token => token.name === '--primary-hover')?.value).toContain('color-mix')
  })

  it('собирает current theme token registry из light.css и dark.css', () => {
    expect(showcaseThemeTokens.length).toBeGreaterThan(30)
    expect(showcaseThemeTokens.find(token => token.name === '--bg')).toMatchObject({
      section: 'Surface roles',
      values: {
        light: {
          hexValue: '#f8fafc',
        },
        dark: {
          hexValue: '#0f172a',
        },
      },
    })
    expect(showcaseThemeTokens.find(token => token.name === '--primary')?.description).toContain('brand/action цвет')
    expect(showcaseThemeTokens.find(token => token.name === '--primary-hover')?.section).toBe('Fallbacks / action roles')
    expect(showcaseThemeTokens.find(token => token.name === '--ds-category-tree-branch-line-active-color')).toMatchObject({
      section: 'Component semantic roles',
      values: {
        light: {
          hexValue: '#c4cdf7',
        },
        dark: {
          hexValue: '#505b8c',
        },
      },
    })
  })

  it('даёт quick-start snippets и обзорные метрики для landing/foundations страниц', () => {
    expect(showcaseQuickStartCards).toHaveLength(5)
    expect(showcaseQuickStartCards.map(card => card.id)).toEqual([
      'quick-start-root',
      'quick-start-subpath-js',
      'quick-start-component-css',
      'quick-start-uno-node',
      'quick-start-uno-pure',
    ])
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-root')?.code).toContain("import '@feugene/granularity/styles.css'")
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-root')?.code).not.toContain("@feugene/granularity/styles/tokens.css")
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-component-css')?.code).toContain("@feugene/granularity/components/DsButton/styles.css")
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-component-css')?.code).not.toContain("@feugene/granularity/styles/base.css")
    expect(showcaseInstallationNarrative).toContain('@feugene/granularity/uno-node')
    expect(showcaseFoundationStats).toHaveLength(3)
    expect(showcaseFoundationsChecklist).toHaveLength(3)
  })
})