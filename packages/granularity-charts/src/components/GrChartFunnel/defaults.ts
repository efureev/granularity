import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartFunnel`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartFunnel: { … } }">`.
 *
 * Только оформление: ступени и их значения задаются на месте.
 */
export interface GrChartFunnelConfigurableProps {
  size: GrChartSize
  height: number
  orientation: 'vertical' | 'horizontal'
  shape: 'trapezoid' | 'bar'
  /** Что писать у ступени: долю от первой, от предыдущей или абсолют. */
  labels: 'value' | 'share-first' | 'share-prev' | 'none'
  /** Зазор между ступенями в пикселях: он идёт в геометрию, а не в CSS. */
  gap: number
  tooltip: boolean
  dataTable: 'hidden' | 'visible' | 'off'
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChartFunnel: GrChartFunnelConfigurableProps
  }
}
