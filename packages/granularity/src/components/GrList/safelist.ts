import { splitClassTokens } from '../shared/classTokens'
import {
  densityPadding,
  dividedClass,
  emptyClass,
  itemDescriptionClass,
  itemDisabledClass,
  itemHoverClass,
  itemInteractiveClass,
  itemLayoutClass,
  itemTitleClass,
  loadingRowClass,
} from './grListStyles'

export const grListSafelist = [...new Set([
  ...Object.values(densityPadding).flatMap(splitClassTokens),
  ...splitClassTokens(itemLayoutClass),
  ...splitClassTokens(itemTitleClass),
  ...splitClassTokens(itemDescriptionClass),
  ...splitClassTokens(itemInteractiveClass),
  ...splitClassTokens(itemHoverClass),
  ...splitClassTokens(itemDisabledClass),
  ...splitClassTokens(dividedClass),
  ...splitClassTokens(emptyClass),
  ...splitClassTokens(loadingRowClass),
])]
