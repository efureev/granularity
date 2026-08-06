import { splitClassTokens } from '../shared/classTokens'
import {
  borderClassByState,
  countClass,
  disabledSurfaceClass,
  enabledSurfaceClass,
  resizeClass,
  sizes,
} from './grTextareaStyles'

export const grTextareaSafelist = [...new Set([
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  ...Object.values(sizes).flatMap(splitClassTokens),
  ...Object.values(resizeClass).flatMap(splitClassTokens),
  ...splitClassTokens(enabledSurfaceClass),
  ...splitClassTokens(disabledSurfaceClass),
  ...splitClassTokens(countClass),
])]
