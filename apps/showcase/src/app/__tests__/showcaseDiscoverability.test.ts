import { describe, expect, it } from 'vitest'

import {
  getShowcaseSectionsForPath,
  showcaseComponentEntities,
  showcaseDirectiveEntities,
  showcaseUtilityEntities,
} from '../showcase'
import {
  searchShowcaseEntries,
  showcaseSuggestedSearchEntries,
} from '../showcaseDiscoverability'
import {
  createImportSnippet,
  createRelatedLinks,
} from '../../components/doc/entityPageHelpers'

describe('showcase discoverability', () => {
  it('строит package-detail TOC для utilities и оставляет component detail sections на месте', () => {
    const utilityEntity = showcaseUtilityEntities.find(entity => entity.name === 'runFileValidators')
    const componentEntity = showcaseComponentEntities.find(entity => entity.name === 'DsButton')

    expect(utilityEntity).toBeDefined()
    expect(componentEntity).toBeDefined()

    expect(getShowcaseSectionsForPath(utilityEntity!.path).map(section => section.id)).toEqual([
      'overview',
      'examples',
      'api',
      'usage',
      'integration',
    ])
    expect(getShowcaseSectionsForPath(componentEntity!.path).map(section => section.id)).toEqual([
      'overview',
      'live-examples',
      'api',
      'integration-notes',
    ])
  })

  it('ищет entity и section entries по alias/query tokens', () => {
    const acceptResults = searchShowcaseEntries('accept validator')
    const usageResults = searchShowcaseEntries('copy usage snippet')

    expect(acceptResults.some(entry => entry.title === 'acceptValidator')).toBe(true)
    expect(acceptResults.some(entry => entry.href.includes('#examples'))).toBe(true)
    expect(usageResults.some(entry => entry.href.endsWith('#usage'))).toBe(true)
    expect(showcaseSuggestedSearchEntries.map(entry => entry.href)).toEqual(expect.arrayContaining([
      '/',
      '/components',
      '/utilities',
    ]))
  })

  it('возвращает корректные import snippets и related source/doc links', () => {
    const utilityEntity = showcaseUtilityEntities.find(entity => entity.name === 'acceptValidator')
    const directiveEntity = showcaseDirectiveEntities.find(entity => entity.name === 'vLoading')
    const componentEntity = showcaseComponentEntities.find(entity => entity.name === 'DsButton')

    expect(utilityEntity).toBeDefined()
    expect(directiveEntity).toBeDefined()
    expect(componentEntity).toBeDefined()

    expect(createImportSnippet(utilityEntity!)).toBe("import { acceptValidator } from '@feugene/granularity/fileValidation'")
    expect(createImportSnippet(directiveEntity!)).toBe("import { vLoading } from '@feugene/granularity/directives'")

    const utilityLinks = createRelatedLinks(utilityEntity!)
    const componentLinks = createRelatedLinks(componentEntity!)

    expect(utilityLinks.map(link => link.label)).toEqual(expect.arrayContaining([
      'Package source',
      'Public export entry',
      'Narrative docs',
    ]))
    expect(utilityLinks.find(link => link.label === 'Public export entry')?.href).toBe('/packages/granularity/src/fileValidation/index.ts')
    expect(componentLinks.find(link => link.label === 'Showcase registry')?.href).toBe('/apps/showcase/src/content/generated/componentEntities.generated.ts')
  })
})