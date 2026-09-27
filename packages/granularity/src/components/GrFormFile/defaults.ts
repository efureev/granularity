import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrFormFile`, настраиваемые глобально через `componentDefaults`. */
export interface GrFormFileConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrFormFile: GrFormFileConfigurableProps
  }
}
