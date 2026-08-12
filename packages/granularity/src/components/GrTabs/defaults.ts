import type { GrComponentSize } from '../GrConfigProvider/context'

import type { GrTabsVariant } from './grTabsStyles'

/** Пропы `GrTabs`, настраиваемые глобально через `componentDefaults`. */
export interface GrTabsConfigurableProps {
  size: GrComponentSize
  variant: GrTabsVariant
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTabs: GrTabsConfigurableProps
  }
}
