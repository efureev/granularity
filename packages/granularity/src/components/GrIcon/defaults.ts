import type { GrComponentSize } from '../shared/sizes'

/**
 * Пропы `GrIcon`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrIcon: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrIconConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrIcon: GrIconConfigurableProps
  }
}
