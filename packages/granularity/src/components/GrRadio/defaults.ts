import type { GrButtonSize } from '../GrButton/grButtonStyles'

/**
 * Пропы `GrRadio`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrRadio: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrRadioConfigurableProps {
  size: GrButtonSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrRadio: GrRadioConfigurableProps
  }
}
