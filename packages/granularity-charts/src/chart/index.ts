/**
 * Арифметика графика — без Vue и без DOM.
 *
 * Отдаётся отдельным subpath (`@feugene/granularity-charts/chart`): по ней
 * строят свою разметку там, где готового компонента не хватает, и на ней же
 * держится основной объём тестов — эти ошибки проявляются не исключением, а
 * «немного не тем» рисунком.
 */
export type {
  ChartData,
  GrChartPoint,
  GrChartSeries,
  GrChartXValue,
  NormalizedPoint,
  NormalizedSeries,
  NormalizeOptions,
  PadDomainOptions,
} from './chartModel'
export { extentOf, inferScaleKind, normalizeChartData, padDomain } from './chartModel'

export type { BandScaleOptions, GrChartScale, GrChartScaleKind } from './chartScale'
export { bandScale, createScale, linearScale, nearestIndex, timeScale } from './chartScale'

export type { GrTimeTickUnit, LinearTicks, TimeTicks } from './chartTicks'
export { bandTicks, linearTicks, niceNumber, timeTicks } from './chartTicks'

export type { GrChartCurve, GrChartDashPattern, GrChartPointShape, PathPoint } from './chartPath'
export {
  areaPath,
  bandPath,
  dashArrayFor,
  GR_CHART_DASHES,
  GR_CHART_SHAPES,
  linePath,
  segmentsOf,
  symbolPath,
} from './chartPath'

export type { ChartMark } from './chartMarks'
export { activeSymbolMarks, symbolMarks, toPixelPoints, toStackBand } from './chartMarks'

export type { GrChartSeriesStyle } from './chartSeriesStyle'
export { GR_CHART_SERIES_COLORS, seriesStyle } from './chartSeriesStyle'

export type { GrChartNumberFormat } from './chartFormat'
export {
  formatNumber,
  formatShare,
  formatTimeTick,
  formatTimeValue,
  formatValue,
  resetChartFormatCache,
} from './chartFormat'

export type { PieSlice, Point } from './chartArc'
export { angleOfPoint, arcCentroid, arcPath, pieSlices, polarPoint, sliceAtPoint } from './chartArc'

export type { ChartLayout, ChartLayoutInput, Rect } from './chartLayout'
export { chartLayout, estimateTextWidth } from './chartLayout'

export type { ChartTableColumn, ChartTableModel, ChartTableOptions, ChartTableRow } from './chartTable'
export { chartTableModel } from './chartTable'
