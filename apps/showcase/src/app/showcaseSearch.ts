import type { ShowcaseEntityRegistryItem } from '../content/model.ts'

import type {
  ShowcaseNavigationItem,
  ShowcaseSection,
} from './showcaseModel.ts'

export type ShowcaseSearchEntryKind = 'page' | 'entity' | 'section'

export type ShowcaseSearchEntry = {
  id: string
  title: string
  description: string
  href: string
  kind: ShowcaseSearchEntryKind
  kindLabel: string
  context: string
}

export type SearchIndexEntry = ShowcaseSearchEntry & {
  searchableTitle: string
  searchableContent: string
}

export function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\u0000-\u007E\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createPathAliases(path: string): string[] {
  return path
    .split('/')
    .filter(Boolean)
    .flatMap(segment => [segment, segment.replace(/-/g, ' ')])
}

export function buildSearchableContent(parts: Array<string | undefined>): string {
  return normalizeSearchValue(parts.filter(Boolean).join(' '))
}

export function createPageEntry(
  item: ShowcaseNavigationItem,
  sections: ShowcaseSection[],
): SearchIndexEntry {
  return {
    id: `page:${item.name}`,
    title: item.title,
    description: item.description,
    href: item.path,
    kind: 'page',
    kindLabel: 'Page',
    context: item.shortTitle,
    searchableTitle: normalizeSearchValue(item.title),
    searchableContent: buildSearchableContent([
      item.name,
      item.title,
      item.shortTitle,
      item.description,
      ...createPathAliases(item.path),
      ...sections.map(section => `${section.title} ${section.description}`),
    ]),
  }
}

export function createEntityEntry(entity: ShowcaseEntityRegistryItem): SearchIndexEntry {
  return {
    id: `entity:${entity.id}`,
    title: entity.title,
    description: entity.summary,
    href: entity.path,
    kind: 'entity',
    kindLabel: entity.kind,
    context: `${entity.group} / ${entity.kind}`,
    searchableTitle: normalizeSearchValue(entity.title),
    searchableContent: buildSearchableContent([
      entity.title,
      entity.name,
      entity.summary,
      entity.group,
      entity.kind,
      entity.path,
      entity.source.packagePath,
      entity.source.exportPath,
      ...entity.tags,
      ...createPathAliases(entity.path),
    ]),
  }
}

export function createSectionEntry(
  parentEntry: SearchIndexEntry,
  section: ShowcaseSection,
): SearchIndexEntry {
  return {
    id: `${parentEntry.id}:section:${section.id}`,
    title: `${parentEntry.title} / ${section.title}`,
    description: section.description,
    href: `${parentEntry.href}#${section.id}`,
    kind: 'section',
    kindLabel: 'Section',
    context: parentEntry.title,
    searchableTitle: normalizeSearchValue(`${parentEntry.title} ${section.title}`),
    searchableContent: buildSearchableContent([
      parentEntry.title,
      parentEntry.description,
      section.id,
      section.title,
      section.description,
      ...section.bullets,
    ]),
  }
}

export function getSearchScore(
  entry: SearchIndexEntry,
  normalizedQuery: string,
  queryTokens: string[],
): number {
  if (!normalizedQuery)
    return 0

  if (queryTokens.some(token => !entry.searchableContent.includes(token)))
    return 0

  let score = 0

  if (entry.searchableTitle === normalizedQuery)
    score += 120

  if (entry.searchableTitle.startsWith(normalizedQuery))
    score += 72

  if (entry.searchableContent.includes(normalizedQuery))
    score += 30

  score += queryTokens.reduce((total, token) => total + (entry.searchableTitle.includes(token) ? 12 : 4), 0)

  if (entry.kind === 'entity')
    score += 10
  else if (entry.kind === 'page')
    score += 6

  return score
}