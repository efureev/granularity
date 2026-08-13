import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartPie`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartPie: { … } }">`.
 *
 * Только оформление: данные и подписи задаются на месте.
 */
export interface GrChartPieConfigurableProps {
  size: GrChartSize
  height: number
  variant: 'pie' | 'donut'
  donutRatio: number
  labels: 'none' | 'share' | 'value'
  showLegend: boolean
  legendPosition: 'top' | 'bottom'
  tooltip: boolean
  dataTable: 'hidden' | 'visible' | 'off'
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChartPie: GrChartPieConfigurableProps
  }
}
