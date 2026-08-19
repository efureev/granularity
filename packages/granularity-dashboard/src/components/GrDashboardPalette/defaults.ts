import type { GrDashboardPaletteSize } from './grDashboardPaletteStyles'

/** Пропы `GrDashboardPalette`, настраиваемые глобально. */
export interface GrDashboardPaletteConfigurableProps {
  size: GrDashboardPaletteSize
  draggable: boolean
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDashboardPalette: GrDashboardPaletteConfigurableProps
  }
}
