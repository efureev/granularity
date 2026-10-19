import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import slateData from '@feugene/granularity-tokens/themes/slate/theme.json'

import type { GrModeName } from '../composables/useTheme'

/**
 * Тема в тестах ядра — данными и готовым CSS.
 *
 * Данные: значения ролей — из пакета токенов, токены компонентов — из
 * `GrX/themes/<тема>/`. CSS — тот, что получает потребитель без granum
 * (`scripts/theme-css.mjs`, тот же `emitCss`, что у сборки приложения): jsdom
 * считает по нему каскад и наследование.
 *
 * Пути — от cwd пакета: в jsdom `import.meta.url` не file-scheme.
 */
const pkgDir = process.cwd()

export const THEME = 'slate'

type TokenMap = Record<string, string>

const slate = slateData as { root: TokenMap, modes: Record<GrModeName, { tokens: TokenMap }> }

/** Режимы темы — из её данных: набор держит тема, а не тест. */
export const MODES: readonly GrModeName[] = Object.keys(slate.modes)

/** Пара активации режима — значение `data-theme`. */
export const pair = (mode: GrModeName): string => `${THEME}-${mode}`

let cachedCss: string | undefined

export function themeCss(): string {
  cachedCss ??= execFileSync('node', ['scripts/theme-css.mjs', '--stdout', THEME], { cwd: pkgDir, encoding: 'utf8' })
  return cachedCss
}

function withDashes(tokens: TokenMap | undefined): TokenMap {
  return Object.fromEntries(Object.entries(tokens ?? {}).map(([name, value]) => [`--${name}`, value]))
}

/** Примитивы и роли режима — как их видит элемент без собственных объявлений. */
export function themeVars(mode: GrModeName): TokenMap {
  return { ...withDashes(slate.root), ...withDashes(slate.modes[mode].tokens) }
}

function readJson(path: string): TokenMap | undefined {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) as TokenMap : undefined
}

/** Токены компонента в режиме: `root.json` и файл режима поверх. */
export function componentThemeVars(component: string, mode: GrModeName): TokenMap {
  const dir = resolve(pkgDir, 'src/components', component, 'themes', THEME)

  return { ...withDashes(readJson(join(dir, 'root.json'))), ...withDashes(readJson(join(dir, 'modes', `${mode}.json`))) }
}

export function themedComponents(): string[] {
  const dir = resolve(pkgDir, 'src/components')

  return readdirSync(dir).filter(name => existsSync(join(dir, name, 'themes', THEME))).sort()
}

/** Токены компонентов, значение которых хотя бы в одном режиме ссылается на `var()`. */
export function componentFormulaTokens(): string[] {
  const names = themedComponents().flatMap(component => MODES.flatMap(mode =>
    Object.entries(componentThemeVars(component, mode)).filter(([, value]) => value.includes('var(')).map(([name]) => name)))

  return [...new Set(names)].sort()
}
