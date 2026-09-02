import type { GrCarouselActivationMode, GrCarouselIndicators } from './grCarouselStyles'

/** Пропы `GrCarousel`, настраиваемые глобально через `componentDefaults`. */
export interface GrCarouselConfigurableProps {
  indicators: GrCarouselIndicators
  activationMode: GrCarouselActivationMode
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCarousel: GrCarouselConfigurableProps
  }
}
