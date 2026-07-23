import { splitClassTokens } from '../shared/classTokens'
import { autocompleteSizeClassBySize } from './grAutocompleteStyles'

// Правило (как в GrSelect): статические литералы из шаблона UnoCSS находит сканом —
// в safelist кладём только классы, собираемые из вычисляемых мап/строк.
export const grAutocompleteSafelist = [...new Set([
  ...Object.values(autocompleteSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens('border-[var(--gr-brd)] border-[var(--gr-danger)] focus-within:ring-[var(--gr-danger)]'),
  ...splitClassTokens('cursor-not-allowed opacity-50'),
])]
