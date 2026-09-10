import type { GrControlShape } from '../shared/controlShape'

import type { GrSegmentedSize, GrSegmentedVariant } from './grSegmentedStyles'

/**
 * Пропы `GrSegmented`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrSegmented: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrSegmentedConfigurableProps {
  size: GrSegmentedSize
  variant: GrSegmentedVariant
  shape: GrControlShape
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrSegmented: GrSegmentedConfigurableProps
  }
}
