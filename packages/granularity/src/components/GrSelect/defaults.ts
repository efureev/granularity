import type { GrControlShape } from '../shared/controlShape'

import type { GrSelectSize, GrSelectUnderline, GrSelectVariant } from './grSelectStyles'

/**
 * Пропы `GrSelect`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrSelect: { … } }">`.
 * Только оформление и поведение по умолчанию — см. `GrButton/defaults.ts`.
 */
export interface GrSelectConfigurableProps {
  size: GrSelectSize
  variant: GrSelectVariant
  underline: GrSelectUnderline
  clearable: boolean
  /** Форма рамки — см. `components/shared/controlShape.ts`. */
  shape: GrControlShape
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrSelect: GrSelectConfigurableProps
  }
}
