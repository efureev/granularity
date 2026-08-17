import { chartFrameSafelist } from '../GrChartFrame/frameSafelist'
import { splitClassTokens } from '../../internal/classTokens'
import { heatmapLegendClass, heatmapLegendLabelClass, heatmapLegendSwatchClass } from './grChartHeatmapLegend'

/**
 * Классы рамы плюс свои: легенда теплокарты — единственная её часть на HTML, а
 * не на SVG, и её классы живут в `.ts`-хелпере, который бандлер уносит в
 * `dist/chunks/`. Пресет туда не заглядывает.
 */
export const grChartHeatmapSafelist: string[] = [...new Set([
  ...chartFrameSafelist,
  ...splitClassTokens(heatmapLegendClass),
  ...splitClassTokens(heatmapLegendSwatchClass),
  ...splitClassTokens(heatmapLegendLabelClass),
])]
