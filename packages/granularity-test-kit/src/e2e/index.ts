/**
 * E2E-слой — `@feugene/granularity-test-kit/e2e`.
 *
 * Механика без данных: какие цели сканировать, что у них за долг и какие у них
 * селекторы, знает приложение. Здесь — модель гейта, обход клавиатурой и
 * ожидания, которые в каждом наборе спек пишутся заново.
 */
export { a11yRegressions, type A11yScanOptions, expectNoA11yRegressions, WCAG_TAGS } from './axe'
export {
  type A11yRegression,
  type A11yViolationLike,
  BLOCKING_IMPACTS,
  selectRegressions,
  type SelectRegressionsOptions,
} from './regressions'
export { type A11yBaseline, type A11yBaselineOptions, createA11yBaseline } from './baseline'
export { expectTabCycle, focusedDescription, tabUntil } from './keyboard'
export { waitForOpaque } from './wait'
