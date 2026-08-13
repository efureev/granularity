import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { grThemeTokens } from '../../tokens/generated'
import { mixSrgb } from '../color'
import { extendTheme, GrThemeError, renderThemeCss } from '../extendTheme'
import { validateTheme } from '../validate'

const OCEAN = {
  '--gr-bg': '#041e2b',
  '--gr-card': '#0a2f42',
} as const

describe('наследование', () => {
  it('незаданная роль приходит из базы, заданная — побеждает', () => {
    const theme = extendTheme({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })
    const dark = Object.fromEntries(grThemeTokens.map(token => [token.name, token.values.dark]))

    expect(theme.tokens['--gr-bg']).toBe('#041e2b')
    expect(theme.tokens['--gr-popover']).toBe(dark['--gr-popover'])
  })

  it('набор полон по построению: все роли пакета на месте', () => {
    const theme = extendTheme({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })

    expect(Object.keys(theme.tokens).sort()).toEqual(grThemeTokens.map(token => token.name).sort())
  })

  it('базой может быть другая кастомная тема', () => {
    const ocean = extendTheme({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })
    const deep = extendTheme({ name: 'deep', base: ocean, tokens: { '--gr-card': '#062231' }, validate: false })

    expect(deep.tokens['--gr-bg']).toBe('#041e2b')
    expect(deep.tokens['--gr-card']).toBe('#062231')
  })

  it('роль не из пакета — ошибка с объяснением, а не молчаливый мусор в CSS', () => {
    expect(() => extendTheme({
      name: 'ocean',
      base: 'dark',
      tokens: { '--gr-radius-md': '10px' },
      validate: false,
    })).toThrow(/--gr-radius-md/)
  })
})

describe('CSS темы', () => {
  const theme = extendTheme({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })

  it('селектор по умолчанию — атрибут темы, но его можно задать', () => {
    expect(theme.selector).toBe("[data-theme='ocean']")
    expect(theme.css).toContain("[data-theme='ocean'] {")

    const scoped = extendTheme({ name: 'ocean', base: 'dark', selector: '.ocean', validate: false })
    expect(scoped.css).toContain('.ocean {')
  })

  it('объявляет все роли пакета', () => {
    for (const token of grThemeTokens)
      expect(theme.css, token.name).toContain(`${token.name}: `)
  })

  /**
   * Без своего фолбэка тема получила бы чужой — из `:root`, то есть от светлой:
   * hover тёмной темы стал бы светлым на браузере без `color-mix`.
   */
  it('фолбэк `@supports` посчитан от значений этой темы, а не базы', () => {
    const expected = mixSrgb(theme.tokens['--gr-primary'], theme.tokens['--gr-fg'], 92)

    expect(theme.css).toContain('@supports not (color: color-mix(in srgb, #000 50%, #fff))')
    expect(theme.css).toContain(`--gr-primary-hover: ${expected};`)
  })

  it('роль-ссылка разворачивается: `--gr-invalid-brd: var(--gr-danger)` считается по danger', () => {
    const theme = extendTheme({
      name: 'ref',
      base: 'dark',
      tokens: { '--gr-invalid-brd': 'var(--gr-danger)' },
      validate: false,
    })

    expect(theme.tokens['--gr-invalid-brd']).toBe('var(--gr-danger)')
    expect(theme.css).toContain('--gr-invalid-brd: var(--gr-danger);')
  })
})

/**
 * Композиция и генератор обязаны считать одно и то же: если они разойдутся,
 * тема потребителя будет отличаться от встроенной ровно на эту разницу.
 */
describe('согласие с генератором', () => {
  const packageDir = process.cwd()

  it.each(['light', 'dark'] as const)('пересобранная тема %s совпадает с `src/styles/themes`', (name) => {
    const theme = extendTheme({
      name,
      base: name,
      selector: name === 'light' ? ':root' : "[data-theme='dark']",
      validate: false,
    })

    const generated = readFileSync(resolve(packageDir, `src/styles/themes/${name}.css`), 'utf8')

    for (const token of grThemeTokens) {
      const declared = new RegExp(`${token.name}:\\s*([^;]+);`).exec(generated)?.[1].trim()
      expect(theme.tokens[token.name], token.name).toBe(declared)
    }

    // Фолбэки — та же формула на тех же значениях.
    const fallbacks = [...theme.css.matchAll(/(--gr-[\w-]+-(?:hover|active)):\s*(#[\da-f]{6});/gi)]
    expect(fallbacks.length).toBeGreaterThan(0)

    for (const [, role, value] of fallbacks)
      expect(generated, role).toContain(`${role}: ${value};`)
  })

  it('встроенные темы проходят собственные правила пакета', () => {
    for (const name of ['light', 'dark'] as const) {
      const theme = extendTheme({ name, base: name, validate: false })
      const issues = validateTheme(theme)

      expect(issues.map(issue => issue.message), name).toEqual([])
    }
  })
})

describe('проверка темы', () => {
  it('заваленный контраст роняет сборку с именем роли', () => {
    expect(() => extendTheme({
      name: 'washed',
      base: 'light',
      // Текст цвета фона — предельный случай: 1:1.
      tokens: { '--gr-fg': '#f8fafc' },
    })).toThrow(GrThemeError)
  })

  it('`validate: false` пропускает заведомо декоративную тему', () => {
    expect(() => extendTheme({
      name: 'washed',
      base: 'light',
      tokens: { '--gr-fg': '#f8fafc' },
      validate: false,
    })).not.toThrow()
  })

  it('неразличимые тона ловятся по ΔE, а не по контрасту', () => {
    const theme = extendTheme({
      name: 'twins',
      base: 'light',
      // `info` в двух шагах от `primary` — тот самый дефект, который пакет
      // однажды поймал у себя.
      tokens: { '--gr-info': '#4f46e5' },
      validate: false,
    })

    const issues = validateTheme(theme).filter(issue => issue.kind === 'distance')

    expect(issues.length).toBeGreaterThan(0)
    expect(issues[0].message).toContain('ΔE')
  })
})

describe('renderThemeCss', () => {
  it('рендерит по готовому набору без пересборки темы', () => {
    const theme = extendTheme({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })

    expect(renderThemeCss({ name: 'ocean', selector: '.x', tokens: theme.tokens })).toContain('.x {')
  })
})
