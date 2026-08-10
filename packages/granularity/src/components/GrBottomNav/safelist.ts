import { splitClassTokens } from '../shared/classTokens'
import {
  itemActiveClass,
  itemBadgeClass,
  itemBase,
  itemDisabledClass,
  itemIconClass,
  itemIconSizes,
  itemIdleClass,
  itemLabelClass,
  itemTextSizes,
  listClass,
  listSizes,
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
  ...Object.values(listSizes).flatMap(splitClassTokens),
  ...Object.values(itemTextSizes).flatMap(splitClassTokens),
  ...Object.values(itemIconSizes).flatMap(splitClassTokens),
  ...Object.values(rootPositionClass).flatMap(splitClassTokens),
  ...Object.values(rootHideAboveClass).flatMap(splitClassTokens),
])]
