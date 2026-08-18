import { flattenTransitionTokens, splitClassTokens } from '../shared/classTokens'
import { panelPopTransition } from '../shared/overlayTransition'
import {
  borderClassByState,
  grTreeSelectPanelClass,
  grTreeSelectStateClass,
  invalidBorderClass,
  shellDisabledClass,
  shellEnabledClass,
  sizeClassBySize,
} from './grTreeSelectStyles'

export const grTreeSelectSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
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
])]
