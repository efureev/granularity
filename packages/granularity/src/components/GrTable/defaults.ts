import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrTable`, настраиваемые глобально через `componentDefaults`. */
export interface GrTableConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrTable: GrTableConfigurableProps
  }
}
