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
  /**
   * Потолок строк скрытой таблицы данных.
   *
   * Политика приложения: держать ли весь ряд в дереве доступности, усечь ли его
   * до читаемого или убрать таблицу вовсе — решение уровня продукта, а не
   * отдельного графика.
   */
  dataTableMaxRows: number | 'auto'
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrChartBullet: GrChartBulletConfigurableProps
  }
}
