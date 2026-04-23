import { splitClassTokens } from '../shared/classTokens'
import { borderClassByState, dsTreeSelectPanelClass, sizeClassBySize } from './dsTreeSelectStyles'

export const dsTreeSelectSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  'pr-9',
  ...splitClassTokens(dsTreeSelectPanelClass),
])]
