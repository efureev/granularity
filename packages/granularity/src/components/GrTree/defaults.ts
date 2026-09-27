import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrTree`, настраиваемые глобально через `componentDefaults`. */
export interface GrTreeConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTree: GrTreeConfigurableProps
  }
}
