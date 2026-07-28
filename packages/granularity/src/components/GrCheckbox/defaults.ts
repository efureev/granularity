import type { GrCheckboxSize } from './grCheckboxStyles'

/**
 * Пропы `GrCheckbox`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCheckbox: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrCheckboxConfigurableProps {
  size: GrCheckboxSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrCheckbox: GrCheckboxConfigurableProps
  }
}
