import type { GrChartCurve } from '../../chart/chartPath'
import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartArea`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartArea: { … } }">`.
 *
 * Только оформление: данные, стек и границы осей задаются на месте.
 */
export interface GrChartAreaConfigurableProps {
  size: GrChartSize
  height: number
  curve: GrChartCurve
  fill: 'auto' | 'gradient' | 'solid'
  showGrid: 'both' | 'x' | 'y' | 'none'
  showLegend: boolean | 'auto'
  legendPosition: 'top' | 'bottom'
  tooltip: boolean
  dataTable: 'hidden' | 'visible' | 'off'
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChartArea: GrChartAreaConfigurableProps
  }
}
