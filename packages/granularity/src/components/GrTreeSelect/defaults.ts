import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrTreeSelect`, настраиваемые глобально через `componentDefaults`. */
export interface GrTreeSelectConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrTreeSelect: GrTreeSelectConfigurableProps
  }
}
