import { splitClassTokens } from '../shared/classTokens'
import {
  iconOffsets,
  removeTextSizes,
  rowGaps,
  stackGaps,
  textSizes,
} from './grFormFileStyles'

export const grFormFileSafelist = [...new Set([
  ...Object.values(textSizes).flatMap(splitClassTokens),
  ...Object.values(removeTextSizes).flatMap(splitClassTokens),
  ...Object.values(rowGaps).flatMap(splitClassTokens),
  ...Object.values(stackGaps).flatMap(splitClassTokens),
  ...Object.values(iconOffsets).flatMap(splitClassTokens),
])]
