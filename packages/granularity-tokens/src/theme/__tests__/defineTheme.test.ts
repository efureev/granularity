import { mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { mixSrgb } from '../color'
import { resolveModes } from '../../modes'
import { defineTheme, NO_COLOR_MIX } from '../defineTheme'
import { GrThemeDefinitionError, GrThemeError } from '../errors'
import { loadTheme, readThemeSource } from '../node'
import { validateTheme } from '../validate'

const slateDir = resolve(process.cwd(), 'themes/slate')
const slate = loadTheme(slateDir)
const source = readThemeSource(slateDir).input

function codeOf(run: () => unknown): string | undefined {
  try {
    run()
  }
  catch (error) {
    return error instanceof GrThemeDefinitionError ? error.code : (error as Error).name
  }
  return undefined
}

describe('defineTheme: slate', () => {
  it('отдаёт данные в форме GranumThemeData', () => {
    expect(slate.id).toBe('slate')
    expect(slate.defaultMode).toBe('light')
    expect(Object.keys(slate.modes)).toEqual(['light', 'dark'])
    expect(slate.modes.dark.colorScheme).toBe('dark')
    expect(Object.keys(slate.root).every(name => !name.startsWith('--'))).toBe(true)
  })

  it('фолбэк производного посчитан от значений своего режима', () => {
    for (const mode of ['light', 'dark'] as const) {
      const tokens = slate.modes[mode].tokens
      const fallback = slate.modes[mode].fallbacks![0]

      expect(fallback.supports).toBe(NO_COLOR_MIX)
      expect(fallback.tokens['gr-primary-hover']).toBe(mixSrgb(tokens['gr-primary'], tokens['gr-fg'], 92))
    }
  })

  it('`sources` называет все прочитанные файлы — и раздела компонентов, кроме пояснений', () => {
    const files = (readdirSync(slateDir, { recursive: true }) as string[])
      .filter(file => /\.(?:json|css)$/.test(file) && !['notes.json', 'theme.lock.json'].includes(file))
      .sort()
    expect(files).toEqual(expect.arrayContaining(['modes/dark.json', 'modes/light.json', 'root.json', 'theme.json', 'components/@feugene/granularity/GrButton/root.json']))
    expect(slate.sources.map(path => path.slice(slateDir.length + 1)).sort()).toEqual(files)
  })
})

describe('defineTheme: полнота и форма', () => {
  it('неполная тема падает с именем токена и режима', () => {
    const { 'gr-info-light': _dropped, ...dark } = source.modes!.dark.tokens!
    const run = (): unknown => defineTheme({ ...source, modes: { ...source.modes, dark: { ...source.modes!.dark, tokens: dark } } }, { validate: false })

    expect(codeOf(run)).toBe('theme-incomplete')
    expect(run).toThrow(/dark: gr-info-light/)
  })

  it('токен не из реестра — ошибка, а не мусор в CSS', () => {
    const run = (): unknown => defineTheme({ ...source, root: { ...source.root, 'gr-made-up': '1px' } }, { validate: false })

    expect(codeOf(run)).toBe('unknown-token')
    expect(run).toThrow(/gr-made-up/)
  })

  it('ключ с `--` отвергается', () => {
    expect(codeOf(() => defineTheme({ ...source, root: { '--gr-space-1': '4px' } }, { validate: false }))).toBe('unknown-token')
  })

  it('id темы — slug, имя режима — slug без дефиса и не `root`', () => {
    expect(codeOf(() => defineTheme({ ...source, id: 'Slate' }, { validate: false }))).toBe('invalid-theme-id')
    expect(codeOf(() => defineTheme({ ...source, modes: { ...source.modes, 'high-contrast': { colorScheme: 'light' } } }, { validate: false }))).toBe('invalid-mode-name')
    expect(codeOf(() => defineTheme({ ...source, modes: { ...source.modes, root: { colorScheme: 'light' } } }, { validate: false }))).toBe('invalid-mode-name')
  })

  it('цикл режимов называет цепочку', () => {
    const run = (): unknown => defineTheme({
      ...source,
      modes: { ...source.modes, a: { colorScheme: 'dark', extends: 'b' }, b: { colorScheme: 'dark', extends: 'a' } },
    }, { validate: false })

    expect(codeOf(run)).toBe('mode-extends-cycle')
  })

  it('провальный контраст роняет сборку с именем режима', () => {
    const run = (): unknown => defineTheme({
      ...source,
      modes: { ...source.modes, dark: { ...source.modes!.dark, tokens: { ...source.modes!.dark.tokens, 'gr-fg': '#0f172a' } } },
    })

    expect(run).toThrow(GrThemeError)
    expect(run).toThrow(/dark: /)
  })
})

describe('defineTheme: наследование', () => {
  it('режим с `extends` хранит только отличия, а резолвится полностью', () => {
    const theme = defineTheme({
      ...source,
      modes: { ...source.modes, ocean: { colorScheme: 'dark', title: 'Океан', extends: 'dark', tokens: { 'gr-primary': '#4fd1e0', 'gr-bg': slate.modes.dark.tokens['gr-bg'] } } },
    }, { validate: false })

    expect(theme.modes.ocean.extends).toBe('dark')
    expect(theme.modes.ocean.tokens).toEqual({ 'gr-primary': '#4fd1e0' })
    expect(resolveModes(theme).get('ocean')!['gr-card']).toBe(slate.modes.dark.tokens['gr-card'])
    expect(theme.modes.ocean.fallbacks![0].tokens['gr-primary-hover'])
      .toBe(mixSrgb('#4fd1e0', slate.modes.dark.tokens['gr-fg'], 92))
  })

  it('тема от темы объявляет только отличия, данные — полные', () => {
    const { sources: _sources, ...base } = slate
    const clay = defineTheme({
      id: 'clay',
      title: 'Глина',
      extends: 'slate',
      root: { 'gr-radius-md': '10px' },
      modes: { light: { tokens: { 'gr-primary': '#4338ca' } } },
      componentDefaults: { GrButton: { loadingIndicator: 'shimmer' } },
    }, { validate: false, themes: { slate: base } })

    expect(clay.root['gr-radius-md']).toBe('10px')
    expect(clay.root['gr-space-1']).toBe(slate.root['gr-space-1'])
    expect(clay.modes.light.tokens['gr-primary']).toBe('#4338ca')
    expect(clay.modes.light.tokens['gr-bg']).toBe(slate.modes.light.tokens['gr-bg'])
    expect(clay.modes.dark.colorScheme).toBe('dark')
    expect(clay.extensions).toEqual({ granularity: { componentDefaults: { GrButton: { loadingIndicator: 'shimmer' } } } })
  })

  it('база по id без данных — ошибка с подсказкой', () => {
    expect(codeOf(() => defineTheme({ id: 'clay', title: 'Глина', extends: 'slate' }))).toBe('theme-extends-unresolved')
  })

  it('loadTheme находит встроенную тему-базу по id и отдаёт файлы обеих в `sources`', () => {
    const dir = join(mkdtempSync(join(tmpdir(), 'gr-theme-')), 'brand')
    mkdirSync(join(dir, 'modes'), { recursive: true })
    writeFileSync(join(dir, 'theme.json'), JSON.stringify({ id: 'brand', title: 'Бренд', extends: 'slate', modes: { dark: {}, dim: { extends: 'dark' } } }))
    writeFileSync(join(dir, 'modes/dark.json'), JSON.stringify({ 'gr-primary': '#a5b4fc' }))
    writeFileSync(join(dir, 'modes/dim.json'), JSON.stringify({ 'gr-bg': '#1e293b' }))

    const brand = loadTheme(dir, { validate: false })

    expect(brand.modes.dark.tokens['gr-primary']).toBe('#a5b4fc')
    expect(brand.modes.dim.extends).toBe('dark')
    expect(brand.modes.dim.colorScheme).toBe('dark')
    expect(brand.sources).toContain(join(dir, 'modes/dim.json'))
    expect(brand.sources).toContain(join(slateDir, 'theme.json'))
    // Тема каталога в цепочке — для токенов компонентов, которых у темы приложения нет.
    expect(brand.extends).toBe('slate')
  })

  it('тема от темы приложения называет в `extends` тему каталога, а не соседа', () => {
    const root = mkdtempSync(join(tmpdir(), 'gr-theme-'))
    for (const [id, base] of [['brand', 'slate'], ['night', 'brand']] as const) {
      mkdirSync(join(root, id), { recursive: true })
      writeFileSync(join(root, id, 'theme.json'), JSON.stringify({ id, title: id, extends: base }))
    }

    const night = loadTheme(join(root, 'night'), { validate: false })

    expect(night.extends).toBe('slate')
    expect(night.sources).toContain(join(root, 'brand/theme.json'))
    expect(loadTheme(slateDir).extends).toBeUndefined()
  })
})

describe('validateTheme: производное, переопределённое темой', () => {
  // Заливка с тёмной подписью: формула реестра темнит её примесью `--gr-fg`,
  // и наведение проваливает контраст. Тема уводит наведение в сторону карточки —
  // проверяться обязано её состояние, а не реестровое.
  const tokens = {
    ...Object.fromEntries(Object.entries(slate.modes.light.tokens).map(([name, value]) => [`--${name}`, value])),
    '--gr-primary': '#c8693f',
    '--gr-primary-fg': '#1b1a17',
    '--gr-fg': '#1b1a17',
  }

  it('без переопределения — провал на реестровом состоянии', () => {
    const issues = validateTheme({ name: 'light', tokens }).filter(issue => issue.token === '--gr-primary-fg')

    expect(issues.map(issue => issue.against)).toContain('--gr-primary (84%)')
  })

  it('с переопределением — проверено состояние темы', () => {
    const own = {
      ...tokens,
      '--gr-primary-hover': 'color-mix(in srgb, var(--gr-primary) 88%, var(--gr-card))',
      '--gr-primary-active': 'color-mix(in srgb, var(--gr-primary) 80%, var(--gr-card))',
    }

    expect(validateTheme({ name: 'light', tokens: own }).filter(issue => issue.token === '--gr-primary-fg')).toEqual([])
  })
})

describe('defineTheme: значения компонентов, версия и целевые пакеты', () => {
  const UI = '@feugene/granularity'
  const base = defineTheme({
    ...source,
    version: '1.0.0',
    targets: { [UI]: '^3.0.0' },
    components: { [UI]: { GrCard: { root: { 'gr-card-pad': '4px' }, modes: { light: { 'gr-card-bg': '#fff' } } } } },
  }, { validate: false })

  it('раздел, версия и targets — в данных темы', () => {
    expect(base.version).toBe('1.0.0')
    expect(base.targets).toEqual({ [UI]: '^3.0.0' })
    expect(base.components?.[UI]?.GrCard).toEqual({ root: { 'gr-card-pad': '4px' }, modes: { light: { 'gr-card-bg': '#fff' } } })
  })

  it('наследник: раздел сливается по токену, targets — по пакету, версия только своя', () => {
    const heir = defineTheme({
      id: 'heir',
      title: 'Наследник',
      extends: 'slate',
      targets: { '@feugene/granularity-charts': '^2.0.0' },
      components: {
        [UI]: { GrCard: { modes: { dark: { 'gr-card-bg': '#000' } } } },
        '@feugene/granularity-charts': { GrChart: { root: { 'gr-chart-gap': '2px' } } },
      },
    }, { validate: false, themes: { slate: base } })

    expect(heir.version).toBeUndefined()
    expect(heir.targets).toEqual({ [UI]: '^3.0.0', '@feugene/granularity-charts': '^2.0.0' })
    expect(heir.components?.[UI]?.GrCard).toEqual({ root: { 'gr-card-pad': '4px' }, modes: { light: { 'gr-card-bg': '#fff' }, dark: { 'gr-card-bg': '#000' } } })
    expect(heir.components?.['@feugene/granularity-charts']?.GrChart).toEqual({ root: { 'gr-chart-gap': '2px' } })
  })

  it('значение компонента в режиме, которого у темы нет, — ошибка', () => {
    const run = (): unknown => defineTheme({ ...source, components: { [UI]: { GrCard: { modes: { dim: { 'gr-card-bg': '#111' } } } } } }, { validate: false })
    expect(codeOf(run)).toBe('mode-extends-unresolved')
    expect(run).toThrow(/GrCard → dim/)
  })

  it('ключ раздела с `--` — ошибка, как у токенов темы', () => {
    expect(codeOf(() => defineTheme({ ...source, components: { [UI]: { GrCard: { root: { '--gr-card-pad': '4px' } } } } }, { validate: false }))).toBe('unknown-token')
  })

  it('расширения других потребителей переходят как есть, `componentDefaults` — в `extensions.granularity`', () => {
    const theme = defineTheme({ ...source, extensions: { acme: { density: 'compact' } }, componentDefaults: { GrButton: { loadingIndicator: 'shimmer' } } }, { validate: false })
    expect(theme.extensions).toEqual({ acme: { density: 'compact' }, granularity: { componentDefaults: { GrButton: { loadingIndicator: 'shimmer' } } } })
  })
})

describe('readThemeSource: исходник темы granum', () => {
  function themeDir(themeJson: Record<string, unknown>, files: Record<string, unknown> = {}): string {
    const dir = join(mkdtempSync(join(tmpdir(), 'gr-theme-')), 'own')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'theme.json'), JSON.stringify(themeJson))
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(join(dir, path, '..'), { recursive: true })
      writeFileSync(join(dir, path), JSON.stringify(content))
    }
    return dir
  }

  it('`componentDefaults` — из `extensions.granularity`, раздел компонентов — из `components/`', () => {
    const { input } = readThemeSource(themeDir(
      { id: 'own', title: 'Своя', extends: 'slate', targets: { '@feugene/granularity': '^3.0.0' }, modes: { light: {} }, extensions: { granularity: { componentDefaults: { GrButton: { loadingIndicator: 'shimmer' } } } } },
      { 'components/@feugene/granularity/GrCard/root.json': { 'gr-card-pad': '4px' }, 'notes.json': { why: 'пояснение' } },
    ))
    expect(input.componentDefaults).toEqual({ GrButton: { loadingIndicator: 'shimmer' } })
    expect(input.extensions).toBeUndefined()
    expect(input.components).toEqual({ '@feugene/granularity': { GrCard: { root: { 'gr-card-pad': '4px' } } } })
  })

  it('фолбэки режима в исходнике — ошибка: их считает сборка темы', () => {
    const dir = themeDir({ id: 'own', title: 'Своя', extends: 'slate', modes: { light: { fallbacks: [{ supports: 'x', tokens: { 'gr-primary-hover': '#000' } }] } } })
    expect(codeOf(() => readThemeSource(dir))).toBe('unknown-token')
  })

  it('посторонний файл — ошибка загрузчика granum, а не пропуск', () => {
    const dir = themeDir({ id: 'own', title: 'Своя', extends: 'slate' }, { 'palette.json': { a: 1 } })
    expect(() => readThemeSource(dir)).toThrow(/unexpected entry/)
  })
})
