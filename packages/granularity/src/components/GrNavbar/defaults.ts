import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrNavbar`, настраиваемые глобально через `componentDefaults`. */
export interface GrNavbarConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrNavbar: GrNavbarConfigurableProps
  }
}
