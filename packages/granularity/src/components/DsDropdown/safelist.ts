import { splitClassTokens } from '../shared/classTokens'
import {
  alignmentClassByAlign,
  widthClassByWidth,
} from './dsDropdownStyles'

// В safelist кладём только динамические токены, выбираемые по ключам в рантайме
// (`width`/`align`). Литералы content-класса (`rounded-*`, `border`, `bg-*` и пр.)
// прописаны статически в исходнике `dsDropdownStyles.ts` и находятся UnoCSS'ом сканом.
export const dsDropdownSafelist = [...new Set([
  ...Object.values(widthClassByWidth).flatMap(splitClassTokens),
  ...Object.values(alignmentClassByAlign).flatMap(splitClassTokens),
])]
