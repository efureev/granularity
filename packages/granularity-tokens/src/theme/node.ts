/**
 * Тема из папки — `@feugene/granularity-tokens/theme/node`.
 *
 * Раскладка папки — как у встроенных тем пакета (`themes/<slug>/`):
 * `theme.json`, необязательный `root.json` и `modes/<режим>.json`. Токены
 * компонентов по темам читает не он, а granum по `themesDir` компонента.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { GrColorScheme, GrThemeData } from '../types'
import { defineTheme, type DefineThemeInput, type DefineThemeOptions, type GrModeInput } from './defineTheme'

// Не `new URL(…, import.meta.url)`: сборщик принял бы папку за ассет. Глубина
// пути одна и та же у `src/theme/node.ts` и `dist/theme/node.js`.
const BUILTIN_THEMES = resolve(dirname(fileURLToPath(import.meta.url)), '../../themes')

interface ThemeJson {
  id: string
  title: string
  description?: string
  docs?: string
  extends?: string
  defaultMode?: string
  modes?: { name: string, title?: string, colorScheme?: GrColorScheme }[]
  componentDefaults?: Record<string, Record<string, unknown>>
}

export interface GrThemeSource {
  input: DefineThemeInput
  /** Id темы-базы из `theme.json`, если она есть. */
  extends?: string
  /** Прочитанные файлы: правка любого обязана пересобрать тему (TA-6). */
  sources: string[]
}

export type GrLoadedTheme = GrThemeData & { sources: string[] }

export interface LoadThemeOptions extends Omit<DefineThemeOptions, 'themes'> {
  /** Где искать тему-базу по id, кроме соседних папок и встроенных тем пакета. */
  themeDirs?: readonly string[]
}

const toPath = (dir: string | URL): string => (dir instanceof URL ? fileURLToPath(dir) : resolve(dir))

function readJson<T>(path: string, sources: string[]): T {
  sources.push(path)
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

/** Файл режима: плоские значения либо `{ extends, tokens }`. */
function modeFrom(raw: Record<string, unknown>): GrModeInput {
  const structured = typeof raw.tokens === 'object' && raw.tokens !== null
    && Object.keys(raw).every(key => ['extends', 'tokens', 'title', 'colorScheme'].includes(key))

  if (!structured)
    return { tokens: raw as Record<string, string> }

  return {
    ...(typeof raw.extends === 'string' ? { extends: raw.extends } : {}),
    ...(typeof raw.title === 'string' ? { title: raw.title } : {}),
    ...(raw.colorScheme === 'light' || raw.colorScheme === 'dark' ? { colorScheme: raw.colorScheme } : {}),
    tokens: raw.tokens as Record<string, string>,
  }
}

/** Исходные данные темы из папки — без сборки: её делает `defineTheme`. */
export function readThemeSource(dir: string | URL): GrThemeSource {
  const root = toPath(dir)
  const sources: string[] = []
  const meta = readJson<ThemeJson>(join(root, 'theme.json'), sources)

  const rootPath = join(root, 'root.json')
  const rootTokens = existsSync(rootPath) ? readJson<Record<string, string>>(rootPath, sources) : undefined

  const modesDir = join(root, 'modes')
  const files = existsSync(modesDir)
    ? readdirSync(modesDir).filter(file => file.endsWith('.json')).map(file => file.slice(0, -'.json'.length)).sort()
    : []
  const listed = (meta.modes ?? []).map(mode => mode.name)

  const modes: Record<string, GrModeInput> = {}
  for (const name of [...new Set([...listed, ...files])]) {
    const declared = meta.modes?.find(mode => mode.name === name)
    const fromFile = files.includes(name) ? modeFrom(readJson(join(modesDir, `${name}.json`), sources)) : {}

    modes[name] = {
      ...fromFile,
      ...(declared?.title !== undefined ? { title: declared.title } : {}),
      ...(declared?.colorScheme !== undefined ? { colorScheme: declared.colorScheme } : {}),
    }
  }

  return {
    input: {
      id: meta.id,
      title: meta.title,
      ...(meta.description !== undefined ? { description: meta.description } : {}),
      ...(meta.docs !== undefined ? { docs: meta.docs } : {}),
      ...(meta.extends !== undefined ? { extends: meta.extends } : {}),
      ...(meta.defaultMode !== undefined ? { defaultMode: meta.defaultMode } : {}),
      ...(rootTokens !== undefined ? { root: rootTokens } : {}),
      modes,
      ...(meta.componentDefaults !== undefined ? { componentDefaults: meta.componentDefaults } : {}),
    },
    ...(meta.extends !== undefined ? { extends: meta.extends } : {}),
    sources,
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
  const { sources: parentSources, ...parentData } = parent

  return {
    ...defineTheme(source.input, { ...defineOptions, themes: { [parent.id]: parentData } }),
    sources: [...parentSources, ...source.sources],
  }
}
