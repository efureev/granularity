import type { GrComponentSize } from '../GrConfigProvider/context'

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
