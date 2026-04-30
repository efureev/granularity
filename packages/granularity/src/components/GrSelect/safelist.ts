import { splitClassTokens } from '../shared/classTokens'
import {
  selectLinkSizeClassBySize,
  selectLinkVariantClassByVariant,
  selectSizeClassBySize,
} from './grSelectStyles'

// Правило: литералы из шаблонов (`defaultBaseClass`/`linkBaseClass`/`grSelectPanelClasses`
// и прочие статические строки) в safelist не дублируем — UnoCSS находит их сканом.
// Сюда попадают только токены, которые собираются в рантайме через `grSelectClass*`.
export const grSelectSafelist = [...new Set([
  ...Object.values(selectSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(selectLinkSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(selectLinkVariantClassByVariant).flatMap(splitClassTokens),
  ...splitClassTokens('no-underline underline underline-offset-4 hover:underline hover:underline-offset-4'),
  ...splitClassTokens('disabled:opacity-60 disabled:cursor-not-allowed disabled:text-[var(--muted-fg)] disabled:no-underline'),
  ...splitClassTokens('disabled:opacity-50 disabled:cursor-not-allowed'),
  ...splitClassTokens('appearance-none pr-9'),
  ...splitClassTokens('inline-flex items-center gap-1 text-left'),
  ...splitClassTokens('flex items-center justify-between text-left'),
])]
