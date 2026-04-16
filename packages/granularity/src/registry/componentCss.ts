import {
  granularityComponentConfigs,
  resolveGranularityComponentNames,
  type GranularityComponentSelection,
  type GranularityComponentName,
} from './components'

export const granularityComponentCssUrls = Object.fromEntries(
  Object.entries(granularityComponentConfigs).map(([name, config]) => [name, config.cssFiles]),
) as Record<GranularityComponentName, readonly string[]>

export function getGranularityComponentCssUrls(
  selection: GranularityComponentSelection = 'all',
): string[] {
  const componentNames = resolveGranularityComponentNames(selection)

  return [...new Set(componentNames.flatMap(componentName => granularityComponentCssUrls[componentName]))]
}