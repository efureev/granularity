import { showcaseComponentDetailSections } from '../../app/showcase'
import { createUsageSnippet } from '../../components/doc/entityPageHelpers'

import type { ShowcaseEntityRegistryItem } from '../model'
import type { ShowcaseComponentDocMeta, ShowcaseComponentExampleDoc } from './types'
import { componentDocOverrides } from './overrides'

export type { ShowcaseComponentDocMeta, ShowcaseComponentExampleDoc } from './types'

function createFallbackExamples(entity: ShowcaseEntityRegistryItem): ShowcaseComponentExampleDoc[] {
  const fallbackCode = createUsageSnippet(entity)

  return entity.examples.map(example => ({
    id: example.id,
    title: example.title,
    description: example.description,
    status: example.status,
    code: fallbackCode,
    note: 'Этот сценарий уже зарезервирован в metadata-слое и будет заменён на живой preview в следующих шагах.',
  }))
}

export function getShowcaseComponentDoc(entity: ShowcaseEntityRegistryItem): ShowcaseComponentDocMeta {
  const override = componentDocOverrides[entity.name]

  return {
    sections: override?.sections ?? showcaseComponentDetailSections,
    examples: override?.examples ?? createFallbackExamples(entity),
  }
}
