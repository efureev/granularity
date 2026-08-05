import { splitClassTokens } from '../shared/classTokens'
import {
  cellPaddings,
  headerGaps,
  headerTextSizes,
  placeholderPaddings,
  selectColumnWidths,
  spinnerSizes,
} from './grDataTableStyles'

export const grDataTableSafelist = [...new Set([
  ...Object.values(cellPaddings).flatMap(splitClassTokens),
  ...Object.values(placeholderPaddings).flatMap(splitClassTokens),
  ...Object.values(headerTextSizes).flatMap(splitClassTokens),
  ...Object.values(selectColumnWidths).flatMap(splitClassTokens),
  ...Object.values(headerGaps).flatMap(splitClassTokens),
  ...Object.values(spinnerSizes).flatMap(splitClassTokens),
])]
