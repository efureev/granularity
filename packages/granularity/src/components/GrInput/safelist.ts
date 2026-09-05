import { splitClassTokens } from '../shared/classTokens'
import { controlStateIconClass, controlStateIconColors } from '../shared/controlState'
import {
  addonInlinePrefixClass,
  addonInlineSuffixClass,
  addonSegmentPrefixClass,
  addonSegmentSuffixClass,
  invalidClass,
  shellBaseClass,
  shellDisabledClass,
  shellEnabledClass,
  sizes,
  states,
  textAlign,
} from './grInputStyles'

export const grInputSafelist = [...new Set([
  ...Object.values(sizes).flatMap(splitClassTokens),
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
  ...splitClassTokens(controlStateIconClass),
  ...Object.values(controlStateIconColors).flatMap(splitClassTokens),
])]
