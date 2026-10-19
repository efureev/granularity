import { grThemeCatalog, type GrThemeCatalogEntry } from '@feugene/granularity-tokens'
import type { GranumModeEntry, GranumThemeManifest } from '@feugene/granum/runtime'

/**
 * Где тема каталога в CSS сборки: активная — под `:root` и своими парами,
 * превью — только парами (`previews` конфига granum), иначе её блоков нет.
 */
export type ThemeBuild = 'active' | 'preview' | 'absent'

export interface DesignTheme {
  entry: GrThemeCatalogEntry
  build: ThemeBuild
  /** Режимы с парами из манифеста сборки; у темы вне сборки — пусто. */
  modes: readonly GranumModeEntry[]
}

/**
 * Темы превью для конфига granum: весь каталог, кроме активной. Дизайн-система
 * показывает каждую тему на настоящих компонентах, а полные блоки пар с токенами
 * компонентов собирает только granum.
 */
export function previewThemeIds(active: string): string[] {
  return grThemeCatalog.map(theme => theme.id).filter(id => id !== active)
}

export function themeModes(manifest: GranumThemeManifest, theme: string = manifest.theme.id): readonly GranumModeEntry[] {
  if (theme === manifest.theme.id)
    return manifest.modes
  return manifest.previews?.find(preview => preview.theme.id === theme)?.modes ?? []
}

export function designThemes(manifest: GranumThemeManifest): DesignTheme[] {
  return grThemeCatalog.map((entry) => {
    const modes = themeModes(manifest, entry.id)
    const build: ThemeBuild = entry.id === manifest.theme.id ? 'active' : modes.length > 0 ? 'preview' : 'absent'
    return { entry, build, modes }
  })
}

export function findDesignTheme(manifest: GranumThemeManifest, id: string): DesignTheme | undefined {
  return designThemes(manifest).find(theme => theme.entry.id === id)
}

export const THEME_BUILD_LABEL: Record<ThemeBuild, string> = {
  active: 'активная',
  preview: 'превью',
  absent: 'вне сборки',
}
