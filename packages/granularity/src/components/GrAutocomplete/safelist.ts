import { flattenTransitionTokens, splitClassTokens } from '../shared/classTokens'
import { panelPopTransition } from '../shared/overlayTransition'
import {
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
// литералы оболочки, опций и панели (чип — это `GrBadge`, его safelist приезжает
// зависимостью). Хелпер уезжает в общий
// `dist/chunks/`, вне области скана компонента — гейт `src/__tests__/safelist.test.ts`.
export const grAutocompleteSafelist = [...new Set([
  ...Object.values(autocompleteSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens(autocompleteShellBase),
  ...splitClassTokens(autocompleteShellEnabledClass),
  ...splitClassTokens(autocompleteShellDisabledClass),
  ...splitClassTokens(autocompletePanelClasses),
  ...splitClassTokens(autocompleteOptionBaseClass),
  ...splitClassTokens(autocompleteOptionEnabledClass),
  ...splitClassTokens(autocompleteOptionActiveClass),
  ...splitClassTokens(autocompleteOptionDisabledClass),
  ...splitClassTokens(autocompleteStateClass),
  ...splitClassTokens(invalidShellClass),
  ...splitClassTokens('border-[var(--gr-brd)]'),
  // Набор перехода панели общий на пять компонентов и живёт безадресным
  // модулем в `shared/`: в `dist` он лежит в общем чанке, который пресет не
  // сканирует, поэтому объявить его обязан каждый потребитель.
  ...flattenTransitionTokens(panelPopTransition),
])]
