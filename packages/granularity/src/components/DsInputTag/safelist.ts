import { splitClassTokens } from '../shared/classTokens'
import {
  inputSizeClassBySize,
  wrapperBorderClassByState,
  wrapperSizeClassBySize,
} from './dsInputTagStyles'

export const dsInputTagSafelist = [...new Set([
  ...Object.values(wrapperSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(inputSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(wrapperBorderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens('opacity-50 cursor-not-allowed'),
  ...splitClassTokens('cursor-text'),
])]
