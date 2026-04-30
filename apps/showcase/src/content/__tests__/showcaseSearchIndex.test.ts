import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import { showcaseEntityRegistry, showcaseNavigationItems } from '../../app/showcase'
import generatedSearchIndex from '../generated/showcaseSearchIndex.generated.json'

const generatedSearchScript = readFileSync(
  fileURLToPath(new URL('../../../scripts/generate-showcase-search-index.mjs', import.meta.url)),
  'utf8',
)

describe('showcase generated search index', () => {
  it('генерируется build-time скриптом через vite ssr loader и содержит page/entity/section entries', () => {
    expect(generatedSearchScript).toContain("server.ssrLoadModule('/src/app/showcase.ts')")
    expect(generatedSearchScript).toContain("server.ssrLoadModule('/src/app/showcaseSearch.ts')")

    const pageEntries = generatedSearchIndex.filter(entry => entry.kind === 'page')
    const entityEntries = generatedSearchIndex.filter(entry => entry.kind === 'entity')
    const sectionEntries = generatedSearchIndex.filter(entry => entry.kind === 'section')

    expect(pageEntries).toHaveLength(showcaseNavigationItems.length)
    expect(entityEntries).toHaveLength(showcaseEntityRegistry.length)
    expect(sectionEntries.length).toBeGreaterThan(showcaseNavigationItems.length)
  })

  it('включает быстрые переходы на ключевые страницы и canonical detail/hash anchors', () => {
    expect(generatedSearchIndex.some(entry => entry.href === '/components')).toBe(true)
    expect(generatedSearchIndex.some(entry => entry.href === '/utilities/run-file-validators')).toBe(true)
    expect(generatedSearchIndex.some(entry => entry.href === '/components/gr-button#api')).toBe(true)
    expect(generatedSearchIndex.some(entry => entry.href === '/utilities/accept-validator#usage')).toBe(true)
  })
})