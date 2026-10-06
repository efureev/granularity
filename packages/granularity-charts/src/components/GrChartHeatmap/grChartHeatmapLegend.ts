/**
 * Классы легенды теплокарты — единственной её части на HTML, а не на SVG.
 *
 * Отдельным файлом от `grChartHeatmapStyles.ts`: там живут числа и цвета для
 * атрибутов SVG, а здесь — утилиты.
 */

export const heatmapLegendClass
  = 'flex items-center gap-2 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-normal)]'

export const heatmapLegendSwatchClass = 'h-[var(--gr-space-3)] flex-1'

export const heatmapLegendLabelClass = 'shrink-0 text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]'
