/**
 * Словарь токенов и каталог тем — `@feugene/granularity-tokens`.
 *
 * Реестр без значений: какие токены есть и что значат. Значения живут в данных
 * темы и подключаются по требованию —
 * `import slate from '@feugene/granularity-tokens/themes/slate/theme.json'`, —
 * иначе каждая новая тема раздувала бы бандл каждого, кто читает реестр.
 */
export { grDerivedTokens, grFoundationTokens, grRoleTokens, grThemeCatalog } from './generated'
export { resolveModes } from './modes'
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
