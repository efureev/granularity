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
  // Обводка бегунка + резерв места под подписи меток (whitespace-nowrap не даёт им рваться).
  // translate-* — выравнивание подписей: центр / прижать к левому / к правому краю.
  ...splitClassTokens('ring-1 ring-[color-mix(in_srgb,var(--gr-fg)_22%,transparent)] mb-7 mt-2.5 whitespace-nowrap translate-x-0 -translate-x-1/2 -translate-x-full'),
  // Кастомизируемые через CSS-переменные цвета: заливка, дорожка, заливка/окантовка бегунка.
  // Держим в safelist явно — статические литералы из grSliderStyles.ts попадают в общий
  // dist-chunk и ненадёжно сканируются granularContent.
  ...splitClassTokens('bg-[var(--gr-slider-rail,color-mix(in_srgb,var(--gr-muted)_45%,transparent))]'),
  ...splitClassTokens('bg-[var(--gr-slider-fill,var(--gr-primary))]'),
  ...splitClassTokens('bg-[var(--gr-slider-thumb-bg,var(--gr-bg))]'),
  ...splitClassTokens('border-[var(--gr-slider-thumb-border,var(--gr-slider-fill,var(--gr-primary)))]'),
])]
