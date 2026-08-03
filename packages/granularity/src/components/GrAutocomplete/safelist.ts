import { splitClassTokens } from '../shared/classTokens'
import {
  autocompleteChipClass,
  autocompletePanelClasses,
  autocompleteShellBase,
  autocompleteSizeClassBySize,
} from './grAutocompleteStyles'

// Всё, что живёт в `grAutocompleteStyles.ts`: и вычисляемые мапы, и строковые
// литералы оболочки, chip'ов и панели. Хелпер уезжает в общий `dist/chunks/`,
// вне области скана компонента — гейт `src/__tests__/safelist.test.ts`.
export const grAutocompleteSafelist = [...new Set([
  ...Object.values(autocompleteSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens(autocompleteShellBase),
  ...splitClassTokens(autocompleteChipClass),
  ...splitClassTokens(autocompletePanelClasses),
  ...splitClassTokens('border-[var(--gr-brd)] border-[var(--gr-danger)] focus-within:ring-[var(--gr-danger)]'),
  ...splitClassTokens('cursor-not-allowed opacity-50'),
])]
