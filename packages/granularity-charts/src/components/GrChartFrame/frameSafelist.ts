import { splitClassTokens } from '../../internal/classTokens'

import {
  frameLabelClass,
  labelSizeClass,
  frameLegendClass,
  frameLegendItemClass,
  frameLegendItemHiddenClass,
  frameLegendSwatchClass,
  frameRootClass,
  frameStateClass,
  frameSurfaceClass,
  frameSvgClass,
  frameTableCellClass,
  frameTableClass,
  frameTooltipClass,
  frameTooltipRowClass,
  frameTooltipTitleClass,
  frameTooltipValueClass,
} from './chartFrameStyles'

/**
 * Классы рамы из `.ts`-хелпера обязаны быть в safelist каждого компонента,
 * который раму рендерит.
 *
 * Шаблоны рамы safelist'а **не требуют**: они лежат в
 * `src/components/GrChartFrame/shared/`, их чанки уезжают в
 * `dist/groups/GrChartFrame/shared/`, и компонент с `group: 'GrChartFrame'`
 * заставляет пресет сканировать эту директорию — штатный механизм общих SFC
 * (`packaging.md`, `GranularComponentDescriptor.group`).
 *
 * А вот `chartFrameStyles.ts` под скан не подпадает: `.ts`-хелпер бандлер
 * выносит в общий `dist/chunks/` — правило то же, что и в ядре. Симптом
 * пропуска узнаваемый: размеры работают, цвета прозрачные, фокус-кольца нет.
 */
export const chartFrameSafelist: string[] = [...new Set([
  ...splitClassTokens(frameRootClass),
  ...splitClassTokens(frameSvgClass),
  ...splitClassTokens(frameSurfaceClass),
  ...splitClassTokens(frameLabelClass),
  ...splitClassTokens(frameStateClass),
  ...splitClassTokens(frameTooltipClass),
  ...splitClassTokens(frameTooltipTitleClass),
  ...splitClassTokens(frameTooltipRowClass),
  ...splitClassTokens(frameTooltipValueClass),
  ...splitClassTokens(frameLegendClass),
  ...splitClassTokens(frameLegendItemClass),
  ...splitClassTokens(frameLegendItemHiddenClass),
  ...splitClassTokens(frameLegendSwatchClass),
  ...splitClassTokens(frameTableClass),
  ...splitClassTokens(frameTableCellClass),
  ...Object.values(labelSizeClass).flatMap(splitClassTokens),
])]
