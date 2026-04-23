import { granularityComponentConfigs } from '@feugene/granularity/granular-provider'
import generatedComponentApiMetadata from './componentApi.generated.json'

import type {
  ShowcaseApiSectionMeta,
  ShowcaseEntityRegistryItem,
} from '../model.ts'
import { showcaseComponentApiFallbacks } from '../componentApiFallbacks.ts'

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

function createPendingComponentApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'pending',
      items: [],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'pending',
      items: [],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'pending',
      items: [],
    },
    {
      key: 'methods',
      title: 'Methods / Expose',
      origin: 'pending',
      items: [],
    },
  ]
}

function mergeApiSections(
  componentName: string,
  generatedSections?: ShowcaseApiSectionMeta[],
): ShowcaseApiSectionMeta[] {
  const fallbackSections = showcaseComponentApiFallbacks[componentName] ?? {}
  const sections = generatedSections?.length ? generatedSections : createPendingComponentApiSections()

  return sections.map((section) => {
    const fallbackSection = fallbackSections[section.key as keyof typeof fallbackSections]

    if (!fallbackSection)
      return section

    if (section.items.length > 0) {
      return {
        ...section,
        items: section.items.map((item) => {
          const fallbackItem = fallbackSection.items.find(candidate => candidate.name === item.name)
          return fallbackItem
            ? {
                ...item,
                description: fallbackItem.description || item.description,
                type: fallbackItem.type || item.type,
              }
            : item
        }),
      }
    }

    return fallbackSection
  })
}

export const generatedComponentEntities: ShowcaseEntityRegistryItem[] = Object.values(granularityComponentConfigs)
  .map((config): ShowcaseEntityRegistryItem => ({
    id: `component:${config.name}`,
    kind: 'component',
    name: config.name,
    title: config.name,
    path: `/components/${toKebabCase(config.name)}`,
    group: 'unassigned',
    summary: `Публичный компонент ${config.name} из registry пакета.`,
    tags: ['generated', 'public-api'],
    source: {
      packagePath: 'packages/granularity/src/granular-provider/shared.ts',
      exportPath: `@feugene/granularity/components/${config.name}`,
    },
    dependencies: (config.dependencies ?? []).flatMap((dep): string[] => {
      if (typeof dep === 'string')
        return [dep]
      if (dep && typeof dep === 'object' && 'components' in dep && Array.isArray(dep.components)) {
        const provider = 'provider' in dep && typeof dep.provider === 'string' ? dep.provider : ''
        return dep.components.map(component => provider ? `${provider}/${component}` : String(component))
      }
      return []
    }),
    examples: [],
    apiSections: mergeApiSections(config.name, (generatedComponentApiMetadata as Record<string, { sections?: ShowcaseApiSectionMeta[] } | undefined>)[config.name]?.sections),
  }))
  .sort((left, right) => left.name.localeCompare(right.name))