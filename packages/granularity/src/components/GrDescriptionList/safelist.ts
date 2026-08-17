import { splitClassTokens } from '../shared/classTokens'

import {
  descriptionColumnsClass,
  descriptionDensityClass,
  descriptionDividedClass,
  descriptionLabelInlineClass,
  descriptionLabelStackedClass,
  descriptionPairFlowClass,
  descriptionPairInlineClass,
  descriptionPairStackedClass,
  descriptionRootClass,
  descriptionRootFlowClass,
  descriptionRootGridClass,
  descriptionSizeClass,
  descriptionValueClass,
  descriptionValueToneClass,
} from './grDescriptionListStyles'

// Классы из вычисляемых мап (тон, размер, колонки) UnoCSS сканом не находит —
// только safelist. Литералы хелпера туда же: на сборке он уезжает в общий чанк.
export const grDescriptionListSafelist = [...new Set([
  ...splitClassTokens(descriptionRootClass),
  ...splitClassTokens(descriptionRootGridClass),
  ...splitClassTokens(descriptionRootFlowClass),
  ...splitClassTokens(descriptionPairInlineClass),
  ...splitClassTokens(descriptionPairStackedClass),
  ...splitClassTokens(descriptionPairFlowClass),
  ...splitClassTokens(descriptionDividedClass),
  ...splitClassTokens(descriptionLabelInlineClass),
  ...splitClassTokens(descriptionLabelStackedClass),
  ...splitClassTokens(descriptionValueClass),
  ...Object.values(descriptionColumnsClass).flatMap(splitClassTokens),
  ...Object.values(descriptionValueToneClass).flatMap(splitClassTokens),
  ...Object.values(descriptionSizeClass).flatMap(splitClassTokens),
  ...Object.values(descriptionDensityClass).flatMap(splitClassTokens),
])]
