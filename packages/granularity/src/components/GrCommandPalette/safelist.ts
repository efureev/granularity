import { splitClassTokens } from '../shared/classTokens'
import {
  commandEmptyClass,
  commandFooterClass,
  commandGroupLabelClass,
  commandItemActiveClass,
  commandItemBaseClass,
  commandItemDisabledClass,
  commandSearchInputClass,
  commandSearchRowClass,
} from './grCommandPaletteStyles'

// Вся вёрстка палитры живёт строковыми литералами в grCommandPaletteStyles.ts —
// на сборке они уезжают в общий dist-чанк, который granularContent не сканирует.
// Поэтому перечисляем явно (docs/gotchas.md §2).
export const grCommandPaletteSafelist = [...new Set([
  ...splitClassTokens(commandSearchRowClass),
  ...splitClassTokens(commandSearchInputClass),
  ...splitClassTokens(commandGroupLabelClass),
  ...splitClassTokens(commandItemBaseClass),
  ...splitClassTokens(commandItemActiveClass),
  ...splitClassTokens(commandItemDisabledClass),
  ...splitClassTokens(commandEmptyClass),
  ...splitClassTokens(commandFooterClass),
  ...splitClassTokens('cursor-pointer'),
  // Иконки поля поиска и индикатора загрузки.
  ...splitClassTokens('i-lucide-search i-lucide-loader-2 animate-spin'),
])]
