import { flattenTransitionTokens, splitClassTokens } from '../shared/classTokens'
import { overlayOriginClassByPlacement } from '../shared/overlayOrigin'
import { panelPopTransition } from '../shared/overlayTransition'
import {
  dropdownContentBaseClass,
} from './grDropdownStyles'

// И динамические токены (`resolvedPlacement`), и литералы отделки панели:
// `grDropdownStyles.ts` уезжает в общий `dist/chunks/`, вне области скана
// компонента — гейт `src/__tests__/safelist.test.ts`.
export const grDropdownSafelist = [...new Set([
  ...Object.values(overlayOriginClassByPlacement).flatMap(splitClassTokens),
  ...splitClassTokens(dropdownContentBaseClass),
  // Набор перехода панели общий на пять компонентов и живёт безадресным
  // модулем в `shared/`: в `dist` он лежит в общем чанке, который пресет не
  // сканирует, поэтому объявить его обязан каждый потребитель.
  ...flattenTransitionTokens(panelPopTransition),
])]
