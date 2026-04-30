import { splitClassTokens } from '../shared/classTokens'
import { borderClassByState } from './grTextareaStyles'

export const grTextareaSafelist = [...new Set([
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
])]
