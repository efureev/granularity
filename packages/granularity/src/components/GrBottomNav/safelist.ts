import { splitClassTokens } from '../shared/classTokens'
import {
  itemActiveClass,
  itemBadgeClass,
  itemBase,
  itemDisabledClass,
  itemIconClass,
  itemIdleClass,
  itemLabelClass,
  listClass,
  rootBase,
  rootHideAboveClass,
  rootPositionClass,
} from './grBottomNavStyles'

export const grBottomNavSafelist = [...new Set([
  ...splitClassTokens(rootBase),
  ...splitClassTokens(listClass),
  ...splitClassTokens(itemBase),
  ...splitClassTokens(itemActiveClass),
  ...splitClassTokens(itemIdleClass),
  ...splitClassTokens(itemDisabledClass),
  ...splitClassTokens(itemIconClass),
  ...splitClassTokens(itemLabelClass),
  ...splitClassTokens(itemBadgeClass),
  ...Object.values(rootPositionClass).flatMap(splitClassTokens),
  ...Object.values(rootHideAboveClass).flatMap(splitClassTokens),
])]
