import { splitClassTokens } from '../shared/classTokens'

import { valuePrefixClass, valueRootClass, valueSuffixClass } from './grValueStyles'

// Классы живут в `.ts`-хелпере: на сборке он уезжает в общий чанк, который скан
// пресета не видит. Ссылками на конст, а не копиями строк — копия разойдётся.
export const grValueSafelist = [...new Set([
  ...splitClassTokens(valueRootClass),
  ...splitClassTokens(valuePrefixClass),
  ...splitClassTokens(valueSuffixClass),
])]
