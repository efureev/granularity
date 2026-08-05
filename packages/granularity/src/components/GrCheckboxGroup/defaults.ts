import type { GrCheckboxSize } from '../GrCheckbox/grCheckboxStyles'

/**
 * Пропы `GrCheckboxGroup`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCheckboxGroup: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrCheckboxGroupConfigurableProps {
  size: GrCheckboxSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrCheckboxGroup: GrCheckboxGroupConfigurableProps
  }
}
