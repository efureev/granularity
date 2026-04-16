import { describe, expect, it } from 'vitest'

import { showcaseEntityRegistry } from '../../../app/showcase'
import {
  createRelatedLinks,
  createUsageSnippet,
  resolveFeaturedEntity,
} from '../entityPageHelpers'

describe('entity page helpers', () => {
  it('выбирает featured entity для page-level doc primitives', () => {
    expect(resolveFeaturedEntity('components', showcaseEntityRegistry)?.name).toBe('DsButton')
    expect(resolveFeaturedEntity('directives', showcaseEntityRegistry)?.name).toBe('vLoading')
  })

  it('строит usage snippet по kind сущности', () => {
    const componentEntity = resolveFeaturedEntity('components', showcaseEntityRegistry)
    const directiveEntity = resolveFeaturedEntity('directives', showcaseEntityRegistry)

    expect(createUsageSnippet(componentEntity)).toContain("import { DsButton } from '@feugene/granularity'")
    expect(createUsageSnippet(directiveEntity)).toContain("import { vLoading } from '@feugene/granularity/directives'")
  })

  it('создаёт связанные ссылки на source, export entry и narrative docs', () => {
    const utilityEntity = resolveFeaturedEntity('utilities', showcaseEntityRegistry)
    const relatedLinks = createRelatedLinks(utilityEntity)

    expect(relatedLinks[0]?.href).toContain('/packages/granularity/src/fileValidation/index.ts')
    expect(relatedLinks[1]?.href).toContain('/packages/granularity/src/fileValidation/index.ts')
    expect(relatedLinks.some(link => link.label === 'Narrative docs')).toBe(true)
  })
})