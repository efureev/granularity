import { splitClassTokens } from '../shared/classTokens'
import {
  borderClassByState,
  disabledShellClass,
  sizeClassBySize,
  textAlignClassByAlign,
} from './grNumberInputStyles'

// В safelist кладём только динамические токены, выбираемые по ключам в рантайме
// (`size`/`textAlign`/`state`/`disabled`). Литералы shell/input/controls прописаны
// статически в шаблоне — UnoCSS находит их сканом.
export const grNumberInputSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(textAlignClassByAlign).flatMap(splitClassTokens),
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens(disabledShellClass),
])]
