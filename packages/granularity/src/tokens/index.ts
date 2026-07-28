/**
 * Справочник токенов как данные: `@feugene/granularity/tokens`.
 *
 * Источник — `tokens/*.json` пакета, из них же генерируются CSS-файлы, так что
 * этот модуль не может разойтись с реальными значениями (гейт — тест
 * `src/__tests__/tokens.generated.test.ts`).
 *
 * Намеренно НЕ реэкспортируется из корневого `src/index.ts`: это данные для
 * доков и инструментов, приложениям в рантайме они не нужны, и тащить их в
 * основной бандл было бы прямым нарушением идеологии гранулярности.
 */
export { grDerivedTokens, grFoundationTokens, grThemeNames, grThemeTokens } from './generated'
export type {
  GrDerivedToken,
  GrFoundationToken,
  GrThemeName,
  GrThemeToken,
  GrTokenValues,
} from './types'
