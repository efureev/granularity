import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrDataTable`, настраиваемые глобально через `componentDefaults`. */
export interface GrDataTableConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDataTable: GrDataTableConfigurableProps
  }
}
