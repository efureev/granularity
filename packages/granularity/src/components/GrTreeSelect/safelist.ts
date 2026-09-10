import { flattenTransitionTokens, splitClassTokens } from '../shared/classTokens'
import { controlPillPaddingXClass, controlShapeRadiusClass } from '../shared/controlShape'
import { controlStateIconClass, controlStateIconColors } from '../shared/controlState'
import { panelPopTransition } from '../shared/overlayTransition'
import {
  borderClassByState,
  grTreeSelectPanelClass,
  grTreeSelectStateClass,
  invalidBorderClass,
  shellDisabledClass,
  shellEnabledClass,
  sizeClassBySize,
  paddingXClass,
} from './grTreeSelectStyles'

export const grTreeSelectSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(paddingXClass).flatMap(map => Object.values(map)).flatMap(splitClassTokens),
  // Общий модуль лежит в чанке без адреса — его классы объявляет каждый импортёр.
  ...Object.values(controlShapeRadiusClass).flatMap(splitClassTokens),
  ...Object.values(controlPillPaddingXClass).flatMap(splitClassTokens),
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens(invalidBorderClass),
  'pr-9',
  ...splitClassTokens(shellEnabledClass),
  ...splitClassTokens(shellDisabledClass),
  ...splitClassTokens(grTreeSelectPanelClass),
  ...splitClassTokens(grTreeSelectStateClass),
  // Набор перехода панели общий на пять компонентов и живёт безадресным
  // модулем в `shared/`: в `dist` он лежит в общем чанке, который пресет не
  // сканирует, поэтому объявить его обязан каждый потребитель.
  ...flattenTransitionTokens(panelPopTransition),
  // Общий модуль лежит в чанке без адреса — его классы объявляет каждый импортёр.
  ...splitClassTokens(controlStateIconClass),
  ...Object.values(controlStateIconColors).flatMap(splitClassTokens),
  ...splitClassTokens('absolute top-1/2 -translate-y-1/2 right-9 sr-only'),
])]
