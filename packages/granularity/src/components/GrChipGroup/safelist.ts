import { splitClassTokens } from '../shared/classTokens'

import { chipGroupRootClass } from './grChipGroupStyles'

export const grChipGroupSafelist = [...new Set([
  ...splitClassTokens(chipGroupRootClass),
])]
