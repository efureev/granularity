import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

/** Дескриптор компонента: гейту нужен только объявленный safelist. */
export interface SafelistComponentConfig {
  safelist?: readonly string[]
}

export interface SafelistGateOptions {
  /** Реестр компонентов пакета: имя → дескриптор. */
  componentConfigs: Readonly<Record<string, SafelistComponentConfig>>
  /** Директория компонентов; по умолчанию — `<cwd>/src/components`. */
  componentsDir?: string
}

/**
 * Файлы, литералы которых кодом компонента не считаются: `safelist.ts` и есть
 * объявление, `index.ts` и `config.ts` только его передают.
 */
const NOT_COMPONENT_CODE = /^(?:index|config)\.ts$|safelist\.ts$/i

const SOURCE_FILE = /\.(?:vue|ts)$/

/**
 * `import … from './x'` и `export … from '../x'`. В списке имён не бывает ни
 * `(`, ни `=`, и на них совпадение обрывается: иначе ленивый захват дотянулся бы
 * от `export function` до чужого `from` ниже.
 */
const FROM_IMPORT = /\b(?:import|export)\b([^'";()=]+?)\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]/g
/** `import('./x')` — ленивый чанк тоже часть графа компонента. */
const DYNAMIC_IMPORT = /\bimport\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]/g
/** Голый `import './x'` — ради побочного эффекта. */
const BARE_IMPORT = /\bimport\s*['"](\.{1,2}\/[^'"]+)['"]/g

export function stripCodeComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

function stringLiterals(source: string): string[] {
  const literals: string[] = []
  const re = /'([^'\\\n]*(?:\\.[^'\\\n]*)*)'|"([^"\\\n]*(?:\\.[^"\\\n]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g
  for (let match = re.exec(source); match !== null; match = re.exec(source))
    literals.push(match[1] ?? match[2] ?? match[3] ?? '')

  return literals
}

/**
 * Отсекает строки, которые классами быть не могут: значения пропов и энумов
 * (`'outline'`, `'horizontal'`), ключи событий, id. Одиночное слово считаем
 * классом только при маркере утилиты — иначе `variant: 'outline'` требовал бы
 * safelist наравне с настоящей утилитой `outline`.
 */
function looksLikeClassList(literal: string): boolean {
  const tokens = literal.split(/\s+/).filter(Boolean)

  if (tokens.length === 0)
    return false
  if (tokens.length > 1)
    return true

  return /[-:[\]/]/.test(tokens[0]!)
}

/** `import { type A }` — пустышка для бандла, как и `import type`. */
function hasValueImport(clause: string): boolean {
  const named = clause.match(/\{([^}]*)\}/)
  if (!named)
    return true

  return named[1]!.split(',').some(name => name.trim() && !name.trim().startsWith('type '))
}

/**
 * Относительные импорты модуля, которые попадают в бандл.
 *
 * Без FS, чтобы правило можно было проверить прямо. Типовой импорт пропускается:
 * он стирается на сборке и классов не приносит.
 */
export function parseRelativeImports(fileContent: string): string[] {
  const code = stripCodeComments(fileContent)
  const found = new Set<string>()

  for (const [, clause, path] of code.matchAll(FROM_IMPORT)) {
    if (/^\s*type\s/.test(clause!) || !hasValueImport(clause!))
      continue
    found.add(path!)
  }
  for (const [, path] of code.matchAll(DYNAMIC_IMPORT))
    found.add(path!)
  for (const [, path] of code.matchAll(BARE_IMPORT))
    found.add(path!)

  return [...found]
}

function resolveModule(from: string, specifier: string): string | undefined {
  const base = resolve(dirname(from), specifier)
  const candidates = [base, `${base}.ts`, `${base}.vue`, resolve(base, 'index.ts'), base.replace(/\.js$/, '.ts')]

  return candidates.find(path => existsSync(path) && statSync(path).isFile())
}

function filesOf(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory())
      return entry.name === '__tests__' ? [] : filesOf(full)

    return SOURCE_FILE.test(entry.name) && !entry.name.includes('.test.') ? [full] : []
  })
}

