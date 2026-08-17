import { splitClassTokens } from '../shared/classTokens'

import {
  deltaArrowClass,
  deltaEmptyClass,
  deltaRootClass,
  deltaSizeClass,
  deltaSuffixClass,
  deltaToneClass,
} from './grDeltaStyles'

// Классы из вычисляемых мап (тон, размер) UnoCSS сканом не находит — только
// safelist. Литералы хелпера туда же: на сборке он уезжает в общий чанк.
export const grDeltaSafelist = [...new Set([
  ...splitClassTokens(deltaRootClass),
  ...splitClassTokens(deltaEmptyClass),
  ...splitClassTokens(deltaArrowClass),
  ...splitClassTokens(deltaSuffixClass),
  ...Object.values(deltaToneClass).flatMap(splitClassTokens),
  ...Object.values(deltaSizeClass).flatMap(splitClassTokens),
])]
