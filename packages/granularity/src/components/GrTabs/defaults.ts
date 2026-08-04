import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrTabs`, настраиваемые глобально через `componentDefaults`. */
export interface GrTabsConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrTabs: GrTabsConfigurableProps
  }
}
