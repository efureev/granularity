import { readFileSync, readdirSync } from 'node:fs'
import { basename, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { componentSourceFiles } from './componentGraph'

/**
 * Гейт safelist-контракта.
 *
 * Safelist компонента — только классы, которые собираются в рантайме из частей:
 * шаблонная строка, конкатенация, `prefix + value`. Целиком их нет ни в одной
 * строке кода, и экстрактор не увидит их никогда.
 *
 * Всё, что лежит в коде целым литералом, granum извлекает сам. `granumProvider`
 * на сборке пакета обходит от входа компонента все импортированные им чанки,
 * включая общие `dist/chunks/*`, и прогоняет экстрактор по каждому; останавливается
 * он только на директории другого компонента — это ребро графа, и её классы
 * приходят с зависимостью. Раскладка чанков на это не влияет.
 *
 * До granum правило было обратным: пресет сканировал ровно
 * `components/<Name>/**`, общий чанк не видел, и литералы `.ts`-хелперов
 * обязаны были дублироваться в safelist. Из 3478 записей ядра сборка вычищала
 * как уже извлечённые больше трёх тысяч — и часть оставшихся держалась только
 * потому, что `index.ts` реэкспортирует safelist и экстрактор находил литерал
 * в самом safelist-модуле.
 *
 * Гейт держит новую сторону контракта: запись safelist не должна лежать целым
 * литералом в коде компонента — его `.vue`, его `.ts`-хелперах и модулях
 * `components/shared/`, которые он импортирует. Такая запись лишняя: класс
 * извлечётся и без неё. Обратную сторону — «собранный в рантайме класс объявлен»
 * — исходник не выдаёт, её держит автор: семейство, которое функция клеит из
 * частей, объявляется целиком, по всем значениям.
 */

const componentsDir = resolve(process.cwd(), 'src/components')
const sharedDir = resolve(componentsDir, 'shared')

/**
 * Файлы компонента, литералы которых не считаются кодом компонента: `safelist.ts`
 * сам и есть объявление, `index.ts` и `config.ts` только его передают.
 */
const NOT_COMPONENT_CODE = /^(?:index|config|safelist)\.ts$/

/** `from '../shared/x'`, `from '../../shared/x'` — импорт безадресного хелпера. */
const SHARED_IMPORT = /import\s+(type\s+)?([^'"]*?)from\s*['"](?:\.\.\/)+shared\/([\w-]+)(?:\.\w+)?['"]/g
/** Внутри `shared/` соседи адресуются относительно: `from './classTokens'`. */
const SIBLING_IMPORT = /import\s+(type\s+)?([^'"]*?)from\s*['"]\.\/([\w-]+)(?:\.\w+)?['"]/g

function stripComments(source: string): string {
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

  return /[-:[\]/]/.test(tokens[0])
}

/**
 * Модули `shared/`, на которые ссылается файл.
 *
 * Без FS, чтобы правило распознавания ребра можно было проверить прямо, а не
 * подбирая компонент, который случайно его покрывает. `import type` пропускается:
 * типовой импорт в бандл не эмитит ничего, а значит и классов не приносит.
 */
export function parseSharedImports(fileContent: string): string[] {
  const code = stripComments(fileContent)
  const found = new Set<string>()

  for (const [, typeOnly, clause, module] of code.matchAll(SHARED_IMPORT)) {
    if (typeOnly || !hasValueImport(clause))
      continue
    found.add(module)
  }

  return [...found]
}

/** `import { type A }` — тоже пустышка для бандла, как и `import type`. */
function hasValueImport(clause: string): boolean {
  const named = clause.match(/\{([^}]*)\}/)
  if (!named)
    return true

  return named[1].split(',').some(name => name.trim() && !name.trim().startsWith('type '))
}

/**
 * Импорт соседа внутри `shared/` тянет и его классы: в общий чанк уезжает вся
 * цепочка, а не только тот модуль, который назвал компонент.
 */
function expandSharedModules(entry: string[]): string[] {
  const seen = new Set<string>()
  const queue = [...entry]

  while (queue.length > 0) {
    const module = queue.pop()!
    if (seen.has(module))
      continue
    seen.add(module)

    const path = resolve(sharedDir, `${module}.ts`)
    let source: string
    try {
      source = readFileSync(path, 'utf8')
    }
    catch {
      continue
    }

    for (const [, typeOnly, clause, sibling] of stripComments(source).matchAll(SIBLING_IMPORT)) {
      if (typeOnly || !hasValueImport(clause))
        continue
      queue.push(sibling)
    }
  }

  return [...seen].map(module => resolve(sharedDir, `${module}.ts`))
}

/**
 * Код компонента, который видит экстрактор: его `.vue` и `.ts` плюс модули
 * `shared/`, которые он импортирует.
 *
 * Обход рекурсивный: у `GrSelect` хелперы лежат в `composables/`, у
 * `GrResponseErrorBanner` — в `parsers/`, и плоский `readdirSync` их не видел.
 */
function componentCodeFiles(component: string): string[] {
  const dir = resolve(componentsDir, component)
  const own = componentSourceFiles(dir)
    .filter(file => !NOT_COMPONENT_CODE.test(basename(file)))

  const shared = expandSharedModules(
    componentSourceFiles(dir).flatMap(file => parseSharedImports(readFileSync(file, 'utf8'))),
  )

  return [...own, ...shared]
}

function componentNames(): string[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => entry.name)
    .sort()
}

async function declaredSafelist(component: string): Promise<Set<string>> {
  const module = await import(`../components/${component}/config.ts`)
  const config = Object.values(module)[0] as { safelist?: string[] } | undefined

  return new Set(config?.safelist ?? [])
}

describe('safelist-контракт', () => {
  it('safelist компонента не дублирует литералы его кода', async () => {
    const violations: string[] = []

    for (const component of componentNames()) {
      const safelist = await declaredSafelist(component)
      if (safelist.size === 0)
        continue

      const files = componentCodeFiles(component)
      const literalAt = new Map<string, string>()

      for (const file of files) {
        const source = stripComments(readFileSync(file, 'utf8'))

        for (const literal of stringLiterals(source)) {
          if (!looksLikeClassList(literal))
            continue

          for (const token of literal.split(/\s+/).filter(Boolean)) {
            // Кусок шаблонной строки целым классом не является: `${…}`
            // подставляется в рантайме, и именно такие классы safelist и несёт.
            if (token.includes('${'))
              continue
            if (!literalAt.has(token))
              literalAt.set(token, relative(componentsDir, file))
          }
        }
      }

      const redundant = [...safelist]
        .filter(token => literalAt.has(token))
        .sort()
        .map(token => `${token} (${literalAt.get(token)})`)

      if (redundant.length > 0)
        violations.push(`${component}: ${redundant.join(', ')}`)
    }

    expect(violations).toEqual([])
  }, 30_000)

  describe('разбор импортов `shared/`', () => {
    it('находит модуль по относительному пути любой глубины', () => {
      expect(parseSharedImports(`import { splitClassTokens } from '../shared/classTokens'`)).toEqual(['classTokens'])
      expect(parseSharedImports(`import { toneClass } from '../../shared/tones'`)).toEqual(['tones'])
    })

    it('пропускает типовой импорт: он не эмитит ничего, значит и классов не приносит', () => {
      expect(parseSharedImports(`import type { GrComponentSize } from '../shared/sizes'`)).toEqual([])
      expect(parseSharedImports(`import { type GrComponentSize } from '../shared/sizes'`)).toEqual([])
    })

    it('не считает `shared` импорт соседнего компонента', () => {
      expect(parseSharedImports(`import { grBadgeSafelist } from '../GrBadge/safelist'`)).toEqual([])
    })
  })
})
