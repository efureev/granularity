import { splitClassTokens } from '../shared/classTokens'
import { originClassByPlacement, panelSizes, popoverPanelBaseClass } from './grPopoverStyles'

export const grPopoverSafelist = [...new Set([
  ...Object.values(panelSizes).flatMap(splitClassTokens),
  ...Object.values(originClassByPlacement).flatMap(splitClassTokens),
  // Базовый класс живёт литералом в `grPopoverStyles.ts`, а такой хелпер на
  // сборке уезжает в общий чанк, которого скан не видит (см. gotchas.md §2).
  ...splitClassTokens(popoverPanelBaseClass),
])]
