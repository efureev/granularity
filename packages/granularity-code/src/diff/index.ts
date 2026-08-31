/**
 * Арифметика сравнения — чистые модули без Vue.
 *
 * Подпуть `@feugene/granularity-code/diff` отдаётся отдельно намеренно:
 * посчитать дифф для своего рендера или для отчёта потребитель вправе без
 * компонента, и тянуть ради этого Vue не должен.
 */
export type { DiffLinesOptions, GrDiffLine, GrDiffOp, GrDiffResult, MyersStep } from './diffLines'
export { diffLines, GR_DIFF_DEFAULT_BUDGET, myersSteps } from './diffLines'

export type { DiffWordsOptions, GrDiffWord } from './diffWords'
export { diffWords, GR_DIFF_WORD_MAX_LENGTH, splitWords } from './diffWords'

export type {
  CollapseOptions,
  GrDiffGap,
  GrDiffGapEdge,
  GrDiffGapExpansion,
  GrDiffLineRow,
  GrDiffRow,
  GrDiffSplitEntry,
  GrDiffSplitRow,
} from './collapse'
export {
  collapseUnchanged,
  expandGap,
  GR_DIFF_DEFAULT_CONTEXT,
  GR_DIFF_DEFAULT_EXPAND_STEP,
  toSplitRows,
} from './collapse'
