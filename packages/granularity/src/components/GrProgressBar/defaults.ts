import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrProgressBar`, настраиваемые глобально через `componentDefaults`. */
export interface GrProgressBarConfigurableProps {
  size: GrComponentSize
  borderless: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrProgressBar: GrProgressBarConfigurableProps
  }
}
