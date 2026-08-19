import type { ChartOrientation } from '../../chart/chartOrientation'
import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Пропы `GrChartBar`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartBar: { … } }">`.
 *
 * Только оформление: данные, режим стека и границы осей задаются на месте.
 */
export interface GrChartBarConfigurableProps {
  size: GrChartSize
  /**
   * Раскладка столбцов. Настраивается глобально, потому что решение сквозное:
   * приложение с длинными названиями категорий выбирает горизонталь один раз.
   */
  orientation: ChartOrientation
  height: number
  /** Скругление дальнего конца полосы в пикселях: радиус идёт в геометрию пути, а не в CSS. */
  barRadius: number
  groupPadding: number
  /** Гасить полосы неактивных категорий при наведении. */
  dimInactive: boolean
  showGrid: 'both' | 'x' | 'y' | 'none'
  showLegend: boolean | 'auto'
  legendPosition: 'top' | 'bottom'
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
    GrChartBar: GrChartBarConfigurableProps
  }
}
