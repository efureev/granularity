import { readFileSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

const iconFiles = [
  {
    relativePath: '../components/package/PackageEntitiesCatalogPage.vue',
    expectedImport: "import IconArrowRight from '~icons/lucide/arrow-right'",
    forbiddenSymbol: '→',
  },
  {
    relativePath: '../pages/PackageEntityDetailPage.vue',
    expectedImport: "import IconArrowLeft from '~icons/lucide/arrow-left'",
    forbiddenSymbol: '←',
  },
  {
    relativePath: '../components/layout/ShowcaseHeader.vue',
    expectedImport: "import IconMenu from '~icons/lucide/menu'",
    forbiddenSymbol: '☰',
  },
  {
    relativePath: '../layouts/ShowcaseLayout.vue',
    expectedImport: "import IconX from '~icons/lucide/x'",
    forbiddenSymbol: '✕',
  },
] as const

// Запрет нацелен на символы, подменяющие иконки в UI (см. `iconFiles` ниже).
// Стрелка внутри прозаического текста — другая история: там она читается как
// «дальше», а не как кнопка. Такие места перечислены здесь поимённо.
const allowedSymbolUsage = new Map([
  ['content/component-docs/examples/GrTree.examples.ts', new Set(['→'])],
  ['content/component-docs/examples/GrFileUpload.examples.ts', new Set(['→'])],
  // Цепочка приоритетов в примере `GrConfigProvider`: «опции → сервис → провайдер → дефолт».
  ['content/component-docs/examples/GrConfigProvider.examples.ts', new Set(['→'])],
  ['content/foundations.ts', new Set(['→'])],
  // Цепочка приоритетов в описании `GrConfigProvider`: «локальный проп → конфиг → md».
  ['content/component-docs/overrides.ts', new Set(['→'])],
  ['demos/components/gr-tree/GrTreeDragAndSlotDemo.vue', new Set(['→'])],
])

const sourceExtensions = new Set(['.vue', '.ts'])
const nativeIconPattern = /[☰✕⚙＋←→]/gu

function collectSourceFiles(directory: string): string[] {
  const sourceFiles: string[] = []

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '__tests__')
      continue

    const fullPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      sourceFiles.push(...collectSourceFiles(fullPath))
      continue
    }

    if (sourceExtensions.has(extname(entry.name)))
      sourceFiles.push(fullPath)
  }

  return sourceFiles
}

describe('showcase lucide icons', () => {
  it('использует Lucide вместо нативных стрелок в navigation/cta элементах', () => {
    for (const iconFile of iconFiles) {
      const fileContent = readFileSync(
        fileURLToPath(new URL(iconFile.relativePath, import.meta.url)),
        'utf8',
      )

      expect(fileContent, iconFile.relativePath).toContain(iconFile.expectedImport)
      expect(fileContent, iconFile.relativePath).not.toContain(iconFile.forbiddenSymbol)
    }
  })

  it('не оставляет символьные UI-иконки в showcase source, кроме допустимых текстовых стрелок', () => {
    const srcRoot = fileURLToPath(new URL('../', import.meta.url))
    const unexpectedSymbolUsages: string[] = []

    for (const filePath of collectSourceFiles(srcRoot)) {
      const fileContent = readFileSync(filePath, 'utf8')
      const relativePath = filePath.slice(srcRoot.length).replace(/^\//, '')
      const allowedSymbols = allowedSymbolUsage.get(relativePath) ?? new Set<string>()
      const matchedSymbols = fileContent.match(nativeIconPattern) ?? []

      for (const symbol of matchedSymbols) {
        if (!allowedSymbols.has(symbol))
          unexpectedSymbolUsages.push(`${relativePath}: ${symbol}`)
      }
    }

    expect(unexpectedSymbolUsages).toEqual([])
  })
})