import { splitClassTokens } from '../shared/classTokens'
import {
  emptyCellClass,
  hoverableClass,
  loadingRowCellClass,
  stripedClass,
  tableSizes,
} from './grTableStyles'

export const grTableSafelist = [...new Set([
  ...Object.values(tableSizes).flatMap(splitClassTokens),
  ...splitClassTokens(stripedClass),
  ...splitClassTokens(hoverableClass),
  ...splitClassTokens(emptyCellClass),
  ...splitClassTokens(loadingRowCellClass),
])]
