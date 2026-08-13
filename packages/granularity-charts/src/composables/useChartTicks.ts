import { computed, type ComputedRef } from 'vue'

import { formatNumber, formatTimeTick } from '../chart/chartFormat'
import type { GrChartScale, GrChartScaleKind } from '../chart/chartScale'
import { bandTicks, linearTicks, timeTicks } from '../chart/chartTicks'

/**
 * Деления оси: значение, координата и уже готовая подпись.
 *
 * Состояния, как и `useChartScale`, не держит — см. обоснование там же.
 */
export interface ChartTick {
  value: number
  position: number
  label: string
}

export type ChartTickFormat = (value: number, kind: GrChartScaleKind) => string

export interface UseChartTicksOptions {
  scale: () => GrChartScale
  count: () => number
  /** Категории — только для `band`: подпись деления берётся из них, а не из числа. */
  categories?: () => readonly string[]
  locale?: () => string | undefined
  format?: () => ChartTickFormat | undefined
  /** Потолок числа подписей у категориальной оси. */
  maxLabels?: () => number | undefined
}

const DEFAULT_MAX_BAND_LABELS = 12

export function useChartTicks(options: UseChartTicksOptions): ComputedRef<ChartTick[]> {
  return computed<ChartTick[]>(() => {
    const scale = options.scale()
    const count = options.count()
    const custom = options.format?.()
    const locale = options.locale?.()

    if (scale.kind === 'band') {
      const categories = options.categories?.() ?? []
      const indices = bandTicks(categories.length, options.maxLabels?.() ?? DEFAULT_MAX_BAND_LABELS)

      return indices.map(index => ({
        value: index,
        position: scale.scale(index),
        label: custom ? custom(index, 'band') : categories[index] ?? String(index),
      }))
    }

    if (scale.kind === 'time') {
      const { values, unit } = timeTicks(scale.domain, count)

      return values.map(value => ({
        value,
        position: scale.scale(value),
        label: custom ? custom(value, 'time') : formatTimeTick(value, unit, locale ?? 'en'),
      }))
    }

    const { values } = linearTicks(scale.domain, count)

    return values.map(value => ({
      value,
      position: scale.scale(value),
      label: custom ? custom(value, 'linear') : formatNumber(value, { locale }),
    }))
  })
}
