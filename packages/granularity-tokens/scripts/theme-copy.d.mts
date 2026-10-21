export interface CopyGranularityThemeOptions {
  /** Id темы каталога или путь к исходнику темы. */
  source: string
  id: string
  /** Папка копии; по умолчанию `themes/<id>/` пакета. */
  dest?: string
  title?: string
  version?: string
  cwd?: string
}

export interface CopyGranularityThemeResult {
  dir: string
  files: readonly string[]
  /** Число режимов, у которых сняты посчитанные фолбэки. */
  strippedFallbacks: number
}

export function copyGranularityTheme(options: CopyGranularityThemeOptions): CopyGranularityThemeResult
export function stripComputedFallbacks(dir: string): number
