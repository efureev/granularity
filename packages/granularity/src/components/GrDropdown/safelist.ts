import { splitClassTokens } from '../shared/classTokens'
import {
  dropdownContentBaseClass,
  originClassByPlacement,
} from './grDropdownStyles'

// И динамические токены (`resolvedPlacement`), и литералы отделки панели:
// `grDropdownStyles.ts` уезжает в общий `dist/chunks/`, вне области скана
// компонента — гейт `src/__tests__/safelist.test.ts`.
export const grDropdownSafelist = [...new Set([
  ...Object.values(originClassByPlacement).flatMap(v => splitClassTokens(v ?? '')),
  ...splitClassTokens(dropdownContentBaseClass),
])]
