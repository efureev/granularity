import { splitClassTokens } from '../shared/classTokens'
import {
  ratingDisabledClass,
  ratingFillClassByTone,
  ratingGapBySize,
  ratingRootBaseClass,
  ratingSymbolSizeBySize,
  ratingTextSizeBySize,
  ratingVoidClass,
} from './grRatingStyles'

// Всё, что живёт в `grRatingStyles.ts`: и вычисляемые мапы (size/tone), и
// строковые литералы. Хелпер бандлер волен вынести в общий `dist/chunks/`,
// который не попадает в область скана компонента — гейт `src/__tests__/safelist.test.ts`.
export const grRatingSafelist = [...new Set([
  ...Object.values(ratingSymbolSizeBySize).flatMap(splitClassTokens),
  ...Object.values(ratingGapBySize).flatMap(splitClassTokens),
  ...Object.values(ratingTextSizeBySize).flatMap(splitClassTokens),
  ...Object.values(ratingFillClassByTone).flatMap(splitClassTokens),
  ...splitClassTokens(ratingVoidClass),
  ...splitClassTokens(ratingRootBaseClass),
  ...splitClassTokens(ratingDisabledClass),
  ...splitClassTokens('cursor-pointer'),
  ...splitClassTokens('relative block shrink-0 [font-variant-numeric:tabular-nums]'),
])]
