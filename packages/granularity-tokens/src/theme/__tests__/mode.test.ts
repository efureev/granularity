import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { grRoleTokens } from '../../generated'
import { grBuiltinModes } from '../builtin.generated'
import { mixSrgb } from '../color'
import { GrThemeDefinitionError, GrThemeError } from '../errors'
import { createMode, extendMode, renderModeCss } from '../mode'
import { loadTheme } from '../node'
import { validateTheme } from '../validate'

const OCEAN = {
  '--gr-bg': '#041e2b',
  '--gr-card': '#0a2f42',
} as const

describe('наследование', () => {
  it('незаданная роль приходит из базы, заданная — побеждает', () => {
    const theme = extendMode({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })
    const dark = grBuiltinModes.dark

    expect(theme.tokens['--gr-bg']).toBe('#041e2b')
    expect(theme.tokens['--gr-popover']).toBe(dark['--gr-popover'])
  })

  it('набор полон по построению: все роли пакета на месте', () => {
    const theme = extendMode({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })

    expect(Object.keys(theme.tokens).sort()).toEqual(grRoleTokens.map(token => token.name).sort())
  })

  it('базой может быть другой собранный режим', () => {
    const ocean = extendMode({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })
    const deep = extendMode({ name: 'deep', base: ocean, tokens: { '--gr-card': '#062231' }, validate: false })

    expect(deep.tokens['--gr-bg']).toBe('#041e2b')
    expect(deep.tokens['--gr-card']).toBe('#062231')
  })

  it('роль не из пакета — ошибка с объяснением, а не молчаливый мусор в CSS', () => {
    expect(() => extendMode({
      name: 'ocean',
      base: 'dark',
      tokens: { '--gr-radius-md': '10px' },
      validate: false,
    })).toThrow(/--gr-radius-md/)
  })
})

