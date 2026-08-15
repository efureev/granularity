import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

/** Файл исходников с путём относительно корня скана. */
export interface SourceFile {
  path: string
  source: string
}

export interface ReadSourcesOptions {
  /** Корень скана; по умолчанию — `<cwd>/src` пакета. */
  dir?: string
  /**
   * Директории **верхнего уровня**, которые не сканируются. Сюда идёт
   * сгенерированное: `styles/` и `tokens/` ядра обязаны содержать литералы —
   * они и есть определения токенов.
   */
  excludeTopDirs?: readonly string[]
  /** Расширения файлов, попадающих в выборку. */
  extensions?: RegExp
}

const DEFAULT_EXTENSIONS = /\.(?:vue|ts|css)$/

/** Корень исходников пакета — от cwd, а не от `import.meta.url`. */
export function packageSrcDir(): string {
  // В jsdom `import.meta.url` не file-scheme, поэтому путь считается от cwd:
  // vitest запускается из директории пакета.
  return resolve(process.cwd(), 'src')
}

/**
 * Исходники пакета — рекурсивно, без тестов.
 *
 * `__tests__` пропускается всегда: гейт, читающий собственные фикстуры, ловит
 * в них свои же нарушения и краснеет на здоровом пакете.
 */
export function readSources(options: ReadSourcesOptions = {}): SourceFile[] {
  const root = options.dir ?? packageSrcDir()
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS
  const excludeTopDirs = new Set(options.excludeTopDirs ?? [])

  const walk = (dir: string, top: boolean): SourceFile[] => {
    if (!existsSync(dir))
      return []

    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = resolve(dir, entry.name)

      if (entry.isDirectory()) {
        if (entry.name === '__tests__' || (top && excludeTopDirs.has(entry.name)))
          return []

        return walk(full, false)
      }

      if (!extensions.test(entry.name) || entry.name.includes('.test.'))
        return []

      return [{ path: full.slice(root.length + 1), source: readFileSync(full, 'utf8') }]
    })
  }

  return walk(root, true)
}

/**
 * Строки-комментарии выбрасываются до матчинга: в прозе встречаются те же
 * слова. `directives/loading.ts` объясняет по-английски, что делает с «rounded
 * corners» — гейт, читающий комментарии, ловил бы этот текст как нарушение.
 */
export function stripComments(source: string): string {
  return source
    .split('\n')
    .filter(line => !/^\s*(?:\/\/|\*|\/\*|<!--)/.test(line))
    .join('\n')
}

/**
 * Имена токенов в тексте. Хвостовой дефис отбрасывается вместе с именем: так
 * выглядит групповая ссылка из комментария (`--gr-tree-*`), а не токен.
 */
export function tokenNamesIn(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/--gr-[a-z0-9-]+/g)]
      .map(match => match[0])
      .filter(name => !name.endsWith('-')),
  )
}

/** Совпадения паттерна с указанием файла — в том виде, в каком их читает автор. */
export function offenders(pattern: RegExp, input: readonly SourceFile[]): string[] {
  return [...new Set(input.flatMap(({ path, source }) =>
    [...source.matchAll(pattern)].map(match => `${match[0]} (${path})`)))].sort()
}

/** Директории компонентов пакета: `Gr*` в `src/components/`. */
export function componentDirs(componentsDir: string): string[] {
  if (!existsSync(componentsDir))
    return []

  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => entry.name)
}
