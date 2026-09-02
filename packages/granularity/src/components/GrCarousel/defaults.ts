import type { GrTone } from '../shared/tones'
import type { GrCarouselActivationMode, GrCarouselIndicators } from './grCarouselStyles'

/** Пропы `GrCarousel`, настраиваемые глобально через `componentDefaults`. */
export interface GrCarouselConfigurableProps {
  indicators: GrCarouselIndicators
  activationMode: GrCarouselActivationMode
  tone: GrTone
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCarousel: GrCarouselConfigurableProps
  }
}
