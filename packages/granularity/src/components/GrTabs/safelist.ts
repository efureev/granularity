import { splitClassTokens } from '../shared/classTokens'
import { tabBadgeSizes, tablistSizes, tabSizes } from './grTabsStyles'

export const grTabsSafelist = [...new Set([
  ...Object.values(tabSizes).flatMap(splitClassTokens),
  ...Object.values(tabBadgeSizes).flatMap(splitClassTokens),
  ...Object.values(tablistSizes).flatMap(splitClassTokens),
])]
