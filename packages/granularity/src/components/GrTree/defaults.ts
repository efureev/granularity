import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrTree`, настраиваемые глобально через `componentDefaults`. */
export interface GrTreeConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTree: GrTreeConfigurableProps
  }
}
