import { splitClassTokens } from '../shared/classTokens'
import { borderClassByState, grTreeSelectPanelClass, sizeClassBySize } from './grTreeSelectStyles'

export const grTreeSelectSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  'pr-9',
  ...splitClassTokens(grTreeSelectPanelClass),
])]
