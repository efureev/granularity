import type { GrModalSize } from './grModalStyles'

/**
 * Пропы `GrModal`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrModal: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrModalConfigurableProps {
  size: GrModalSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrModal: GrModalConfigurableProps
  }
}
