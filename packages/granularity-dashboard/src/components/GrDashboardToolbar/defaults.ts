import type { GrDashboardToolbarSize } from './grDashboardToolbarStyles'

/** Пропы `GrDashboardToolbar`, настраиваемые глобально. Только оформление. */
export interface GrDashboardToolbarConfigurableProps {
  size: GrDashboardToolbarSize
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDashboardToolbar: GrDashboardToolbarConfigurableProps
  }
}
