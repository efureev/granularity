import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartHeatmap`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartHeatmap: { … } }">`.
 *
 * Только оформление: матрица, подписи и границы шкалы задаются на месте.
 */
export interface GrChartHeatmapConfigurableProps {
  size: GrChartSize
  height: number
  /** Зазор между ячейками в пикселях: он идёт в геометрию сетки, а не в CSS. */
  cellGap: number
  /** Число ступеней шкалы; `0` — непрерывная. */
  steps: number
  showLegend: boolean
  showValues: boolean | 'auto'
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
    GrChartHeatmap: GrChartHeatmapConfigurableProps
  }
}
