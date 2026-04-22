import { splitClassTokens } from '../shared/classTokens'
import {
  disabledStateClass,
  sizeClassBySize,
  underlineClasses,
  variantClassByVariant,
} from './dsLinkStyles'

export const dsLinkSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...underlineClasses.flatMap(splitClassTokens),
  ...Object.values(variantClassByVariant).flatMap(splitClassTokens),
  ...splitClassTokens(disabledStateClass),
])]
