import { splitClassTokens } from '../shared/classTokens'

import {
  filePreviewFallbackClass,
  filePreviewIconClass,
  filePreviewInteractiveClass,
  filePreviewLabelClass,
  filePreviewMediaClass,
  filePreviewMediaLoadingClass,
  filePreviewRatioClass,
  filePreviewRootClass,
  filePreviewTileWidths,
} from './grFilePreviewStyles'

// Классы из вычисляемых мап (ступень плитки, соотношение сторон) UnoCSS сканом
// не находит — только safelist. Литералы хелпера туда же: на сборке он уезжает
// в общий чанк, который скан не видит.
export const grFilePreviewSafelist = [...new Set([
  ...splitClassTokens(filePreviewRootClass),
  ...splitClassTokens(filePreviewInteractiveClass),
  ...splitClassTokens(filePreviewMediaClass),
  ...splitClassTokens(filePreviewMediaLoadingClass),
  ...splitClassTokens(filePreviewFallbackClass),
  ...splitClassTokens(filePreviewIconClass),
  ...splitClassTokens(filePreviewLabelClass),
  ...Object.values(filePreviewTileWidths).flatMap(splitClassTokens),
  ...Object.values(filePreviewRatioClass).flatMap(splitClassTokens),
])]