/**
 * Код компонента, который видит экстрактор granum.
 *
 * `granumProvider` на сборке пакета обходит от входа компонента все чанки, до
 * которых тот дотягивается, включая общие `dist/chunks/*`, и останавливается
 * только на директории другого компонента — это ребро графа, её классы приходят
 * с зависимостью. Здесь тот же обход по исходникам: от файлов компонента по
 * относительным импортам, сквозь `shared/`, `internal/` и общие директории
 * группы вроде рамы графиков, но не в директорию соседа.
 */
export function componentCodeFiles(componentsDir: string, component: string, components: readonly string[]): string[] {
  const own = resolve(componentsDir, component)
  const edges = components
    .filter(name => name !== component)
    .map(name => resolve(componentsDir, name) + sep)
  const isEdge = (file: string) => edges.some(dir => file.startsWith(dir))

  const seen = new Set<string>()
  const queue = filesOf(own)

  while (queue.length > 0) {
    const file = queue.pop()!
    if (seen.has(file) || isEdge(file))
      continue
    seen.add(file)

    for (const specifier of parseRelativeImports(readFileSync(file, 'utf8'))) {
      const target = resolveModule(file, specifier)
      if (target)
        queue.push(target)
    }
  }

  return [...seen].filter(file => !NOT_COMPONENT_CODE.test(basename(file))).sort()
}

/**
 * Записи safelist, которые лежат целым литералом в коде компонента: класс
 * извлечётся и без них. Возвращает `класс (файл)`.
 */
export function redundantSafelistEntries(safelist: Iterable<string>, files: readonly string[], root: string): string[] {
  const literalAt = new Map<string, string>()

  for (const file of files) {
    for (const literal of stringLiterals(stripCodeComments(readFileSync(file, 'utf8')))) {
      if (!looksLikeClassList(literal))
        continue

      for (const token of literal.split(/\s+/).filter(Boolean)) {
        // Кусок шаблонной строки целым классом не является: `${…}`
        // подставляется в рантайме, и именно такие классы safelist и несёт.
        if (token.includes('${'))
          continue
        if (!literalAt.has(token))
          literalAt.set(token, relative(root, file))
      }
    }
  }

  return [...new Set(safelist)]
    .filter(token => literalAt.has(token))
    .sort()
    .map(token => `${token} (${literalAt.get(token)})`)
}

/**
 * Гейт safelist-контракта.
 *
 * Safelist компонента — только классы, которые собираются в рантайме из частей:
 * шаблонная строка, конкатенация, `prefix + value`. Целиком их нет ни в одной
 * строке кода, и экстрактор не увидит их никогда.
 *
 * Всё, что лежит в коде целым литералом, granum извлекает сам — см.
 * {@link componentCodeFiles}. До granum правило было обратным: пресет сканировал
 * ровно `components/<Name>/**`, общий чанк не видел, и литералы `.ts`-хелперов
 * обязаны были дублироваться в safelist. Такие списки пережили переезд и
 * держались только на привычке: сборка вычищала их как уже извлечённые.
 *
 * Гейт держит новую сторону контракта: запись safelist не лежит целым литералом
 * в коде компонента. Обратную сторону — «собранный в рантайме класс объявлен» —
 * исходник не выдаёт, её держит автор: семейство, которое функция клеит из
 * частей, объявляется целиком, по всем значениям.
 */
export function defineSafelistGate(options: SafelistGateOptions): void {
  const componentsDir = options.componentsDir ?? resolve(process.cwd(), 'src/components')
  const components = Object.keys(options.componentConfigs)

  describe('safelist-контракт', () => {
    it('safelist компонента не дублирует литералы его кода', () => {
      const violations = components.flatMap((component) => {
        const safelist = options.componentConfigs[component]?.safelist ?? []
        if (safelist.length === 0)
          return []

        const files = componentCodeFiles(componentsDir, component, components)
        const redundant = redundantSafelistEntries(safelist, files, componentsDir)

        return redundant.length > 0 ? [`${component}: ${redundant.join(', ')}`] : []
      })

      expect(violations).toEqual([])
    })
  })
}
