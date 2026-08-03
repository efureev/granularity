import type { GrKbdSize } from './GrKbd.vue'

/**
 * Пропы `GrKbd`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrKbd: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrKbdConfigurableProps {
  size: GrKbdSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrKbd: GrKbdConfigurableProps
  }
}
