import { splitClassTokens } from '../shared/classTokens'
import {
  alignmentClassByAlign,
  widthClassByWidth,
} from './grDropdownStyles'

// В safelist кладём только динамические токены, выбираемые по ключам в рантайме
// (`width`/`align`). Литералы content-класса (`rounded-*`, `border`, `bg-*` и пр.)
// прописаны статически в исходнике `grDropdownStyles.ts` и находятся UnoCSS'ом сканом.
export const grDropdownSafelist = [...new Set([
  ...Object.values(widthClassByWidth).flatMap(splitClassTokens),
  ...Object.values(alignmentClassByAlign).flatMap(splitClassTokens),
])]
