import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

import { GR_BASE_THEME_ID, grThemeCatalog, resolveModes, type GrColorScheme, type GrThemeData } from '@feugene/granularity-tokens'

import type { GrModeName, GrThemeId } from '../composables/useTheme'

/**
 * Темы в тестах ядра — данными и готовым CSS, по всем темам каталога и всем их
 * режимам: набор держит каталог пакета токенов, а не тест.
 *
 * Данные — из пакета токенов: роли и значения компонентов (раздел `components`
 * темы) по правилу granum: режим, его цепочка `extends`, затем режим по
 * умолчанию. Наследование тем в данных уже раскрыто. CSS — тот, что
 * получает потребитель без granum (`scripts/theme-css.mjs`): jsdom считает по
 * нему каскад и наследование.
 *
 * Пути — от cwd пакета: в jsdom `import.meta.url` не file-scheme.
 */
const pkgDir = process.cwd()
const requireFromPackage = createRequire(join(pkgDir, 'package.json'))

type TokenMap = Record<string, string>

export const DEFAULT_THEME: GrThemeId = GR_BASE_THEME_ID

export const THEMES: readonly GrThemeId[] = grThemeCatalog.map(entry => entry.id)

/** Контекст гейта: тема, её режим и пара активации — ключ во всех картах. */
export interface ThemeMode {
  readonly theme: GrThemeId
  readonly mode: GrModeName
  readonly colorScheme: GrColorScheme
  readonly key: string
}

/** Пара активации — значение `data-theme`. */
export const pair = (theme: GrThemeId, mode: GrModeName): string => `${theme}-${mode}`

export const THEME_MODES: readonly ThemeMode[] = grThemeCatalog.flatMap(entry => entry.modes.map(mode => ({
  theme: entry.id,
  mode: mode.name,
  colorScheme: mode.colorScheme,
  key: pair(entry.id, mode.name),
})))

export function themeModeOf(key: string): ThemeMode {
  const found = THEME_MODES.find(context => context.key === key)
  if (!found)
    throw new Error(`нет режима темы "${key}" в каталоге: ${THEME_MODES.map(context => context.key).join(', ')}`)

  return found
}

/** Режимы темы в порядке каталога. */
export function modesOf(theme: GrThemeId): ThemeMode[] {
  return THEME_MODES.filter(context => context.theme === theme)
}

function catalogEntry(theme: GrThemeId) {
  const entry = grThemeCatalog.find(candidate => candidate.id === theme)
  if (!entry)
    throw new Error(`нет темы "${theme}" в каталоге`)

  return entry
}

const dataCache = new Map<GrThemeId, GrThemeData>()

/** Полные данные темы — те, что каталог отдаёт granum из `dist` пакета токенов. */
export function themeData(theme: GrThemeId): GrThemeData {
  let data = dataCache.get(theme)
  if (!data) {
    data = JSON.parse(readFileSync(requireFromPackage.resolve(`@feugene/granularity-tokens/themes/${theme}/theme.json`), 'utf8')) as GrThemeData
    dataCache.set(theme, data)
  }

  return data
}

const cssCache = new Map<GrThemeId, string>()

export function themeCss(theme: GrThemeId = DEFAULT_THEME): string {
  let css = cssCache.get(theme)
  if (css === undefined) {
    css = execFileSync('node', ['scripts/theme-css.mjs', '--stdout', theme], { cwd: pkgDir, encoding: 'utf8' })
    cssCache.set(theme, css)
  }

  return css
}

const partCache = new Map<string, string>()

/** Часть темы — `root` или режим: файл `themes/<тема>/<часть>.css`. */
export function themePartCss(theme: GrThemeId, part: string): string {
  const key = `${theme}/${part}`
  let css = partCache.get(key)
  if (css === undefined) {
    css = execFileSync('node', ['scripts/theme-css.mjs', '--stdout', theme, part], { cwd: pkgDir, encoding: 'utf8' })
    partCache.set(key, css)
  }

  return css
}

function withDashes(tokens: Readonly<TokenMap> | undefined): TokenMap {
  return Object.fromEntries(Object.entries(tokens ?? {}).map(([name, value]) => [`--${name}`, value]))
}

/** Примитивы и роли режима — как их видит элемент без собственных объявлений. */
export function themeVars(key: string): TokenMap {
  const { theme, mode } = themeModeOf(key)
  const data = themeData(theme)

  return { ...withDashes(data.root), ...withDashes(resolveModes(data).get(mode)) }
}

/** Режим, его предки по `extends` и режим по умолчанию — порядок поиска токена компонента. */
function modeSequence(theme: GrThemeId, mode: GrModeName): GrModeName[] {
  const data = themeData(theme)
  const sequence: GrModeName[] = []
  for (let name: GrModeName | undefined = mode; name !== undefined && !sequence.includes(name); name = data.modes[name]?.extends)
    sequence.push(name)
  const fallback = data.defaultMode ?? catalogEntry(theme).defaultMode
  if (!sequence.includes(fallback))
    sequence.push(fallback)

  return sequence
}

const PACKAGE_ID = '@feugene/granularity'

function componentValues(component: string, theme: GrThemeId) {
  return themeData(theme).components?.[PACKAGE_ID]?.[component]
}

/** Токены компонента в режиме темы: `root` раздела, затем ближайший режим цепочки. */
export function componentThemeVars(component: string, key: string): TokenMap {
  const { theme, mode } = themeModeOf(key)
  const values = componentValues(component, theme)
  const modes: TokenMap = {}
  for (const name of modeSequence(theme, mode).reverse())
    Object.assign(modes, values?.modes?.[name])

  return { ...withDashes(values?.root), ...withDashes(modes) }
}

/** Компоненты со своими значениями хотя бы в одной теме каталога. */
export function themedComponents(): string[] {
  return [...new Set(THEMES.flatMap(theme => Object.keys(themeData(theme).components?.[PACKAGE_ID] ?? {})))].sort()
}

/** Токены компонентов темы, значение которых хотя бы в одном её режиме ссылается на `var()`. */
export function componentFormulaTokens(theme: GrThemeId = DEFAULT_THEME): string[] {
  const names = themedComponents().flatMap(component => modesOf(theme).flatMap(({ key }) =>
    Object.entries(componentThemeVars(component, key)).filter(([, value]) => value.includes('var(')).map(([name]) => name)))

  return [...new Set(names)].sort()
}
