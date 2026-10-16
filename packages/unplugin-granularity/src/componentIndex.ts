import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

/** Пакеты экосистемы: ядро `@feugene/granularity` и спутники `@feugene/granularity-*`. */
export const GRANULARITY_PACKAGE_PATTERN = /^@feugene\/granularity(?:-[a-z]+)*$/

export interface GranularityComponentEntry {
  /** Пакет, из которого компонент импортируется. */
  readonly packageName: string
  /**
   * Компонент, чей subpath отдаёт модуль. У части составного компонента
   * (`GrListItem`) — родитель (`GrList`): импорт по его подпути guard и
   * селекция granum судят по владельцу с любой версии 2.x, а подпуть самой
   * части сводят к владельцу только с 2.1.
   */
  readonly owner: string
}

export interface GranularityComponentIndex {
  readonly components: ReadonlyMap<string, GranularityComponentEntry>
  /** Имена, которые экспортируют два пакета и больше: их резолвер не трогает. */
  readonly ambiguous: ReadonlySet<string>
}

interface PackageManifest {
  readonly exports?: Record<string, unknown>
  readonly dependencies?: Record<string, string>
  readonly devDependencies?: Record<string, string>
  readonly peerDependencies?: Record<string, string>
}

function readManifest(path: string): PackageManifest | undefined {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as PackageManifest
  }
  catch {
    return undefined
  }
}

/** Пакеты экосистемы, которые приложение объявило в своём `package.json`. */
export function discoverGranularityPackages(root: string): string[] {
  const manifest = readManifest(join(root, 'package.json'))
  if (!manifest)
    return []

  const names = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ])

  return [...names].filter(name => GRANULARITY_PACKAGE_PATTERN.test(name)).sort()
}

function entryTarget(value: unknown): string | undefined {
  if (typeof value === 'string')
    return value
  if (value && typeof value === 'object') {
    const conditions = value as Record<string, unknown>
    return entryTarget(conditions.import ?? conditions.default)
  }
  return undefined
}

/**
 * Компоненты из `exports`: ключ `./components/<Name>` → компонент-владелец
 * модуля. Часть составного компонента публикуется алиасом на модуль родителя
 * (`./components/GrListItem` → `dist/components/GrList/index.js`), и владелец
 * читается из этого пути.
 */
export function componentsOfExports(exports: Record<string, unknown>): Map<string, string> {
  const components = new Map<string, string>()

  for (const [key, value] of Object.entries(exports)) {
    const name = /^\.\/components\/([A-Z]\w*)$/.exec(key)?.[1]
    if (!name)
      continue

    const owner = /\/components\/([A-Z]\w*)\/index\.[cm]?js$/.exec(entryTarget(value) ?? '')?.[1]
    components.set(name, owner ?? name)
  }

  return components
}

/**
 * Индекс «имя компонента → пакет и модуль» по `exports` установленных пакетов.
 *
 * Пакет ищется так же, как его найдёт бандлер приложения, — от `root`. Не
 * установленный пакет пропускается: ссылка на него сломала бы сборку, а не
 * помогла.
 */
export function buildComponentIndex(packages: readonly string[], root: string): GranularityComponentIndex {
  const require = createRequire(join(root, 'package.json'))
  const found = new Map<string, GranularityComponentEntry[]>()

  for (const packageName of packages) {
    let manifestPath: string
    try {
      manifestPath = require.resolve(`${packageName}/package.json`)
    }
    catch {
      continue
    }

    for (const [name, owner] of componentsOfExports(readManifest(manifestPath)?.exports ?? {}))
      found.set(name, [...(found.get(name) ?? []), { packageName, owner }])
  }

  const components = new Map<string, GranularityComponentEntry>()
  const ambiguous = new Set<string>()

  for (const [name, entries] of found) {
    if (entries.length === 1)
      components.set(name, entries[0]!)
    else
      ambiguous.add(name)
  }

  return { components, ambiguous }
}
