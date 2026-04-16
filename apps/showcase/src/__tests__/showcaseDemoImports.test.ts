import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

function collectVueFiles(directoryPath: string): string[] {
  const entries = readdirSync(directoryPath, { withFileTypes: true })

  return entries.flatMap((entry) => {
    const entryPath = join(directoryPath, entry.name)

    if (entry.isDirectory())
      return collectVueFiles(entryPath)

    if (!statSync(entryPath).isFile() || !entry.name.endsWith('.vue'))
      return []

    return [entryPath]
  })
}

function collectGranularityExports(source: string): Set<string> {
  return new Set([...source.matchAll(/\b(Ds[A-Z][A-Za-z0-9]*)\b/g)].map(match => match[1]))
}

function collectGranularityImports(source: string): Set<string> {
  const imports = new Set<string>()

  for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]@feugene\/granularity['"]/g)) {
    for (const specifier of match[1].split(',')) {
      const normalizedSpecifier = specifier.trim().replace(/^type\s+/, '')

      if (!normalizedSpecifier)
        continue

      imports.add(normalizedSpecifier.split(/\s+as\s+/)[0].trim())
    }
  }

  return imports
}

function collectTemplateComponents(source: string): Set<string> {
  const templateMatch = source.match(/<template>([\s\S]*?)<\/template>/)

  if (!templateMatch)
    return new Set()

  return new Set([...templateMatch[1].matchAll(/<\/?(Ds[A-Z][A-Za-z0-9]*)\b/g)].map(match => match[1]))
}

const demosRoot = fileURLToPath(new URL('../demos', import.meta.url))
const demoFiles = collectVueFiles(demosRoot)
const granularityIndexSource = readFileSync(
  fileURLToPath(new URL('../../../../packages/granularity/src/index.ts', import.meta.url)),
  'utf8',
)
const granularityExports = collectGranularityExports(granularityIndexSource)

describe('showcase demos imports', () => {
  it('явно импортирует из @feugene/granularity все используемые Ds-компоненты в demo-файлах', () => {
    for (const filePath of demoFiles) {
      const fileSource = readFileSync(filePath, 'utf8')
      const usedComponents = [...collectTemplateComponents(fileSource)]
        .filter(componentName => granularityExports.has(componentName))
        .sort()
      const importedComponents = collectGranularityImports(fileSource)
      const missingImports = usedComponents.filter(componentName => !importedComponents.has(componentName))

      expect(missingImports, filePath).toEqual([])
    }
  })
})