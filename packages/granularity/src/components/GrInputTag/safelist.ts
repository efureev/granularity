import { splitClassTokens } from '../shared/classTokens'
import {
  clearButtonClass,
  inputSizeClassBySize,
  invalidWrapperBorderClass,
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
  ...splitClassTokens(invalidWrapperBorderClass),
  ...splitClassTokens(wrapperBaseClass),
  ...splitClassTokens(wrapperEnabledClass),
  ...splitClassTokens(wrapperDisabledClass),
  ...splitClassTokens(clearButtonClass),
  ...splitClassTokens(spinnerClass),
])]
