import type { Preflight, Preset } from 'unocss'

import {
  getGranularityComponentPreflights,
} from '../registry/componentCss.node'
import {
  getGranularityThemePreflights,
  type GranularityBaseFile,
  type GranularityThemeFile,
  type GranularityThemeName,
  type GranularityTokensFile,
} from '../theming/themeRegistry.node'
import {
  presetGranularity,
  type GranularityComponentSelection,
  type PresetGranularityOptions,
} from './preset'

export type PresetGranularityNodeOptions = Omit<PresetGranularityOptions, 'preflights'> & {
  baseFile?: GranularityBaseFile
  tokens?: GranularityTokensFile
  themes?: readonly GranularityThemeName[]
  themeFiles?: readonly GranularityThemeFile[]
}

export function resolvePresetGranularityNodePreflights(
  options: PresetGranularityNodeOptions = {},
): Preflight[] {
  const selectedComponents = options.components ?? 'all'

  return [
    ...getGranularityThemePreflights(options),
    ...getGranularityComponentPreflights(selectedComponents),
  ]
}

export function presetGranularityNode(
  options: PresetGranularityNodeOptions = {},
): Preset {
  return presetGranularity({
    components: options.components,
    layer: options.layer,
    preflights: resolvePresetGranularityNodePreflights(options),
  })
}

export type {
  GranularityBaseFile,
  GranularityComponentSelection,
  GranularityThemeFile,
  GranularityThemeName,
  GranularityTokensFile,
}
export {
  createGranularityCssPreflight,
  createGranularityCssPreflights,
  getGranularitySafelist,
  granularityComponents,
  granularityDefaultThemes,
  granularitySafelist,
  granularityThemeNames,
  presetGranularity,
  resolveGranularityBuiltinThemeNames,
  resolveGranularityThemeFiles,
  resolveGranularityThemeNames,
  resolvePresetGranularityPreflights,
  resolvePresetGranularitySafelist,
} from './preset'
export {
  getGranularityComponentCss,
  getGranularityComponentCssFiles,
  getGranularityComponentPreflights,
} from '../registry/componentCss.node'
export {
  getGranularityBaseCss,
  getGranularityThemeCss,
  getGranularityThemePreflights,
  getGranularityTokensCss,
  resolveGranularityBaseFile,
  resolveGranularityTokensFile,
} from '../theming/themeRegistry.node'