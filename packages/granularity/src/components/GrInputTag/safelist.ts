import { splitClassTokens } from '../shared/classTokens'
import {
  clearButtonClass,
  inputSizeClassBySize,
  removeButtonClass,
  spinnerClass,
  wrapperBaseClass,
  wrapperBorderClassByState,
  wrapperDisabledClass,
  wrapperEnabledClass,
  wrapperSizeClassBySize,
} from './grInputTagStyles'

export const grInputTagSafelist = [...new Set([
  ...Object.values(wrapperSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(inputSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(wrapperBorderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens(wrapperBaseClass),
  ...splitClassTokens(wrapperEnabledClass),
  ...splitClassTokens(wrapperDisabledClass),
  ...splitClassTokens(removeButtonClass),
  ...splitClassTokens(clearButtonClass),
  ...splitClassTokens(spinnerClass),
])]
