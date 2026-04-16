import {
  granularityComponentConfigs,
  granularityComponents,
  resolveGranularityComponentNames,
  type GranularityComponentSelection,
} from './components'

export type { GranularityComponentSelection } from './components'

function hasStyleAssetFileName<T extends { styleAssetFileName: string | null }>(
  config: T,
): config is T & { styleAssetFileName: string } {
  return Boolean(config.styleAssetFileName)
}

function uniqueTokens(value: readonly string[]): string[] {
  return [...new Set(value)]
}

export function getGranularitySafelist(selection: GranularityComponentSelection = 'all'): string[] {
  if (selection === 'all')
    return uniqueTokens(Object.values(granularityComponents).flat())

  return uniqueTokens(resolveGranularityComponentNames(selection).flatMap(componentName => granularityComponents[componentName]))
}

export const granularitySafelist = getGranularitySafelist('all')

export const granularityStyleAssets = [
  {
    fileName: 'styles.css',
    components: 'all',
  },
  ...Object.values(granularityComponentConfigs)
    .filter(hasStyleAssetFileName)
    .map(config => ({
      fileName: config.styleAssetFileName,
      components: [config.name],
    })),
] as const satisfies readonly {
  fileName: string
  components: GranularityComponentSelection
}[]
