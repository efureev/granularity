import { splitClassTokens } from '../shared/classTokens'
import {
  sliderFillClass,
  sliderMarkLabelClass,
  sliderMarkTickClass,
  sliderPaddingBySize,
  sliderRailClass,
  sliderRootBaseClass,
  sliderThumbBaseClass,
  sliderThumbSizeBySize,
  sliderTooltipClass,
  sliderTrackHeightBySize,
} from './grSliderStyles'

// Всё, что живёт в `grSliderStyles.ts`: и вычисляемые мапы, и строковые литералы
// дорожки, бегунка, тултипа и меток. Хелпер уезжает в общий `dist/chunks/`, вне
// области скана компонента — гейт `src/__tests__/safelist.test.ts`.
export const grSliderSafelist = [...new Set([
  ...Object.values(sliderTrackHeightBySize).flatMap(splitClassTokens),
  ...Object.values(sliderThumbSizeBySize).flatMap(splitClassTokens),
  ...Object.values(sliderPaddingBySize).flatMap(splitClassTokens),
  ...splitClassTokens(sliderRootBaseClass),
  ...splitClassTokens(sliderRailClass),
  ...splitClassTokens(sliderFillClass),
  ...splitClassTokens(sliderThumbBaseClass),
  ...splitClassTokens(sliderTooltipClass),
  ...splitClassTokens(sliderMarkTickClass),
  ...splitClassTokens(sliderMarkLabelClass),
  ...splitClassTokens('cursor-not-allowed cursor-grab active:cursor-grabbing hover:scale-110 opacity-50'),
  // Резерв места под подписи меток и их выравнивание: центр / к левому / к правому краю.
  ...splitClassTokens('mb-7 translate-x-0 -translate-x-1/2 -translate-x-full'),
])]
