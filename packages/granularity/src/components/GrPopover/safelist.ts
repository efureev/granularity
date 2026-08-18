import { flattenTransitionTokens, splitClassTokens } from '../shared/classTokens'
import { panelPopTransition } from '../shared/overlayTransition'
import { originClassByPlacement, panelSizes, panelSizesFlush, popoverPanelBaseClass } from './grPopoverStyles'

export const grPopoverSafelist = [...new Set([
  ...Object.values(panelSizes).flatMap(splitClassTokens),
  ...Object.values(panelSizesFlush).flatMap(splitClassTokens),
  ...Object.values(originClassByPlacement).flatMap(splitClassTokens),
  // Базовый класс живёт литералом в `grPopoverStyles.ts`, а такой хелпер на
  // сборке уезжает в общий чанк, которого скан не видит (см. gotchas.md §2).
  ...splitClassTokens(popoverPanelBaseClass),
  // Набор перехода панели общий на пять компонентов и живёт безадресным
  // модулем в `shared/`: в `dist` он лежит в общем чанке, который пресет не
  // сканирует, поэтому объявить его обязан каждый потребитель.
  ...flattenTransitionTokens(panelPopTransition),
])]
