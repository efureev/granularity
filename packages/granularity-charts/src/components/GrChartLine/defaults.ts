import type { GrChartCurve } from '../../chart/chartPath'
import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'
import type { GrChartZoom } from '../../composables/internal/useChartZoom'

/**
 * Пропы `GrChartLine`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartLine: { … } }">`.
 *
 * Только оформление: данные и границы осей задаются на месте.
 */
export interface GrChartLineConfigurableProps {
  /**
   * Когда прореживать ряд для рисунка. Политика рендера — приложение с плотными
   * рядами задаёт её один раз на всё поддерево.
   */
  decimate: 'auto' | 'always' | 'never'
  /** Бюджет точек на серию. */
  maxPoints: number
  /**
   * Какими жестами меняется видимое окно.
   *
   * Политика приложения, а не свойство отдельного графика: включать
   * приближение на одной панели и не включать на соседней — это разные правила
   * поведения у одинаковых с виду картинок.
   */
  zoom: GrChartZoom

  size: GrChartSize
  height: number
  curve: GrChartCurve
  /** Чем закрыть разрыв ряда: ничем, тенью или штрихом. */
  gaps: 'hidden' | 'shadow' | 'dashed'
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
