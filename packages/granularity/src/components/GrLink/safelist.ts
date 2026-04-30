import { splitClassTokens } from '../shared/classTokens'
import {
  baseRootClass,
  disabledStateClass,
  focusRingClass,
  sizeClassBySize,
  underlineClasses,
  variantClassByVariant,
} from './grLinkStyles'

export const grLinkSafelist = [...new Set([
  ...splitClassTokens(baseRootClass),
  ...splitClassTokens(focusRingClass),
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...underlineClasses.flatMap(splitClassTokens),
  ...Object.values(variantClassByVariant).flatMap(splitClassTokens),
  ...splitClassTokens(disabledStateClass),
])]
