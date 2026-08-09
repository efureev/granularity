import { splitClassTokens } from '../shared/classTokens'
import {
  autocompleteChipClass,
  autocompleteOptionActiveClass,
  autocompleteOptionBaseClass,
  autocompleteOptionDisabledClass,
  autocompleteOptionEnabledClass,
  autocompletePanelClasses,
  autocompleteShellBase,
  autocompleteShellDisabledClass,
  autocompleteShellEnabledClass,
  autocompleteSizeClassBySize,
  autocompleteStateClass,
  invalidShellClass,
} from './grAutocompleteStyles'

// Всё, что живёт в `grAutocompleteStyles.ts`: и вычисляемые мапы, и строковые
// литералы оболочки, chip'ов, опций и панели. Хелпер уезжает в общий
// `dist/chunks/`, вне области скана компонента — гейт `src/__tests__/safelist.test.ts`.
export const grAutocompleteSafelist = [...new Set([
  ...Object.values(autocompleteSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens(autocompleteShellBase),
  ...splitClassTokens(autocompleteShellEnabledClass),
  ...splitClassTokens(autocompleteShellDisabledClass),
  ...splitClassTokens(autocompleteChipClass),
  ...splitClassTokens(autocompletePanelClasses),
  ...splitClassTokens(autocompleteOptionBaseClass),
  ...splitClassTokens(autocompleteOptionEnabledClass),
  ...splitClassTokens(autocompleteOptionActiveClass),
  ...splitClassTokens(autocompleteOptionDisabledClass),
  ...splitClassTokens(autocompleteStateClass),
  ...splitClassTokens(invalidShellClass),
  ...splitClassTokens('border-[var(--gr-brd)]'),
])]
