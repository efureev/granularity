import { splitClassTokens } from '../shared/classTokens'
import { borderClassByState } from './dsTextareaStyles'

export const dsTextareaSafelist = [...new Set([
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
])]
