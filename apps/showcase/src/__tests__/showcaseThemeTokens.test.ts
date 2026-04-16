import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

const tokenDrivenSourceRoots = [
  '../layouts',
  '../components',
  '../pages',
  '../demos',
  '../content/component-docs/examples',
] as const

const hardcodedPalettePattern = /slate-\d{2,3}|(?:bg|text|border)-white(?:\/\d+)?|rgba\(/
const ignoredTokenAuditPaths = [
  '/content/foundations.ts',
  '/content/__tests__/',
  '/__tests__/showcaseThemeTokens.test.ts',
] as const

function collectSourceFiles(directoryPath: string): string[] {
  const entries = readdirSync(directoryPath, { withFileTypes: true })

  return entries.flatMap((entry) => {
    const entryPath = join(directoryPath, entry.name)

    if (entry.isDirectory())
      return collectSourceFiles(entryPath)

    if (!statSync(entryPath).isFile())
      return []

    return ['.vue', '.ts'].some(extension => entry.name.endsWith(extension))
      ? [entryPath]
      : []
  })
}

const tokenDrivenSourceFiles = tokenDrivenSourceRoots.flatMap(relativePath =>
  collectSourceFiles(fileURLToPath(new URL(relativePath, import.meta.url))),
).filter(filePath => !ignoredTokenAuditPaths.some(ignoredPath => filePath.includes(ignoredPath)))

describe('showcase theme tokens', () => {
  it('подключает локальный token-based showcase stylesheet', () => {
    const showcaseMainEntry = readFileSync(
      fileURLToPath(new URL('../main.ts', import.meta.url)),
      'utf8',
    )

    expect(showcaseMainEntry).toContain("import './styles/showcase-theme.css'")
  })

  it('не использует hardcoded palette в token-driven showcase исходниках', () => {
    for (const filePath of tokenDrivenSourceFiles) {
      const fileContent = readFileSync(filePath, 'utf8')

      expect(fileContent, filePath).not.toMatch(hardcodedPalettePattern)
    }
  })
})