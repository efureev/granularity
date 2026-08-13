import type { GrDashboardPaletteSize } from './grDashboardPaletteStyles'

/** Пропы `GrDashboardPalette`, настраиваемые глобально. Только оформление. */
export interface GrDashboardPaletteConfigurableProps {
  size: GrDashboardPaletteSize
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDashboardPalette: GrDashboardPaletteConfigurableProps
  }
}
