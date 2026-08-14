import type {
  GrDashboardItemOverflow,
  GrDashboardItemPadding,
  GrDashboardItemSize,
} from './grDashboardItemStyles'

/**
 * Пропы `GrDashboardItem`, настраиваемые глобально.
 *
 * `size` здесь — плотность шапки и кегль заголовка, а не размер виджета в
 * сетке: тот задаётся `w`/`h` в раскладке и настройкой быть не может.
 */
export interface GrDashboardItemConfigurableProps {
  size: GrDashboardItemSize
  /** Не задан — отступы берутся от `size`. */
  padding: GrDashboardItemPadding
  overflow: GrDashboardItemOverflow
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDashboardItem: GrDashboardItemConfigurableProps
  }
}
