import { splitClassTokens } from '../shared/classTokens'
import {
  ratingFillClassByTone,
  ratingGapBySize,
  ratingSymbolSizeBySize,
  ratingTextSizeBySize,
} from './grRatingStyles'

// Классы из вычисляемых мап (size/tone) UnoCSS сканом не находит — только safelist.
export const grRatingSafelist = [...new Set([
  ...Object.values(ratingSymbolSizeBySize).flatMap(splitClassTokens),
  ...Object.values(ratingGapBySize).flatMap(splitClassTokens),
  ...Object.values(ratingTextSizeBySize).flatMap(splitClassTokens),
  ...Object.values(ratingFillClassByTone).flatMap(splitClassTokens),
  // Литералы из grRatingStyles.ts: цвет «пустого» символа, состояния корня,
  // focus-ring. Живут строками в .ts, поэтому перечисляем явно.
  ...splitClassTokens('text-[var(--gr-rating-void-color,color-mix(in_srgb,var(--gr-muted-fg)_35%,transparent))]'),
  ...splitClassTokens('cursor-not-allowed cursor-pointer opacity-50'),
  ...splitClassTokens('focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gr-bg)]'),
  ...splitClassTokens('relative block shrink-0 [font-variant-numeric:tabular-nums]'),
])]
