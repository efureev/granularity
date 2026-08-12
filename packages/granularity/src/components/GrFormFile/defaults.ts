import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrFormFile`, настраиваемые глобально через `componentDefaults`. */
export interface GrFormFileConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrFormFile: GrFormFileConfigurableProps
  }
}
