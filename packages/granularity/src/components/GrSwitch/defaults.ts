import type { GrSwitchSize } from './grSwitchStyles'

/**
 * Пропы `GrSwitch`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrSwitch: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrSwitchConfigurableProps {
  size: GrSwitchSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrSwitch: GrSwitchConfigurableProps
  }
}
