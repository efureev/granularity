import { applyHandAuthoredEntityMetadata } from '../content/handAuthored.ts'
import { generatedComponentEntities } from '../content/generated/componentEntities.generated.ts'
import {
  generatedComposableEntities,
  generatedDirectiveEntities,
  generatedUtilityEntities,
} from '../content/generated/packageEntities.generated.ts'

function uniqueTitles(entities: { title: string }[], count = 3): string[] {
  return [...new Set(entities.map(entity => entity.title))].slice(0, count)
}

export const showcaseComponentEntities = generatedComponentEntities.map(applyHandAuthoredEntityMetadata)
export const showcaseDirectiveEntities = generatedDirectiveEntities.map(applyHandAuthoredEntityMetadata)
export const showcaseComposableEntities = generatedComposableEntities.map(applyHandAuthoredEntityMetadata)
export const showcaseUtilityEntities = generatedUtilityEntities.map(applyHandAuthoredEntityMetadata)

export const showcaseEntityRegistry = [
  ...showcaseComponentEntities,
  ...showcaseDirectiveEntities,
  ...showcaseComposableEntities,
  ...showcaseUtilityEntities,
]

export const featuredComponentTitles = uniqueTitles(
  showcaseComponentEntities.filter(entity => entity.tags.includes('featured')),
)

export const featuredDirectiveTitles = uniqueTitles(
  showcaseDirectiveEntities.filter(entity => entity.tags.includes('featured')),
  2,
)

export const featuredUtilityTitles = uniqueTitles(
  showcaseUtilityEntities.filter(entity => entity.tags.includes('featured')),
  2,
)