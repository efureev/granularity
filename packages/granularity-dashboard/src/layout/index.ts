/**
 * Арифметика раскладки — `@feugene/granularity-dashboard/layout`.
 *
 * Ни Vue, ни DOM: чистые функции над целыми ячейками. Подпуть отдельный,
 * потому что раскладку берут и без компонентов — например чтобы проверить ту,
 * что пришла с сервера, или перенести её в другую сетку на стороне бэкенда.
 */
export type {
  GrDashboardBreakpoint,
  GrDashboardBreakpoints,
  GrDashboardCols,
  GrDashboardCompaction,
  GrDashboardItemLayout,
  GrDashboardLayout,
  GrDashboardResponsiveLayout,
} from './layoutModel'
export {
  clampHeight,
  clampItem,
  clampWidth,
  findItem,
  GR_DASHBOARD_BREAKPOINTS,
  GR_DASHBOARD_COLS,
  maxHeightOf,
  maxWidthOf,
  minHeightOf,
  minWidthOf,
  normalizeLayout,
  rowsOf,
  sortLayout,
} from './layoutModel'

export type { ResolveCollisionsOptions } from './layoutCollision'
export { collides, collisionsWith, compact, firstCollision, resolveCollisions } from './layoutCollision'

export type { GrDashboardCell, GrDashboardMoveOptions, GrDashboardSpan } from './layoutMove'
export { addItem, moveItem, removeItem, resizeItem } from './layoutMove'

export type { GrDashboardMetrics, GrDashboardRect } from './layoutGeometry'
export { cellFromDelta, colStep, metricsOf, rectOfItem, rowStep, spanFromDelta } from './layoutGeometry'

export type { LayoutForOptions } from './layoutBreakpoints'
export {
  colsFor,
  deriveLayout,
  layoutFor,
  orderedBreakpoints,
  resolveBreakpoint,
  withBreakpointLayout,
} from './layoutBreakpoints'

export type { GrDashboardLayoutSnapshot, ParseLayoutOptions } from './layoutSerialize'
export {
  GR_DASHBOARD_LAYOUT_VERSION,
  layoutsEqual,
  parseLayout,
  serializeLayout,
} from './layoutSerialize'
