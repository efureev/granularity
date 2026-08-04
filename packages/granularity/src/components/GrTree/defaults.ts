import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrTree`, настраиваемые глобально через `componentDefaults`. */
export interface GrTreeConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrTree: GrTreeConfigurableProps
  }
}
