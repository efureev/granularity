import { readFileSync, readdirSync } from 'node:fs'
import { basename, relative, resolve } from 'node:path'

import { createGenerator, presetMini } from 'unocss'
import { presetGranular } from '@feugene/unocss-preset-granular'
import { describe, expect, it } from 'vitest'

import { componentSourceFiles } from './componentGraph'

/**
 * Гейт safelist-контракта.
 *
 * Пресет сканирует ровно `<packageBaseUrl>/components/<Name>/**`, а любой
 * `.ts`-хелпер компонента бандлер волен вынести в общий `dist/chunks/` —
 * достаточно, чтобы на модуль сослались из двух мест (например, из `.vue` и
 * из `safelist.ts`). После выноса классы, живущие в нём строковыми литералами,
 * не видит ни скан, ни safelist: у изолированного потребителя компонент
 * рендерится без цветов, теней и фокус-колец, а в витрине дефект маскируется
 * соседями по странице, которые генерируют те же утилиты.
 *
 * Поэтому правило сформулировано от исходников, а не от `dist`: класс из
 * `.ts`-хелпера обязан быть в safelist независимо от того, куда его положила
 * текущая раскладка чанков. Гейт от `dist` зеленел бы ровно до следующего
 * изменения чанкинга.
 *
 * Литералы из `.vue` под правило не подпадают: шаблон и `<script setup>`
 * компилируются в чанк самого компонента, то есть всегда лежат в области скана.
 *
 * Хелперы из `components/shared/` считаются наравне со своими: адреса у такого
 * модуля нет вовсе — в `dist` он лежит в общем чанке и не принадлежит ни одной
 * директории, которую сканирует пресет. Поэтому его классы обязан объявить
 * **каждый** компонент, который его импортирует. Ни этот гейт до расширения, ни
 * `doctor` этого не ловили: диагностики доктора закрыты списком и классов не
 * касаются вовсе, а `undeclared-dependency` — это ребро в директорию другого
 * компонента, тогда как общий чанк ничьей директорией не является.
 */

const componentsDir = resolve(process.cwd(), 'src/components')
const sharedDir = resolve(componentsDir, 'shared')

/** Файлы компонента, которые не являются style-хелперами. */
const NOT_A_HELPER = /^(?:index|config|safelist|defaults)\.ts$/

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

  if (tokens.length === 0) return false
  if (tokens.length > 1) return true

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
    if (typeOnly || !hasValueImport(clause)) continue
    found.add(module)
  }

  return [...found]
}

/** `import { type A }` — тоже пустышка для бандла, как и `import type`. */
function hasValueImport(clause: string): boolean {
  const named = clause.match(/\{([^}]*)\}/)
  if (!named) return true

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
    if (seen.has(module)) continue
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
      if (typeOnly || !hasValueImport(clause)) continue
      queue.push(sibling)
    }
  }

  return [...seen].map(module => resolve(sharedDir, `${module}.ts`))
}

/**
 * Файлы, чьи класс-литералы обязаны быть в safelist компонента: его собственные
 * `.ts`-хелперы плюс безадресные модули из `shared/`.
 *
 * Обход рекурсивный: у `GrSelect` хелперы лежат в `composables/`, у
 * `GrResponseErrorBanner` — в `parsers/`, и плоский `readdirSync` их не видел.
 */
function helperFiles(component: string): string[] {
  const dir = resolve(componentsDir, component)
  const own = componentSourceFiles(dir)
    .filter(file => file.endsWith('.ts') && !NOT_A_HELPER.test(basename(file)))

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
  it('классы из `.ts`-хелперов компонента объявлены в его safelist', async () => {
    // Оракул «это вообще утилита?» — ровно та связка, которую собирает
    // потребитель: `presetMini` плюс утилиты, которые `presetGranular` добирает
    // из `@feugene/unocss-mini-extra-rules` (`animate-*`, `divide-*`, `sr-only`…).
    // На чистом `presetMini` такой токен считался бы «не утилитой», а значит
    // safelist ему не требовался — и у изолированного потребителя класс молча
    // не сгенерировался бы. Токен, из которого CSS не делает никто, классом
    // по-прежнему не считается.
    const uno = await createGenerator({
      presets: [presetMini(), presetGranular({ providers: [], components: [] })],
    })
    const isUtility = new Map<string, boolean>()

    const violations: string[] = []

    for (const component of componentNames()) {
      const files = helperFiles(component)
      if (files.length === 0) continue

      const safelist = await declaredSafelist(component)
      const candidates = new Set<string>()

      for (const file of files) {
        const source = stripComments(readFileSync(file, 'utf8'))

        for (const literal of stringLiterals(source)) {
          if (!looksLikeClassList(literal)) continue

          for (const token of literal.split(/\s+/).filter(Boolean)) {
            if (!safelist.has(token)) candidates.add(token)
          }
        }
      }

      const missing: string[] = []

      for (const token of candidates) {
        if (!isUtility.has(token)) {
          const { matched } = await uno.generate(token, { preflights: false })
          isUtility.set(token, matched.size > 0)
        }

        if (isUtility.get(token)) missing.push(token)
      }

      if (missing.length > 0) {
        // Путь от `src/components`, иначе общий хелпер в сообщении неотличим
        // от файла самого компонента.
        const where = files.map(file => relative(componentsDir, file)).join(', ')
        violations.push(`${component} [${where}]: ${missing.sort().join(' ')}`)
      }
    }

    expect(violations).toEqual([])
  })

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
