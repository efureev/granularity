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
export { extentOf, inferScaleKind, normalizeChartData, padDomain, resolveScaleKind } from './chartModel'

export type {
  GrChartReference,
  GrChartReferenceValue,
  NormalizedReference,
  ReferenceContext,
  ReferenceMark,
  ReferenceMarksOptions,
} from './chartReference'
export {
  normalizeReferences,
  referenceDomainValues,
  referenceMarks,
  referenceValueToNumber,
} from './chartReference'

export type { BandScaleOptions, GrChartScale, GrChartScaleKind } from './chartScale'
export { bandScale, createScale, linearScale, nearestIndex, timeScale } from './chartScale'

export type { GrTimeTickUnit, LinearTicks, TimeTicks } from './chartTicks'
export { bandTicks, linearTicks, niceNumber, timeTicks } from './chartTicks'

export type { GrChartCurve, GrChartDashPattern, GrChartPointShape, PathPoint } from './chartPath'
export {
  areaPath,
  bandPath,
  bridgePath,
  dashArrayFor,
  GR_CHART_DASHES,
  GR_CHART_SHAPES,
  linePath,
  segmentsOf,
  symbolPath,
} from './chartPath'

export type { BarDirection, BarRect, BarSlot, GroupSlotsOptions } from './chartBars'
export { barPath, barRect, groupSlots } from './chartBars'

export type { BulletBand, BulletLayoutOptions, BulletModel } from './chartBullet'
export { bulletLayout } from './chartBullet'

export type { FunnelOptions, FunnelStage, GrChartFunnelStage } from './chartFunnel'
export { funnelPath, funnelStages } from './chartFunnel'

export type {
  HeatmapCell,
  HeatmapGrid,
  HeatmapRoles,
  HeatmapScale,
  HeatmapScaleKind,
  HeatmapScaleOptions,
} from './chartHeatmap'
export { heatmapCells, heatmapColor, heatmapMatrix, heatmapOnDark, heatmapScale } from './chartHeatmap'

export type { GrChartWaterfallStep, WaterfallModel, WaterfallOptions, WaterfallSegment } from './chartWaterfall'
export { waterfallSegments } from './chartWaterfall'

export type { RadarHitBounds, RadarSegments } from './chartRadar'
export {
  alignSeriesToAxes,
  nearestAxis,
  perAxisMaxima,
  radarAreaPath,
  radarAxisAngles,
  radarLabelAnchor,
  radarLinePath,
  radarRingPath,
  radarSegments,
} from './chartRadar'

export type { ChartMark } from './chartMarks'
export { activeSymbolMarks, symbolMarks, toPixelPoints, toStackBand } from './chartMarks'

export type { GrChartSeriesStyle } from './chartSeriesStyle'
export { GR_CHART_SERIES_COLORS, seriesStyle } from './chartSeriesStyle'

export type { GrChartNumberFormat } from './chartFormat'
export {
  formatNumber,
  formatShare,
  formatTimeSequence,
  formatTimeTick,
  formatTimeValue,
  formatValue,
  resetChartFormatCache,
} from './chartFormat'

export type { PieSlice, Point } from './chartArc'
export { angleOfPoint, arcCentroid, arcPath, pieSlices, polarPoint, sliceAtPoint } from './chartArc'

export type { ChartLayout, ChartLayoutInput, LabelGutters, LabelGuttersInput, Rect } from './chartLayout'
export { chartLayout, estimateTextWidth, labelGutters } from './chartLayout'

export type { ChartTableColumn, ChartTableModel, ChartTableOptions, ChartTableRow } from './chartTable'
export { chartTableModel } from './chartTable'
