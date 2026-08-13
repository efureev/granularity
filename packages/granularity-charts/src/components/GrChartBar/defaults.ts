import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartBar`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartBar: { … } }">`.
 *
 * Только оформление: данные, режим стека и границы осей задаются на месте.
 */
export interface GrChartBarConfigurableProps {
  size: GrChartSize
  height: number
  /** Скругление дальнего конца полосы в пикселях: радиус идёт в геометрию пути, а не в CSS. */
  barRadius: number
  groupPadding: number
  showGrid: 'both' | 'x' | 'y' | 'none'
  showLegend: boolean | 'auto'
  legendPosition: 'top' | 'bottom'
  tooltip: boolean
  dataTable: 'hidden' | 'visible' | 'off'
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChartBar: GrChartBarConfigurableProps
  }
}
