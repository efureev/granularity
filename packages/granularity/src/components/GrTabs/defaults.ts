import type { GrComponentSize } from '../shared/configContext'

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
