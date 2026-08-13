import { splitClassTokens } from '../../internal/classTokens'
import { chartFrameSafelist } from '../GrChartFrame/frameSafelist'

import {
  pieLegendClass,
  pieLegendItemClass,
  pieLegendSwatchClass,
  pieLegendValueClass,
} from './grChartPieStyles'

/**
 * Классы рамы и собственной легенды обязаны быть в safelist.
 *
 * Оба набора живут в `.ts`-хелперах, а бандлер уносит их в общий
 * `dist/chunks/`, куда скан пресета не заглядывает. Шаблон самого круга
 * safelist'а не требует: он лежит в `dist/components/GrChartPie/`, которую
 * пресет сканирует. Симптом пропуска узнаваемый: круг на месте, легенда без
 * отступов и цвета.
 */
export const grChartPieSafelist: string[] = [...new Set([
  ...chartFrameSafelist,
  ...splitClassTokens(pieLegendClass),
  ...splitClassTokens(pieLegendItemClass),
  ...splitClassTokens(pieLegendValueClass),
  ...splitClassTokens(pieLegendSwatchClass),
])]
