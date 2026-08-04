import { splitClassTokens } from '../shared/classTokens'
import { borderClassByState, sizes } from './grTextareaStyles'

export const grTextareaSafelist = [...new Set([
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  ...Object.values(sizes).flatMap(splitClassTokens),
])]
