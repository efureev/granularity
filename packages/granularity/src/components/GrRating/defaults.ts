import type { GrRatingSize, GrRatingTone } from './grRatingStyles'

/**
 * Пропы `GrRating`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrRating: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrRatingConfigurableProps {
  size: GrRatingSize
  tone: GrRatingTone
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrRating: GrRatingConfigurableProps
  }
}
