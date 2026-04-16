export const granularityThemeNames = ['light', 'dark'] as const

export type GranularityThemeName = (typeof granularityThemeNames)[number]

export const granularityDefaultThemes = ['light'] as const satisfies readonly GranularityThemeName[]

export type GranularityBaseFile = string
export type GranularityTokensFile = string
export type GranularityThemeFile = string

export type GranularityThemeCssOptions = {
  themes?: readonly GranularityThemeName[]
  themeFiles?: readonly GranularityThemeFile[]
}

export const granularityDefaultBaseCssUrl = new URL('../styles/base.css', import.meta.url).href
export const granularityDefaultTokensCssUrl = new URL('../styles/tokens.css', import.meta.url).href

export const granularityThemeUrls = {
  light: new URL('../styles/themes/light.css', import.meta.url).href,
  dark: new URL('../styles/themes/dark.css', import.meta.url).href,
} as const satisfies Record<GranularityThemeName, string>

export function resolveGranularityThemeNames(
  themes?: readonly GranularityThemeName[],
): GranularityThemeName[] {
  const selectedThemes = themes?.length
    ? themes
    : granularityDefaultThemes

  return [...new Set(selectedThemes)]
}

export function resolveGranularityThemeFiles(
  themeFiles?: readonly GranularityThemeFile[],
): GranularityThemeFile[] {
  return [...new Set((themeFiles ?? []).filter(Boolean))]
}

export function resolveGranularityBuiltinThemeNames(
  options: GranularityThemeCssOptions = {},
): GranularityThemeName[] {
  if (options.themes?.length)
    return resolveGranularityThemeNames(options.themes)

  if (resolveGranularityThemeFiles(options.themeFiles).length)
    return []

  return resolveGranularityThemeNames()
}