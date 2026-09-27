import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrTable`, настраиваемые глобально через `componentDefaults`. */
export interface GrTableConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTable: GrTableConfigurableProps
  }
}
