import type { GranumModeEntry, GranumThemeManifest } from '@feugene/granum/runtime'
import { grThemeCatalog, type GrThemeCatalogEntry } from '@feugene/granularity-tokens'

/**
 * Где тема каталога в CSS сборки: основная — в общем листе и под `:root`,
 * дополнительная — своим листом (`themes` конфига granum), иначе её блоков нет.
 */
export type ThemeBuild = 'default' | 'built' | 'absent'

export interface DesignTheme {
  entry: GrThemeCatalogEntry
  build: ThemeBuild
  /** Режимы с парами из манифеста сборки; у темы вне сборки — пусто. */
  modes: readonly GranumModeEntry[]
}

/**
 * Темы сборки для конфига granum: весь каталог со всеми режимами каждой темы,
 * основная — `main`. Дизайн-система показывает каждую тему на настоящих
 * компонентах, а полные блоки пар с токенами компонентов собирает только granum.
 */
export function buildThemes(main: string): { theme: string, default: boolean, modes: string[] }[] {
  return grThemeCatalog.map(theme => ({ theme: theme.id, default: theme.id === main, modes: theme.modes.map(mode => mode.name) }))
}

export function themeModes(manifest: GranumThemeManifest, theme: string = manifest.defaultTheme): readonly GranumModeEntry[] {
  return manifest.themes.find(entry => entry.id === theme)?.modes ?? []
}

export function designThemes(manifest: GranumThemeManifest): DesignTheme[] {
  return grThemeCatalog.map((entry) => {
    const modes = themeModes(manifest, entry.id)
    const build: ThemeBuild = entry.id === manifest.defaultTheme ? 'default' : modes.length > 0 ? 'built' : 'absent'
    return { entry, build, modes }
  })
}

export function findDesignTheme(manifest: GranumThemeManifest, id: string): DesignTheme | undefined {
  return designThemes(manifest).find(theme => theme.entry.id === id)
}

/**
 * Тема островов страницы — всегда явно, и у основной тоже: тему документа
 * переключают, и остров, наследующий её, показал бы на странице «Сланца»
 * другую тему. Темы вне сборки — без острова: её пар в CSS нет.
 */
export function islandTheme(theme: DesignTheme): string | undefined {
  return theme.build === 'absent' ? undefined : theme.entry.id
}

/**
 * Как тема связана с источником: наследник идёт за правками родителя на каждой
 * сборке, независимая тема — копия или своя с нуля — держит все значения сама.
 */
export function themeLineage(entry: GrThemeCatalogEntry): string {
  if (entry.extends === undefined)
    return 'независимая: все значения свои'
  const parent = grThemeCatalog.find(theme => theme.id === entry.extends)
  return `наследует «${parent?.title ?? entry.extends}»`
}

/** Пакеты компонентов, под версии которых тема написана: `пакет диапазон`. */
export function themeTargets(entry: GrThemeCatalogEntry): string[] {
  return Object.entries(entry.targets ?? {}).map(([packageId, range]) => `${packageId} ${range}`)
}

export const THEME_BUILD_LABEL: Record<ThemeBuild, string> = {
  default: 'основная',
  built: 'дополнительная',
  absent: 'вне сборки',
}
