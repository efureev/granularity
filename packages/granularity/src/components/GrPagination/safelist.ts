import { splitClassTokens } from '../shared/classTokens'
import {
  ellipsisSizes,
  jumperSizes,
  labelSizes,
  pageListGaps,
  pageSizes,
  pageSizeSelectWidths,
  rowGaps,
} from './grPaginationStyles'

export const grPaginationSafelist = [...new Set([
  ...Object.values(pageSizes).flatMap(splitClassTokens),
  ...Object.values(ellipsisSizes).flatMap(splitClassTokens),
  ...Object.values(labelSizes).flatMap(splitClassTokens),
  ...Object.values(jumperSizes).flatMap(splitClassTokens),
  ...Object.values(rowGaps).flatMap(splitClassTokens),
  ...Object.values(pageListGaps).flatMap(splitClassTokens),
  ...Object.values(pageSizeSelectWidths).flatMap(splitClassTokens),
])]
