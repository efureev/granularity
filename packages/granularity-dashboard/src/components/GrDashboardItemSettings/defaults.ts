import type { GrDashboardItemSettingsSize } from './grDashboardItemSettingsStyles'

/** Пропы `GrDashboardItemSettings`, настраиваемые глобально. Только оформление. */
export interface GrDashboardItemSettingsConfigurableProps {
  size: GrDashboardItemSettingsSize
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDashboardItemSettings: GrDashboardItemSettingsConfigurableProps
  }
}
