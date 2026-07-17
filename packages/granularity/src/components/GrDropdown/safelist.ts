import { splitClassTokens } from '../shared/classTokens'
import {
  originClassByPlacement,
  widthClassByWidth,
} from './grDropdownStyles'

// В safelist кладём только динамические токены, выбираемые по ключам в рантайме
// (`width`/`resolvedPlacement`). Литералы content-класса (`rounded-*`, `border`,
// `bg-*` и пр.) прописаны статически в исходнике `grDropdownStyles.ts` и находятся
// UnoCSS'ом сканом.
export const grDropdownSafelist = [...new Set([
  ...Object.values(widthClassByWidth).flatMap(splitClassTokens),
  ...Object.values(originClassByPlacement).flatMap(v => splitClassTokens(v ?? '')),
])]
