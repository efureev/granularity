/**
 * Тема из папки — `@feugene/granularity-tokens/theme/node`.
 *
 * Раскладка — исходник темы granum (C-42): `theme.json`, `root.json`,
 * `modes/<режим>.json`, `base.css`, `components/<пакет>/<Компонент>/`. Читает её
 * загрузчик granum — строго, посторонний файл называется ошибкой; `notes.json`
 * (пояснения для доки) и `theme.lock.json` (версия по данным) — не данные темы.
 * Сверху — проверка дизайн-системы `defineTheme`: полнота по реестру, контраст,
 * фолбэки производных.
 */
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadThemeSource } from '@feugene/granum/node'
import type { GrThemeData } from '../types'
import { defineTheme, type DefineThemeInput, type DefineThemeOptions, type GrModeInput } from './defineTheme'
import { GrThemeDefinitionError } from './errors'

// Не `new URL(…, import.meta.url)`: сборщик принял бы папку за ассет. Глубина
// пути одна и та же у `src/theme/node.ts` и `dist/theme/node.js`.
const BUILTIN_THEMES = resolve(dirname(fileURLToPath(import.meta.url)), '../../themes')

/** Файлы папки темы, которые не данные темы. */
export const GR_THEME_SOURCE_IGNORE: readonly string[] = ['notes.json', 'theme.lock.json']

export interface GrThemeSource {
  input: DefineThemeInput
  /** Id темы-базы из `theme.json`, если она есть. */
  extends?: string
  /** Прочитанные файлы: правка любого обязана пересобрать тему (TA-6). */
  sources: string[]
}

/**
 * Тема приложения для записи `themes` конфига granum: полные данные и
 * `extends` — id ближайшей темы каталога в цепочке. `sources` — файлы, правка
 * которых перезагружает конфиг в dev.
 */
export type GrLoadedTheme = GrThemeData & { extends?: string, sources: string[] }

export interface LoadThemeOptions extends Omit<DefineThemeOptions, 'themes'> {
  /** Где искать тему-базу по id, кроме соседних папок и встроенных тем пакета. */
  themeDirs?: readonly string[]
}

const toPath = (dir: string | URL): string => (dir instanceof URL ? fileURLToPath(dir) : resolve(dir))

interface SourceMode {
  title?: string
  colorScheme?: 'light' | 'dark'
  extends?: string
  tokens?: Readonly<Record<string, string>>
  fallbacks?: unknown
}

/** Исходные данные темы из папки — без сборки: её делает `defineTheme`. */
export function readThemeSource(dir: string | URL): GrThemeSource {
  const root = toPath(dir)
  const { sources, extends: base, ...theme } = loadThemeSource(root, { ignore: GR_THEME_SOURCE_IGNORE })
  if (typeof base === 'object')
    throw new GrThemeDefinitionError('theme-extends-unresolved', `${root}: тема наследует тему по id, а не объектом`)

  const modes: Record<string, GrModeInput> = {}
  for (const [name, mode] of Object.entries((theme.modes ?? {}) as Readonly<Record<string, SourceMode>>)) {
    // Фолбэки производных считает `defineTheme` по значениям темы: записанные руками устарели бы на первой правке цвета.
    if (mode.fallbacks !== undefined)
      throw new GrThemeDefinitionError('unknown-token', `${root}: режим "${name}" несёт fallbacks — их считает сборка темы, уберите их из theme.json`)
    modes[name] = {
      ...(mode.title !== undefined ? { title: mode.title } : {}),
      ...(mode.colorScheme !== undefined ? { colorScheme: mode.colorScheme } : {}),
      ...(mode.extends !== undefined ? { extends: mode.extends } : {}),
      ...(mode.tokens !== undefined ? { tokens: mode.tokens } : {}),
    }
  }

  const { granularity, ...otherExtensions } = (theme.extensions ?? {}) as { granularity?: { componentDefaults?: DefineThemeInput['componentDefaults'] } }
  return {
    input: {
      id: theme.id,
      title: theme.title,
      ...(theme.description !== undefined ? { description: theme.description } : {}),
      ...(theme.docs !== undefined ? { docs: theme.docs } : {}),
      ...(theme.version !== undefined ? { version: theme.version } : {}),
      ...(theme.targets !== undefined ? { targets: theme.targets } : {}),
      ...(base !== undefined ? { extends: base } : {}),
      ...(theme.defaultMode !== undefined ? { defaultMode: theme.defaultMode } : {}),
      ...(theme.root !== undefined ? { root: theme.root } : {}),
      modes,
      ...(theme.baseCss !== undefined ? { baseCss: theme.baseCss } : {}),
      ...(theme.components !== undefined ? { components: theme.components } : {}),
      ...(granularity?.componentDefaults !== undefined ? { componentDefaults: granularity.componentDefaults } : {}),
      ...(Object.keys(otherExtensions).length > 0 ? { extensions: otherExtensions } : {}),
    },
    ...(base !== undefined ? { extends: base } : {}),
    sources: [...(sources ?? [])],
  }
}

/**
 * Собирает тему из папки. Тема-база по id ищется рядом (соседняя папка с тем же
 * именем), затем в `themeDirs`, затем среди встроенных тем пакета, — так своя
 * тема приложения пишет `"extends": "slate"` и объявляет только отличия.
 */
export function loadTheme(dir: string | URL, options: LoadThemeOptions = {}): GrLoadedTheme {
  const root = toPath(dir)
  const source = readThemeSource(root)
  const { themeDirs = [], ...defineOptions } = options

  if (source.extends === undefined)
    return { ...defineTheme(source.input, defineOptions), sources: source.sources }

  const candidates = [dirname(root), ...themeDirs.map(toPath), BUILTIN_THEMES]
    .map(base => join(base, source.extends!))
    .filter(candidate => candidate !== root && existsSync(join(candidate, 'theme.json')))

  if (candidates.length === 0)
    return { ...defineTheme(source.input, defineOptions), sources: source.sources }

  const parent = loadTheme(candidates[0], options)
  const { sources: parentSources, extends: parentCatalog, ...parentData } = parent
  const catalog = dirname(candidates[0]) === BUILTIN_THEMES ? parent.id : parentCatalog

  return {
    ...defineTheme(source.input, { ...defineOptions, themes: { [parent.id]: parentData } }),
    ...(catalog !== undefined ? { extends: catalog } : {}),
    sources: [...parentSources, ...source.sources],
  }
}
