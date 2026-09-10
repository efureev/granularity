import type { GrControlShape } from '../shared/controlShape'

import type { GrNumberInputSize } from './grNumberInputStyles'

/**
 * Пропы `GrNumberInput`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrNumberInput: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrNumberInputConfigurableProps {
  size: GrNumberInputSize
  clearable: boolean
  /** Форма рамки — см. `components/shared/controlShape.ts`. */
  shape: GrControlShape
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrNumberInput: GrNumberInputConfigurableProps
  }
}
