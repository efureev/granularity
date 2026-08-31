import { splitClassTokens } from '../../internal/classTokens'
import { codeTokenClass } from '../GrCodeBlock/grCodeBlockStyles'

import {
  diffFontClass,
  diffGapClass,
  diffGapCountClass,
  diffGapEdgeClass,
  diffGapRowClass,
  diffGutterClass,
  diffNowrapClass,
  diffPaddings,
  diffRootClass,
  diffRowTone,
  diffScrollClass,
  diffSignClass,
  diffSplitCellClass,
  diffSummaryClass,
  diffTextSizes,
  diffWordTone,
  diffWrapClass,
} from './grDiffStyles'

/**
 * Классы из вычисляемых мап и из `.ts`-хелперов — только safelist: скан UnoCSS
 * видит литералы шаблона, а хелпер на сборке уезжает в общий чанк.
 *
 * `codeTokenClass` — общая с блоком карта ролей: у общего модуля адреса в
 * `dist` нет вовсе, поэтому объявить её обязан **каждый** импортёр, а не только
 * тот, у кого она объявлена «первым».
 *
 * `diffHookClass`, `diffRowClass` и `diffGutterCellClass` сюда НЕ идут: это
 * селекторы собственного `<style>`, CSS из них не порождается.
 */
export const grDiffSafelist = [...new Set([
  ...splitClassTokens(diffRootClass),
  ...splitClassTokens(diffScrollClass),
  ...splitClassTokens(diffFontClass),
  ...splitClassTokens(diffWrapClass),
  ...splitClassTokens(diffNowrapClass),
  ...splitClassTokens(diffSummaryClass),
  ...splitClassTokens(diffGutterClass),
  ...splitClassTokens(diffSignClass),
  ...splitClassTokens(diffGapClass),
  ...splitClassTokens(diffGapRowClass),
  ...splitClassTokens(diffGapEdgeClass),
  ...splitClassTokens(diffGapCountClass),
  ...splitClassTokens(diffSplitCellClass),
  ...Object.values(diffPaddings).flatMap(splitClassTokens),
  ...Object.values(diffTextSizes).flatMap(splitClassTokens),
  ...Object.values(diffRowTone).flatMap(splitClassTokens),
  ...Object.values(diffWordTone).flatMap(splitClassTokens),
  ...Object.values(codeTokenClass).flatMap(splitClassTokens),
])]
