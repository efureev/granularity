import type { GrDashboardPaletteAppearance, GrDashboardPaletteSize } from './grDashboardPaletteStyles'

/** Пропы `GrDashboardPalette`, настраиваемые глобально. */
export interface GrDashboardPaletteConfigurableProps {
  size: GrDashboardPaletteSize
  draggable: boolean
  /** Вид каталога: плитки или строки списка. */
  appearance: GrDashboardPaletteAppearance
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDashboardPalette: GrDashboardPaletteConfigurableProps
  }
}
