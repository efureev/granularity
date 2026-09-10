import { splitClassTokens } from '../shared/classTokens'
import { controlPillPaddingXClass, controlShapeRadiusClass } from '../shared/controlShape'
import { controlStateIconClass, controlStateIconColors } from '../shared/controlState'
import {
  addonInlinePrefixClass,
  addonInlineSuffixClass,
  addonSegmentPrefixClass,
  addonSegmentSuffixClass,
  invalidClass,
  paddingXClass,
  shellHeightClass,
  shellBaseClass,
  shellDisabledClass,
  shellEnabledClass,
  sizes,
  states,
  textAlign,
} from './grInputStyles'

export const grInputSafelist = [...new Set([
  ...Object.values(sizes).flatMap(splitClassTokens),
  ...Object.values(shellHeightClass).flatMap(splitClassTokens),
  ...Object.values(paddingXClass).flatMap(map => Object.values(map)).flatMap(splitClassTokens),
  ...Object.values(textAlign).flatMap(splitClassTokens),
  ...Object.values(states).flatMap(splitClassTokens),
  ...splitClassTokens(invalidClass),
  ...splitClassTokens(shellBaseClass),
  ...splitClassTokens(shellEnabledClass),
  ...splitClassTokens(shellDisabledClass),
  ...splitClassTokens(addonSegmentPrefixClass),
  ...splitClassTokens(addonSegmentSuffixClass),
  ...splitClassTokens(addonInlinePrefixClass),
  ...splitClassTokens(addonInlineSuffixClass),
  // Общий модуль лежит в чанке без адреса — его классы объявляет каждый импортёр.
  ...Object.values(controlShapeRadiusClass).flatMap(splitClassTokens),
  ...Object.values(controlPillPaddingXClass).flatMap(splitClassTokens),
  ...splitClassTokens(controlStateIconClass),
  ...Object.values(controlStateIconColors).flatMap(splitClassTokens),
])]
