import { splitClassTokens } from '../shared/classTokens'
import {
  sliderPaddingBySize,
  sliderThumbSizeBySize,
  sliderTrackHeightBySize,
} from './grSliderStyles'

// Правило (как в GrSelect/GrAutocomplete): статические литералы из шаблона UnoCSS
// находит сканом; в safelist кладём только классы из вычисляемых мап.
export const grSliderSafelist = [...new Set([
  ...Object.values(sliderTrackHeightBySize).flatMap(splitClassTokens),
  ...Object.values(sliderThumbSizeBySize).flatMap(splitClassTokens),
  ...Object.values(sliderPaddingBySize).flatMap(splitClassTokens),
  ...splitClassTokens('cursor-not-allowed cursor-grab active:cursor-grabbing hover:scale-110 opacity-50'),
])]
