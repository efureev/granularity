import type { GrChartCurve } from '../../chart/chartPath'
import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'
import type { GrChartZoom } from '../../composables/internal/useChartZoom'

/**
 * Пропы `GrChartArea`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrChartArea: { … } }">`.
 *
 * Только оформление: данные, стек и границы осей задаются на месте.
 */
export interface GrChartAreaConfigurableProps {
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
