/**
 * Словарь токенов и каталог тем — `@feugene/granularity-tokens`.
 *
 * Реестр без значений: какие токены есть и что значат. Значения живут в данных
 * темы и подключаются по требованию — статически, когда тема известна заранее
 * (`import slate from '@feugene/granularity-tokens/themes/slate/theme.json'`), или
 * `loadThemeData(id)`, когда её выбирают в рантайме: по чанку на тему. Иначе
 * каждая новая тема раздувала бы бандл каждого, кто читает реестр.
 */
export { grDerivedTokens, grFoundationTokens, grRoleTokens, grThemeCatalog } from './generated'
export { GR_BASE_THEME_ID, grThemeManifest } from './manifest'
export type { GrThemeManifest, GrThemeManifestMode, GrThemeManifestTheme } from './manifest'
export { resolveModes } from './modes'
export { loadThemeData } from './loadThemeData'
export type {
  GrCatalogMode,
  GrColorScheme,
  GrDerivedToken,
  GrFoundationToken,
  GrModeData,
  GrModeFallback,
  GrRegistry,
  GrRoleToken,
  GrThemeCatalogEntry,
  GrThemeData,
} from './types'
