export type GranularityComponentConfig<Name extends string = string> = {
  name: Name
  dependencies: readonly string[]
  safelist: readonly string[]
  cssFiles: readonly string[]
  cssFileAssetNames: readonly string[]
  styleAssetFileName: string | null
}

type DefineGranularityComponentConfigOptions<Name extends string> = {
  name: Name
  dependencies?: readonly string[]
  safelist: readonly string[]
  cssFiles?: readonly string[]
  emitStyleAsset?: boolean
}

export function defineGranularityComponentConfig<Name extends string>(
  importMetaUrl: string,
  options: DefineGranularityComponentConfigOptions<Name>,
): GranularityComponentConfig<Name> {
  const cssFiles = options.cssFiles ?? []

  return {
    name: options.name,
    dependencies: [...(options.dependencies ?? [])],
    safelist: [...options.safelist],
    cssFiles: cssFiles.map(file => new URL(file, importMetaUrl).href),
    cssFileAssetNames: cssFiles.map(file => `components/${options.name}/${file.replace(/^\.\//, '')}`),
    styleAssetFileName: options.emitStyleAsset === false
      ? null
      : `components/${options.name}/styles.css`,
  }
}