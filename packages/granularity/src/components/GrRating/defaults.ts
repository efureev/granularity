import type { GrRatingSize } from './grRatingStyles'

/**
 * Пропы `GrRating`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrRating: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrRatingConfigurableProps {
  size: GrRatingSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrRating: GrRatingConfigurableProps
  }
}