describe('CSS режима', () => {
  const theme = extendMode({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })

  it('селектор по умолчанию — пара режима темы базы, но его можно задать', () => {
    expect(theme.selector).toBe('[data-theme="slate-ocean"]')
    expect(theme.css).toContain('[data-theme="slate-ocean"] {')

    const scoped = extendMode({ name: 'ocean', base: 'dark', selector: '.ocean', validate: false })
    expect(scoped.css).toContain('.ocean {')
  })

  it('объявляет все роли пакета', () => {
    for (const token of grRoleTokens)
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
    const theme = extendMode({
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
 * Композиция режима и сборка темы обязаны считать одно и то же: если они
 * разойдутся, тема потребителя будет отличаться от встроенной ровно на эту
 * разницу. CSS ядра генератор пишет из `defineTheme`, так что сверка с ним —
 * сверка и с CSS.
 */
describe('согласие с defineTheme', () => {
  const slate = loadTheme(resolve(process.cwd(), 'themes/slate'))

  it.each(['light', 'dark'] as const)('пересобранный режим %s совпадает с темой slate', (name) => {
    const theme = extendMode({ name, base: name, validate: false })
    const mode = slate.modes[name]

    for (const token of grRoleTokens)
      expect(theme.tokens[token.name], token.name).toBe(mode.tokens[token.name.slice(2)])

    // Фолбэки — та же формула на тех же значениях.
    const fallbacks = [...theme.css.matchAll(/(--gr-[\w-]+-(?:hover|active)):\s*(#[\da-f]{6});/gi)]
    expect(fallbacks.length).toBeGreaterThan(0)

    // Под тот же шаблон попадают и роли-состояния solid: они значения, не формулы.
    for (const [, role, value] of fallbacks)
      expect(mode.fallbacks?.[0]?.tokens[role.slice(2)] ?? mode.tokens[role.slice(2)], role).toBe(value)
  })

  it('встроенные темы проходят собственные правила пакета', () => {
    for (const name of ['light', 'dark'] as const) {
      const theme = extendMode({ name, base: name, validate: false })
      const issues = validateTheme(theme)

      expect(issues.map(issue => issue.message), name).toEqual([])
    }
  })
})

describe('проверка темы', () => {
  it('заваленный контраст роняет сборку с именем роли', () => {
    expect(() => extendMode({
      name: 'washed',
      base: 'light',
      // Текст цвета фона — предельный случай: 1:1.
      tokens: { '--gr-fg': '#f8fafc' },
    })).toThrow(GrThemeError)
  })

  it('`validate: false` пропускает заведомо декоративную тему', () => {
    expect(() => extendMode({
      name: 'washed',
      base: 'light',
      tokens: { '--gr-fg': '#f8fafc' },
      validate: false,
    })).not.toThrow()
  })

  it('неразличимые тона ловятся по ΔE, а не по контрасту', () => {
    const theme = extendMode({
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

describe('renderModeCss', () => {
  it('рендерит по готовому набору без пересборки темы', () => {
    const theme = extendMode({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })

    expect(renderModeCss({ name: 'ocean', selector: '.x', tokens: theme.tokens })).toContain('.x {')
  })
})

/**
 * Режим без базы. «Без базы» — это не «ни от чего не наследуется»: в CSS так
 * нельзя, и незаявленная роль пришла бы из `:root`, то есть из светлой темы.
 * Независимость обеспечивается ровно тем, что здесь проверяется, — полнотой.
 */
describe('режим с нуля', () => {
  const full = { ...grBuiltinModes.dark }

  it('с полным набором собирается и даёт те же роли, что `extendMode`', () => {
    const scratch = createMode({ name: 'scratch', tokens: full, validate: false })
    const extended = extendMode({ name: 'scratch', base: 'dark', validate: false })

    expect(scratch.tokens).toEqual(extended.tokens)
    expect(scratch.css).toBe(extended.css)
  })

  it('без части ролей падает со списком и объяснением про `:root`', () => {
    const partial = { ...full }
    delete partial['--gr-success-solid']
    delete partial['--gr-info-light']

    expect(() => createMode({ name: 'scratch', tokens: partial, validate: false })).toThrow(GrThemeDefinitionError)

    try {
      createMode({ name: 'scratch', tokens: partial, validate: false })
    }
    catch (error) {
      const message = (error as Error).message

      // Ошибка обязана называть настоящую причину: не «ниоткуда», а из светлой темы.
      expect(message).toContain(':root')
      expect(message).toContain('extendMode')
      expect(message).toContain('не задаёт 2 ролей')
      expect(message).toContain('--gr-success-solid')
      expect(message).toContain('--gr-info-light')
    }
  })

  it('фолбэк производных считается и здесь — базы у него нет, значения свои', () => {
    const scratch = createMode({ name: 'scratch', tokens: full, validate: false })
    const expected = mixSrgb(full['--gr-primary'], full['--gr-fg'], 92)

    expect(scratch.css).toContain(`--gr-primary-hover: ${expected};`)
  })

  it('проверка контраста работает так же, как у темы с базой', () => {
    expect(() => createMode({ name: 'scratch', tokens: { ...full, '--gr-fg': full['--gr-bg'] } }))
      .toThrow(GrThemeError)
  })
})

/**
 * Режим — вход `modes.define` granum: туда уезжают только отличия от базы, а
 * `extends` называет режим темы, от которого granum возьмёт токены компонентов.
 */
describe('режим входом modes.define', () => {
  it('роли — только отличия от базы, без `--`; токены компонентов — все заданные', () => {
    const ocean = extendMode({
      name: 'ocean',
      base: 'dark',
      title: 'Океан',
      tokens: OCEAN,
      componentTokens: { '--gr-button-primary-bg': 'var(--gr-primary)' },
      validate: false,
    })

    expect(ocean.definition).toEqual({
      extends: 'dark',
      colorScheme: 'dark',
      title: 'Океан',
      tokens: { 'gr-bg': '#041e2b', 'gr-card': '#0a2f42', 'gr-button-primary-bg': 'var(--gr-primary)' },
    })
  })

  it('ключи без `--` тоже принимаются', () => {
    const mode = extendMode({ name: 'ocean', base: 'dark', tokens: { 'gr-bg': '#041e2b' }, validate: false })

    expect(mode.tokens['--gr-bg']).toBe('#041e2b')
    expect(mode.definition.tokens).toEqual({ 'gr-bg': '#041e2b' })
  })

  it('режим с нуля несёт все роли и наследует режим встроенной темы со своей схемой', () => {
    const scratch = createMode({ name: 'scratch', tokens: { ...grBuiltinModes.dark }, colorScheme: 'dark', validate: false })

    expect(scratch.definition.extends).toBe('dark')
    expect(Object.keys(scratch.definition.tokens)).toHaveLength(grRoleTokens.length)
    expect(createMode({ name: 'scratch', tokens: { ...grBuiltinModes.light }, validate: false }).definition.extends).toBe('light')
  })

  it('режим поверх собранного режима наследует его, а не встроенный', () => {
    const ocean = extendMode({ name: 'ocean', base: 'dark', tokens: OCEAN, validate: false })
    const deep = extendMode({ name: 'deep', base: ocean, tokens: { '--gr-card': '#062231' }, validate: false })

    expect(deep.definition).toMatchObject({ extends: 'ocean', colorScheme: 'dark', tokens: { 'gr-card': '#062231' } })
  })
})

describe('база — любой режим любой темы', () => {
  const slate = loadTheme(resolve(process.cwd(), 'themes/slate'))
  const brand = { ...slate, id: 'brand', modes: { ...slate.modes, dim: { colorScheme: 'dark' as const, extends: 'dark', tokens: { 'gr-bg': '#101418' } } } }

  it('режим темы данными: значения по цепочке `extends`, пара и схема — её', () => {
    const mode = extendMode({ name: 'night', base: { theme: brand, mode: 'dim' }, tokens: { '--gr-card': '#171c22' }, validate: false })

    expect(mode.tokens['--gr-bg']).toBe('#101418')
    expect(mode.tokens['--gr-popover']).toBe(grBuiltinModes.dark['--gr-popover'])
    expect(mode.selector).toBe('[data-theme="brand-night"]')
    expect(mode.definition).toMatchObject({ extends: 'dim', colorScheme: 'dark', tokens: { 'gr-card': '#171c22' } })
  })

  it('неизвестный режим темы или встроенной — ошибка с перечнем', () => {
    expect(() => extendMode({ name: 'x', base: { theme: brand, mode: 'sepia' } })).toThrow(/нет режима "sepia".*light, dark, dim/)
    expect(() => extendMode({ name: 'x', base: 'sepia' as 'light' })).toThrow(GrThemeDefinitionError)
  })

  it('имя режима — slug без дефиса: пара разбирается по последнему дефису', () => {
    expect(() => extendMode({ name: 'deep-sea', base: 'dark', validate: false })).toThrow(/имя режима "deep-sea"/)
  })
})
