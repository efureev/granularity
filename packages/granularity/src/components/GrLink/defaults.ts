import type { GrLinkSize } from './grLinkStyles'

/**
 * Пропы `GrLink`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrLink: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrLinkConfigurableProps {
  size: GrLinkSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrLink: GrLinkConfigurableProps
  }
}
