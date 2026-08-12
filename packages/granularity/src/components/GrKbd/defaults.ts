import type { GrKbdSize } from './GrKbd.vue'

/**
 * Пропы `GrKbd`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrKbd: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrKbdConfigurableProps {
  size: GrKbdSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrKbd: GrKbdConfigurableProps
  }
}
