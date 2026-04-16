import generatedSearchIndex from '../content/generated/showcaseSearchIndex.generated.json'
import {
  showcaseComponentEntities,
  showcaseDirectiveEntities,
  showcaseUtilityEntities,
} from './showcase'
import {
  getSearchScore,
  normalizeSearchValue,
} from './showcaseSearch'

import type {
  SearchIndexEntry,
  ShowcaseSearchEntry,
} from './showcaseSearch'

const featuredEntityNames = new Set(['DsButton', 'vLoading', 'useTheme', 'runFileValidators'])

const searchIndexEntries = generatedSearchIndex as SearchIndexEntry[]

export const showcaseSearchIndex: ShowcaseSearchEntry[] = searchIndexEntries

const featuredEntries = [
  ...showcaseComponentEntities,
  ...showcaseDirectiveEntities,
  ...showcaseUtilityEntities,
]

export const showcaseSuggestedSearchEntries = [
  ...searchIndexEntries.filter(entry => entry.kind === 'page' && ['/', '/components', '/utilities'].includes(entry.href)),
  ...featuredEntries
    .filter(entry => featuredEntityNames.has(entry.title))
    .map(entry => searchIndexEntries.find(candidate => candidate.href === entry.path && candidate.kind === 'entity'))
    .filter((entry): entry is SearchIndexEntry => Boolean(entry))
    .slice(0, 4),
]

export function searchShowcaseEntries(query: string, limit = 8): ShowcaseSearchEntry[] {
  const normalizedQuery = normalizeSearchValue(query)
  const queryTokens = normalizedQuery.split(' ').filter(Boolean)

  if (!queryTokens.length)
    return []

  return searchIndexEntries
    .map(entry => ({
      entry,
      score: getSearchScore(entry, normalizedQuery, queryTokens),
    }))
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
    .slice(0, limit)
    .map(item => item.entry)
}