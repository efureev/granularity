import { splitClassTokens } from '../shared/classTokens'
import {
  baseRootClass,
  colorClass,
  disabledStateClass,
  focusRingClass,
  sizeClassBySize,
  underlineClasses,
} from './grLinkStyles'

export const grLinkSafelist = [...new Set([
  ...splitClassTokens(baseRootClass),
  ...splitClassTokens(focusRingClass),
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...underlineClasses.flatMap(splitClassTokens),
  ...splitClassTokens(colorClass),
  ...splitClassTokens(disabledStateClass),
])]
