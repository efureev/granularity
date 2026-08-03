import { splitClassTokens } from '../shared/classTokens'
import {
  panelBaseClass,
  panelSideClass,
  panelTransitionClass,
  panelWidthBySize,
} from './grDrawerStyles'

// И динамические токены (`side`/`size`), и литералы отделки панели: `grDrawerStyles.ts`
// бандлер волен вынести в общий `dist/chunks/`, вне области скана компонента —
// гейт `src/__tests__/safelist.test.ts`.
export const grDrawerSafelist = [...new Set([
  ...Object.values(panelSideClass).flatMap(splitClassTokens),
  ...Object.values(panelWidthBySize).flatMap(splitClassTokens),
  ...Object.values(panelTransitionClass).flatMap(splitClassTokens),
  ...splitClassTokens(panelBaseClass),
])]
