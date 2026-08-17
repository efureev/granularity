export type { GrChartSize as GrChartWaterfallSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Оформление моста — токенами через атрибуты SVG.
 *
 * Именно атрибутами: `<path>` красится `fill`/`stroke`, а не `color`, поэтому
 * утилита вида `text-[var(--x)]` на нём не даёт ничего. Гейт `svgPaint.test.ts`
 * держит это правило.
 */

/**
 * Цвет столбца — по знаку шага, а не по индексу серии.
 *
 * Мост это один ряд, и палитра серий здесь ничего не различает: различать надо
 * прибавление и убавление. Роли семантические, поэтому в тёмной теме они
 * подстраиваются сами.
 */
export const waterfallRiseFill = 'var(--gr-success)'
export const waterfallFallFill = 'var(--gr-danger)'

/** Итог и объявленное накопление — нейтральным цветом первой серии: это не движение. */
export const waterfallTotalFill = 'var(--gr-chart-1)'

/** Нулевой шаг — ни прибавление, ни убавление; приглушённая роль вместо обеих. */
export const waterfallZeroFill = 'var(--gr-muted-fg)'

export const waterfallConnectorStroke = 'var(--gr-chart-waterfall-connector,var(--gr-brd))'
export const waterfallConnectorWidth = 'var(--gr-chart-waterfall-connector-width,1px)'

/** Толщина черты нулевого шага: «движения не было» — факт, и он обязан быть виден. */
export const waterfallZeroStepWidth = 'var(--gr-chart-waterfall-zero-step,2px)'

/**
 * Скругление дальнего конца столбца.
 *
 * Числом, а не токеном: радиус идёт в геометрию пути, которая считается в JS.
 * Мельче, чем у столбцов: шагов в мосте обычно больше, и полосы уже.
 */
export const DEFAULT_WATERFALL_BAR_RADIUS = 2
