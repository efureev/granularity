import { splitClassTokens } from '../shared/classTokens'
import { controlStateIconClass, controlStateIconColors } from '../shared/controlState'
import {
  clearButtonClass,
  inputSizeClassBySize,
  invalidWrapperBorderClass,
  spinnerClass,
  tagEditInputClass,
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
  ...splitClassTokens(tagEditInputClass),
  // Общий модуль лежит в чанке без адреса — его классы объявляет каждый импортёр.
  ...splitClassTokens(controlStateIconClass),
  ...Object.values(controlStateIconColors).flatMap(splitClassTokens),
  ...splitClassTokens('sr-only'),
])]
