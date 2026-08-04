import { splitClassTokens } from '../shared/classTokens'
import { tableSizes } from './grTableStyles'

export const grTableSafelist = [...new Set([
  ...Object.values(tableSizes).flatMap(splitClassTokens),
])]
