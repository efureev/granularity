import { splitClassTokens } from '../shared/classTokens'
import {
  formSectionActionsClass,
  formSectionDescriptionClass,
  formSectionHeaderClass,
  formSectionRootClass,
  formSectionTitleClass,
} from './grFormSectionStyles'

// Классы живут в `.ts`-хелпере, а он уезжает в общий `dist/chunks/` — вне
// области скана компонента. Гейт — `src/__tests__/safelist.test.ts`.
export const grFormSectionSafelist = [...new Set([
  ...splitClassTokens(formSectionRootClass),
  ...splitClassTokens(formSectionHeaderClass),
  ...splitClassTokens(formSectionTitleClass),
  ...splitClassTokens(formSectionDescriptionClass),
  ...splitClassTokens(formSectionActionsClass),
])]
