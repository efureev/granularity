import { splitClassTokens } from '../shared/classTokens'
import {
  densityPadding,
  dividedClass,
  emptyClass,
  itemDisabledClass,
  itemHoverClass,
  itemInteractiveClass,
  itemLayoutClass,
  loadingRowClass,
} from './grListStyles'

export const grListSafelist = [...new Set([
  ...Object.values(densityPadding).flatMap(splitClassTokens),
  ...splitClassTokens(itemLayoutClass),
  ...splitClassTokens(itemInteractiveClass),
  ...splitClassTokens(itemHoverClass),
  ...splitClassTokens(itemDisabledClass),
  ...splitClassTokens(dividedClass),
  ...splitClassTokens(emptyClass),
  ...splitClassTokens(loadingRowClass),
])]
