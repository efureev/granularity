import type { GrSegmentedSize, GrSegmentedVariant } from './grSegmentedStyles'

/**
 * Пропы `GrSegmented`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrSegmented: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrSegmentedConfigurableProps {
  size: GrSegmentedSize
  variant: GrSegmentedVariant
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrSegmented: GrSegmentedConfigurableProps
  }
}
