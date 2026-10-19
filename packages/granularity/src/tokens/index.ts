/**
 * Реестр покомпонентных токенов ядра: `@feugene/granularity/tokens`.
 *
 * Источник — `tokens.json` рядом с кодом каждого компонента (гейт — тест
 * `src/__tests__/tokens.generated.test.ts`). Глобальные токены — примитивы,
 * роли, производные — и данные тем живут в `@feugene/granularity-tokens`.
 *
 * Намеренно НЕ реэкспортируется из корневого `src/index.ts`: это данные для
 * доков и инструментов, приложениям в рантайме они не нужны, и тащить их в
 * основной бандл было бы прямым нарушением идеологии гранулярности.
 */
export { grComponentTokens } from './generated'
export type { GrComponentToken, GrComponentTokenKind } from './types'
