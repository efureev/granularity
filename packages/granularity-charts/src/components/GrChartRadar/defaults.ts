import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartRadar`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartRadar: { … } }">`.
 *
 * Только оформление: данные и границы осей задаются на месте.
 */
export interface GrChartRadarConfigurableProps {
  size: GrChartSize
  height: number
  axisScale: 'shared' | 'per-axis'
  /** Число колец сетки. У радара это то же, что число делений оси значений. */
  rings: number
  fill: boolean
  shape: 'polygon' | 'circle'
  showPoints: 'auto' | 'always' | 'never'
  showLegend: boolean | 'auto'
  legendPosition: 'top' | 'bottom'
  tooltip: boolean
  dataTable: 'hidden' | 'visible' | 'off'
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChartRadar: GrChartRadarConfigurableProps
  }
}
