import { splitClassTokens } from '../shared/classTokens'

import {
  jsonValueClass,
  jsonViewerContentClass,
  jsonViewerCopyClass,
  jsonViewerKeyClass,
  jsonViewerMutedClass,
  jsonViewerPunctuationClass,
  jsonViewerRootClass,
  jsonViewerRowClass,
  jsonViewerSearchClass,
  jsonViewerToolbarClass,
  jsonViewerValueClass,
} from './grJsonViewerStyles'

// Классы из вычисляемой мапы (цвет по виду значения) UnoCSS сканом не находит —
// только safelist. Литералы хелпера туда же: на сборке он уезжает в общий чанк,
// который скан не видит.
export const grJsonViewerSafelist = [...new Set([
  ...splitClassTokens(jsonViewerRootClass),
  ...splitClassTokens(jsonViewerToolbarClass),
  ...splitClassTokens(jsonViewerSearchClass),
  ...splitClassTokens(jsonViewerRowClass),
  ...splitClassTokens(jsonViewerContentClass),
  ...splitClassTokens(jsonViewerKeyClass),
  ...splitClassTokens(jsonViewerPunctuationClass),
  ...splitClassTokens(jsonViewerValueClass),
  ...splitClassTokens(jsonViewerMutedClass),
  ...splitClassTokens(jsonViewerCopyClass),
  ...Object.values(jsonValueClass).flatMap(splitClassTokens),
])]
