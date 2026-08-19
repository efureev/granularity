import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartWaterfall`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartWaterfall: { … } }">`.
 *
 * Только оформление: шаги, начальное накопление и границы оси задаются на месте.
 */
export interface GrChartWaterfallConfigurableProps {
  size: GrChartSize
  height: number
  /** Скругление дальнего конца столбца в пикселях: радиус идёт в геометрию пути, а не в CSS. */
  barRadius: number
  /** Линии от вершины предыдущего столбца к основанию следующего. */
  showConnectors: boolean
  orientation: 'vertical' | 'horizontal'
  showGrid: 'both' | 'x' | 'y' | 'none'
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
    GrChartWaterfall: GrChartWaterfallConfigurableProps
  }
}
