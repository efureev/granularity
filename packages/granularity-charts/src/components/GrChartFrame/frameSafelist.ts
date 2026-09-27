import { splitClassTokens } from '../../internal/classTokens'

import {
  frameGhostClass,
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
 * Классы рамы из `.ts`-хелпера — одним списком на все графики, который
 * подмешивает себе каждый компонент, раму рендерящий.
 *
 * Список пережил пресет v1: там скан видел только `dist/components/<Name>/**`,
 * а общий чанк с хелпером пропускал, и без этих строк график приезжал к
 * потребителю с прозрачными цветами и без фокус-кольца. granum извлекает
 * классы по графу бандла — общий чанк входит в файлы каждого дотянувшегося
 * компонента, — и находит их сам: на сборке список приходит предупреждением
 * `safelist-redundant`. Снимать его без сверки класс за классом нельзя:
 * пропущенный сломается тем же прозрачным цветом, только молча.
 */
export const chartFrameSafelist: string[] = [...new Set([
  ...splitClassTokens(frameRootClass),
  ...splitClassTokens(frameSvgClass),
  ...splitClassTokens(frameSurfaceClass),
  ...splitClassTokens(frameLabelClass),
  ...splitClassTokens(frameStateClass),
  ...splitClassTokens(frameGhostClass),
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
