import type { GrToasterPlacement } from './GrToaster.vue'

/**
 * Пропы `GrToaster`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrToaster: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrToasterConfigurableProps {
  placement: GrToasterPlacement
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrToaster: GrToasterConfigurableProps
  }
}
