import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrNavbar`, настраиваемые глобально через `componentDefaults`. */
export interface GrNavbarConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrNavbar: GrNavbarConfigurableProps
  }
}
