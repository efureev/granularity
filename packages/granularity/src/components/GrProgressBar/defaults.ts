import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrProgressBar`, настраиваемые глобально через `componentDefaults`. */
export interface GrProgressBarConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrProgressBar: GrProgressBarConfigurableProps
  }
}
