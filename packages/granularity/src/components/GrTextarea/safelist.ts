import { splitClassTokens } from '../shared/classTokens'
import { controlStateIconClass, controlStateIconColors } from '../shared/controlState'
import {
  borderClassByState,
  countClass,
  countRowClass,
  lineCountClass,
  disabledSurfaceClass,
  enabledSurfaceClass,
  invalidBorderClass,
  resizeClass,
  sizes,
} from './grTextareaStyles'

export const grTextareaSafelist = [...new Set([
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens(invalidBorderClass),
  ...Object.values(sizes).flatMap(splitClassTokens),
  ...Object.values(resizeClass).flatMap(splitClassTokens),
  ...splitClassTokens(enabledSurfaceClass),
  ...splitClassTokens(disabledSurfaceClass),
  ...splitClassTokens(countClass),
  ...splitClassTokens(countRowClass),
  ...splitClassTokens(lineCountClass),
  // Общий модуль лежит в чанке без адреса — его классы объявляет каждый импортёр.
  ...splitClassTokens(controlStateIconClass),
  ...Object.values(controlStateIconColors).flatMap(splitClassTokens),
  ...splitClassTokens('absolute top-2 right-10 right-2 sr-only'),
])]
