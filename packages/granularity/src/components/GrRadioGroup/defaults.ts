import type { GrButtonSize } from '../GrButton/grButtonStyles'

/**
 * Пропы `GrRadioGroup`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrRadioGroup: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrRadioGroupConfigurableProps {
  size: GrButtonSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrRadioGroup: GrRadioGroupConfigurableProps
  }
}
