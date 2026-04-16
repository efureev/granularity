import type { Preflight, Preset } from 'unocss'

import {
  granularityComponents,
  type GranularityComponentName,
} from '../registry/components'
import {
  granularitySafelist,
  getGranularitySafelist,
  type GranularityComponentSelection,
} from '../registry/safelist'
import {
  granularityDefaultThemes,
  granularityThemeNames,
  resolveGranularityBuiltinThemeNames,
  resolveGranularityThemeFiles,
  resolveGranularityThemeNames,
  type GranularityThemeName,
} from '../theming/themeRegistry'
import { animationPreflights, animationRules } from './rules/animation'
import { colorOpacityRules } from './rules/colorOpacity'
import { filterRules } from './rules/filters'
import { spacingRules, spacingVariants } from './rules/spacing'

export type {
  GranularityComponentName,
  GranularityComponentSelection,
  GranularityThemeName,
}

export {
  animationPreflights,
  animationRules,
  getGranularitySafelist,
  granularityComponents,
  granularityDefaultThemes,
  granularitySafelist,
  granularityThemeNames,
  resolveGranularityBuiltinThemeNames,
  resolveGranularityThemeFiles,
  resolveGranularityThemeNames,
}

export type PresetGranularityOptions = {
  components?: GranularityComponentSelection
  layer?: string
  preflights?: readonly Preflight[]
}

type GranularityCssChunk = string | null | undefined | false

function resolveGranularityCssChunks(
  css: readonly GranularityCssChunk[],
): string[] {
  return css.filter((chunk): chunk is string => Boolean(chunk))
}

function applyGranularityLayerToPreflight(
  preflight: Preflight,
  layer?: string,
): Preflight {
  if (!layer || preflight.layer)
    return preflight

  return {
    ...preflight,
    layer,
  }
}

export function createGranularityCssPreflight(
  css: string,
  layer?: string,
): Preflight {
  return {
    getCSS: async () => css,
    layer,
  }
}

export function createGranularityCssPreflights(
  css: readonly GranularityCssChunk[],
  layer?: string,
): Preflight[] {
  const chunks = resolveGranularityCssChunks(css)

  if (!chunks.length)
    return []

  return [createGranularityCssPreflight(chunks.join('\n'), layer)]
}

export function resolvePresetGranularitySafelist(
  options: PresetGranularityOptions = {},
): string[] {
  if (options.components)
    return getGranularitySafelist(options.components)

  return granularitySafelist
}

export function resolvePresetGranularityPreflights(
  options: PresetGranularityOptions = {},
): Preflight[] {
  return (options.preflights ?? []).map(preflight => applyGranularityLayerToPreflight(preflight, options.layer))
}

export function presetGranularity(options: PresetGranularityOptions = {}): Preset {
  return {
    name: 'granularity-preset',
    layer: options.layer,
    safelist: resolvePresetGranularitySafelist(options),
    preflights: [
      ...resolvePresetGranularityPreflights(options),
      ...animationPreflights.map(preflight => applyGranularityLayerToPreflight(preflight, options.layer)),
    ],
    variants: spacingVariants,
    rules: [
      ...animationRules,
      ...spacingRules,
      ...colorOpacityRules,
      ...filterRules,
    ],
  }
}
