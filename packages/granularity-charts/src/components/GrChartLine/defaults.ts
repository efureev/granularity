import type { GrChartCurve } from '../../chart/chartPath'
import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartLine`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartLine: { … } }">`.
 *
 * Только оформление: данные и границы осей задаются на месте.
 */
export interface GrChartLineConfigurableProps {
  size: GrChartSize
  height: number
  curve: GrChartCurve
  showGrid: 'both' | 'x' | 'y' | 'none'
  showLegend: boolean | 'auto'
  legendPosition: 'top' | 'bottom'
  tooltip: boolean
  dataTable: 'hidden' | 'visible' | 'off'
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChartLine: GrChartLineConfigurableProps
  }
}
