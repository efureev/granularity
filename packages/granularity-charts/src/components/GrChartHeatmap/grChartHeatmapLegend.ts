/**
 * Классы легенды теплокарты.
 *
 * Отдельным файлом от `grChartHeatmapStyles.ts`, потому что их импортирует
 * `safelist.ts`: тянуть в safelist весь модуль оформления значило бы тянуть и
 * геометрические константы, которым там делать нечего.
 */

export const heatmapLegendClass
  = 'flex items-center gap-2 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-normal)]'

export const heatmapLegendSwatchClass = 'h-[var(--gr-space-3)] flex-1'

export const heatmapLegendLabelClass = 'shrink-0 text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]'
