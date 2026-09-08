import { splitClassTokens } from '../shared/classTokens'
import {
  emptyCellClass,
  hoverableClass,
  loadingRowCellClass,
  stickyColumnHoverableClass,
  stickyColumnStripedClass,
  stripedClass,
  tableSizes,
} from './grTableStyles'

export const grTableSafelist = [...new Set([
  ...Object.values(tableSizes).flatMap(splitClassTokens),
  ...splitClassTokens(stripedClass),
  ...splitClassTokens(stickyColumnStripedClass),
  ...splitClassTokens(stickyColumnHoverableClass),
  ...splitClassTokens(hoverableClass),
  ...splitClassTokens(emptyCellClass),
  ...splitClassTokens(loadingRowCellClass),
])]
