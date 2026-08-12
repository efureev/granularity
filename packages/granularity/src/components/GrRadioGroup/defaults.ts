import type { GrButtonSize } from '../GrButton/grButtonStyles'

/**
 * Пропы `GrRadioGroup`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrRadioGroup: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrRadioGroupConfigurableProps {
  size: GrButtonSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrRadioGroup: GrRadioGroupConfigurableProps
  }
}
