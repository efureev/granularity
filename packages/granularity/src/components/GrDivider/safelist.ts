import { splitClassTokens } from '../shared/classTokens'
import {
  horizontalLineClass,
  horizontalSpacingClass,
  labelLineClass,
  labelRootClass,
  lineVariantClass,
  verticalLineClass,
  verticalSpacingClass,
} from './grDividerStyles'

// Литералы живут в `.ts`-хелпере, а он на сборке уезжает в общий чанк — скан
// шаблонов их не увидит. Отсюда и safelist: без него `dashed`-разделитель
// оказался бы разделителем без линии.
export const grDividerSafelist = [...new Set([
  ...splitClassTokens(horizontalLineClass),
  ...splitClassTokens(verticalLineClass),
  ...splitClassTokens(labelRootClass),
  ...splitClassTokens(labelLineClass),
  ...Object.values(lineVariantClass).flatMap(splitClassTokens),
  ...Object.values(horizontalSpacingClass).flatMap(splitClassTokens),
  ...Object.values(verticalSpacingClass).flatMap(splitClassTokens),
])]
