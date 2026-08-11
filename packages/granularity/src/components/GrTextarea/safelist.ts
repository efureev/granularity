import { splitClassTokens } from '../shared/classTokens'
import {
  borderClassByState,
  countClass,
  countRowClass,
  lineCountClass,
  disabledSurfaceClass,
  enabledSurfaceClass,
  invalidBorderClass,
  resizeClass,
  sizes,
} from './grTextareaStyles'

export const grTextareaSafelist = [...new Set([
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens(invalidBorderClass),
  ...Object.values(sizes).flatMap(splitClassTokens),
  ...Object.values(resizeClass).flatMap(splitClassTokens),
  ...splitClassTokens(enabledSurfaceClass),
  ...splitClassTokens(disabledSurfaceClass),
  ...splitClassTokens(countClass),
  ...splitClassTokens(countRowClass),
  ...splitClassTokens(lineCountClass),
])]
