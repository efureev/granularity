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
import { grFoundationTokens, grThemeTokens } from '@feugene/granularity/tokens'

describe('showcase foundations content', () => {
  it('собирает полный foundations coverage для styling, themes, tokens, granum и localization', () => {
    expect(showcaseFoundationGuides.map(guide => guide.id)).toEqual([
      'styling',
      'themes',
      'tokens',
      'granum',
      'localization',
    ])
    expect(showcaseFoundationGuides.every(guide => guide.narrativeSource.length > 80)).toBe(true)
    expect(showcaseFoundationGuides.every(guide => guide.codeSamples.length > 0)).toBe(true)
  })

  it('подключает narrative docs и source layers пакета как источники foundations guidance', () => {
    expect(showcaseFoundationGuides.find(guide => guide.id === 'styling')?.sourcePath).toBe('packages/granularity/docs/styling.md')
    expect(showcaseFoundationGuides.find(guide => guide.id === 'granum')?.sourcePath).toBe('packages/granularity/docs/granum.md')
    expect(showcaseFoundationGuides.find(guide => guide.id === 'granum')?.narrativeSource).toContain('@feugene/granum/vite')
    expect(showcaseFoundationGuides.find(guide => guide.id === 'granum')?.narrativeSource).toContain('virtual:granum.css')
    expect(showcaseFoundationGuides.find(guide => guide.id === 'localization')?.narrativeSource).toContain('GRANULARITY_I18N_BLOCK')
    expect(showcaseFoundationGuides.find(guide => guide.id === 'tokens')?.narrativeSource).toContain('--gr-space-4')
  })

  it('собирает текущий registry foundation tokens из данных пакета', () => {
    expect(showcaseFoundationTokens.length).toBeGreaterThan(40)
    expect(showcaseFoundationTokens.find(token => token.name === '--gr-slate-500')).toMatchObject({
      hexValue: '#64748b',
      section: 'Palette scale',
    })
    expect(showcaseFoundationTokens.find(token => token.name === '--gr-font-ui')?.description).toContain('Основной стек шрифта')
    expect(showcaseFoundationTokens.find(token => token.name === '--gr-primary-hover')?.value).toContain('color-mix')
  })

  it('собирает current theme token registry из данных пакета', () => {
    expect(showcaseThemeTokens.length).toBeGreaterThan(30)
    expect(showcaseThemeTokens.find(token => token.name === '--gr-bg')).toMatchObject({
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
    expect(showcaseThemeTokens.find(token => token.name === '--gr-primary')?.description).toContain('brand/action цвет')
    expect(showcaseThemeTokens.find(token => token.name === '--gr-primary-hover')?.section).toBe('Fallbacks / action roles')
  })

  // Страница Foundations раньше держала копии `tokens.css`/`themes/*.css` литералами
  // и молча их протухала. Теперь источник один — данные пакета; проверяем, что
  // витрина показывает ровно их, а не собственную версию.
  it('не расходится с данными пакета', () => {
    for (const token of grThemeTokens) {
      const shown = showcaseThemeTokens.find(item => item.name === token.name)

      expect(shown, token.name).toBeDefined()
      expect(shown!.values.light.value, `${token.name} (light)`).toBe(token.values.light)
      expect(shown!.values.dark.value, `${token.name} (dark)`).toBe(token.values.dark)
    }

    for (const token of grFoundationTokens) {
      expect(showcaseFoundationTokens.find(item => item.name === token.name)?.value, token.name)
        .toBe(token.value)
    }
  })

  it('даёт quick-start snippets и обзорные метрики для landing/foundations страниц', () => {
    expect(showcaseQuickStartCards).toHaveLength(5)
    expect(showcaseQuickStartCards.map(card => card.id)).toEqual([
      'quick-start-granum-basic',
      'quick-start-granum-components',
      'quick-start-granum-themes',
      'quick-start-granum-prune',
      'quick-start-granum-guard',
    ])
    // Все пять шагов — один и тот же конфиг, растущий опциями: движок инстансом
    // и провайдер именем пакета обязаны стоять в каждом, иначе шаг не рабочий.
    expect(showcaseQuickStartCards.every(card => card.code.includes('defineGranumConfig'))).toBe(true)
    expect(showcaseQuickStartCards.every(card => card.code.includes('engine: windEngine()'))).toBe(true)
    expect(showcaseQuickStartCards.every(card => card.code.includes(`providers: ['@feugene/granularity']`))).toBe(true)
    expect(showcaseQuickStartCards.every(card => card.code.includes('@feugene/granum-engine-wind'))).toBe(true)
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-granum-basic')?.code).not.toContain('components:')
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-granum-components')?.code).toContain('names: [\'GrButton\', \'GrCard\']')
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-granum-themes')?.code).toContain('themes: { names: [\'light\', \'dark\'] }')
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-granum-prune')?.code).toContain('pruneTokens: { mode: \'on\' }')
    expect(showcaseQuickStartCards.find(card => card.id === 'quick-start-granum-guard')?.code).toContain('js: { guard: \'error\' }')
    expect(showcaseInstallationNarrative).toContain('granum(granumConfig)')
    expect(showcaseInstallationNarrative).toContain('virtual:granum.css')
    expect(showcaseFoundationStats).toHaveLength(3)
    expect(showcaseFoundationsChecklist).toHaveLength(3)
  })
})
