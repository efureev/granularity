import { splitClassTokens } from '../shared/classTokens'

import {
  affixBaseClass,
  affixEdgeClass,
  affixSentinelClass,
  affixStickyClass,
  affixSurfaceClass,
} from './grAffixStyles'

export const grAffixSafelist = [...new Set([
  ...splitClassTokens(affixBaseClass),
  ...splitClassTokens(affixStickyClass),
  ...Object.values(affixEdgeClass).flatMap(splitClassTokens),
  ...Object.values(affixSurfaceClass).flatMap(splitClassTokens),
  ...Object.values(affixSentinelClass).flatMap(splitClassTokens),
])]
