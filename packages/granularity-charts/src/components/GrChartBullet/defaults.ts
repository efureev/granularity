import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartBullet`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartBullet: { … } }">`.
 *
 * Только оформление: величина, цель и границы диапазонов задаются на месте.
 */
export interface GrChartBulletConfigurableProps {
  size: GrChartSize
  height: number
  orientation: 'horizontal' | 'vertical'
  tooltip: boolean
  dataTable: 'hidden' | 'visible' | 'off'
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChartBullet: GrChartBulletConfigurableProps
  }
}
