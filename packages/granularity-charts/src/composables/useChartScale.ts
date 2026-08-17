import { computed, type ComputedRef } from 'vue'

import type { ChartData } from '../chart/chartModel'
import type { Rect } from '../chart/chartLayout'
import { createScale, type GrChartScale, linearScale } from '../chart/chartScale'

/**
 * Шкалы графика по данным и области построения.
 *
 * **Состояния композабл не держит и держать не должен** — это реактивный
 * адаптер над `chart/chartScale.ts`, и по критерию репозитория (`optionFilter`
 * в ядре оставлен чистым модулем ровно поэтому) ему полагалось бы быть
 * функцией. Композабл он потому, что связывает пять реактивных источников —
 * данные, прямоугольник, тип шкалы, границы, отступы полос, — и без него эту
 * связку переписал бы каждый из пяти будущих компонентов.
 *
 * Появится соблазн добавить сюда `ref` — значит, задача не про шкалы: место
 * состояния либо в компоненте, либо в `useChartTooltip`.
 */
export interface UseChartScaleOptions {
  data: () => ChartData
  plot: () => Rect
  /** Домен оси значений, если он уже расширен до «красивых» делений. */
  yDomain?: () => readonly [number, number] | undefined
  /** Домен правой оси. `undefined` — второй оси нет. */
  yDomainRight?: () => readonly [number, number] | undefined
  paddingInner?: () => number | undefined
  paddingOuter?: () => number | undefined
}

export interface UseChartScaleReturn {
  xScale: ComputedRef<GrChartScale>
  yScale: ComputedRef<GrChartScale>
  /** Шкала правой оси; `null` — оси одна, и серии `axis: 'right'` падают на левую. */
  yScaleRight: ComputedRef<GrChartScale | null>
}

export function useChartScale(options: UseChartScaleOptions): UseChartScaleReturn {
  const xScale = computed(() => {
    const data = options.data()
    const plot = options.plot()

    return createScale(data.kind, data.xDomain, [plot.x, plot.x + plot.width], {
      paddingInner: options.paddingInner?.(),
      paddingOuter: options.paddingOuter?.(),
    })
  })

  const yScale = computed(() => {
    const plot = options.plot()
    const domain = options.yDomain?.() ?? options.data().yDomain

    // Диапазон перевёрнут: ноль внизу холста, рост вверх. Экранная ось Y растёт
    // вниз, и без переворота график рисовался бы зеркально.
    return linearScale(domain, [plot.y + plot.height, plot.y])
  })

  const yScaleRight = computed(() => {
    const domain = options.yDomainRight?.() ?? options.data().yDomainRight

    if (domain === undefined)
      return null

    const plot = options.plot()

    return linearScale(domain, [plot.y + plot.height, plot.y])
  })

  return { xScale, yScale, yScaleRight }
}
