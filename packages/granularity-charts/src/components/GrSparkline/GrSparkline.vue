<script setup lang="ts">
import { useGrComponentProp } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed } from 'vue'

import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatValue } from '../../chart/chartFormat'
import { linearScale } from '../../chart/chartScale'
import { type GrChartPoint, normalizeChartData } from '../../chart/chartModel'
import { areaPath, linePath, type PathPoint } from '../../chart/chartPath'
import {
  sparklineFillOpacity,
  sparklinePointStroke,
  sparklineRootClass,
  sparklineStroke,
  sparklineStrokeWidth,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './grSparklineStyles'

/**
 * Линия без рамы: в ячейку таблицы, в карточку показателя, рядом с числом.
 *
 * Ни осей, ни легенды, ни тултипа, ни замера контейнера — поэтому его не
 * страшно поставить сотней штук в `GrDataTable`. Рисунок живёт в фиксированной
 * системе координат и растягивается по контейнеру.
 *
 * Он **неинтерактивен**, и это меняет доступность: `role="img"` с осмысленным
 * именем здесь честнее оверлея с клавиатурой — точек не разглядеть, а число
 * рядом уже написано.
 */

export interface GrSparklineProps {
  /** Голый ряд чисел либо точки. `null` — пропуск, линия рвётся. */
  data: readonly (number | null)[] | readonly GrChartPoint[]
  variant?: 'line' | 'area'
  /** Цвет линии. Не задан — токен `--gr-sparkline-color`. */
  color?: string
  showLastPoint?: boolean
  /** Автоматическая текстовая сводка для скринридера. */
  summary?: boolean
  valueFormat?: GrChartNumberFormat
  locale?: string
  /** Своё имя вместо сводки. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<GrSparklineProps>(), {
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  variant: undefined,
  color: undefined,
  showLastPoint: undefined,
  summary: undefined,
  valueFormat: undefined,
  locale: undefined,
  ariaLabel: undefined,
})

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedVariant = useGrComponentProp('GrSparkline', 'variant', () => props.variant, 'line' as const)
const resolvedShowLastPoint = useGrComponentProp('GrSparkline', 'showLastPoint', () => props.showLastPoint, true)
const resolvedSummary = useGrComponentProp('GrSparkline', 'summary', () => props.summary, true)
const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')

/**
 * Вид входа решает первый непустой элемент, а не нулевой: ряд вполне может
 * начинаться с пропуска, и `[null, null, 5]` — это числа, а не точки.
 */
const isPointList = computed(() => {
  const sample = props.data.find(item => item !== null && item !== undefined)

  return typeof sample === 'object'
})

const data = computed(() => normalizeChartData(
  isPointList.value
    ? [{ id: 'sparkline', data: props.data as readonly GrChartPoint[] }]
    : (props.data as readonly (number | null)[]),
))

const series = computed(() => data.value.series[0])

const scales = computed(() => ({
  x: linearScale(data.value.xDomain, [0, VIEW_WIDTH]),
  // Верх холста — максимум ряда: экранная ось Y растёт вниз.
  y: linearScale(data.value.yDomain, [VIEW_HEIGHT, 0]),
}))

const points = computed<PathPoint[]>(() => (series.value?.points ?? []).map(point => ({
  x: scales.value.x.scale(point.x),
  y: point.y === null ? null : scales.value.y.scale(point.y),
})))

const linePathD = computed(() => linePath(points.value))
const areaPathD = computed(() => (resolvedVariant.value === 'area' ? areaPath(points.value, VIEW_HEIGHT) : ''))

const lastPoint = computed(() => {
  if (!resolvedShowLastPoint.value)
    return null

  for (let i = points.value.length - 1; i >= 0; i--) {
    const point = points.value[i]!

    if (point.y !== null)
      return point as { x: number, y: number }
  }

  return null
})

const numberFormat = computed<GrChartNumberFormat>(() => ({
  locale: resolvedLocale.value,
  ...props.valueFormat,
}))

/**
 * Сводка вместо картинки.
 *
 * «График» в качестве альтернативного текста не сообщает ничего; направление,
 * края и размах — сообщают, и произносятся за секунду.
 */
const label = computed(() => {
  if (props.ariaLabel)
    return props.ariaLabel

  const values = (series.value?.points ?? [])
    .map(point => point.y)
    .filter((value): value is number => value !== null)

  if (!resolvedSummary.value || values.length === 0)
    return t('grCharts.sparkline.label', 'Sparkline')

  const first = values[0]!
  const last = values[values.length - 1]!
  const trend = last > first
    ? t('grCharts.sparkline.trendUp', 'rising')
    : last < first
      ? t('grCharts.sparkline.trendDown', 'falling')
      : t('grCharts.sparkline.trendFlat', 'flat')

  return t('grCharts.sparkline.summary', '{trend}, from {first} to {last}, minimum {min}, maximum {max}', {
    trend,
    first: formatValue(first, numberFormat.value),
    last: formatValue(last, numberFormat.value),
    min: formatValue(Math.min(...values), numberFormat.value),
    max: formatValue(Math.max(...values), numberFormat.value),
  })
})
</script>

<template>
  <svg
    :class="sparklineRootClass"
    :viewBox="`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`"
    preserveAspectRatio="none"
    role="img"
    :aria-label="label"
    data-gr-sparkline
  >
    <path
      v-if="areaPathD"
      :d="areaPathD"
      :fill="color ?? sparklineStroke"
      :fill-opacity="sparklineFillOpacity"
      stroke="none"
    />
    <path
      v-if="linePathD"
      :d="linePathD"
      fill="none"
      :stroke="color ?? sparklineStroke"
      :stroke-width="sparklineStrokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
      data-gr-sparkline-line
    />
    <!--
      Маркер — нулевой отрезок с круглым торцом, а не `<circle>`: холст
      растянут по контейнеру, и круг превратился бы в эллипс. Штрих от
      растяжения защищён `vector-effect`, а вместе с ним и торец.
    -->
    <path
      v-if="lastPoint"
      :d="`M ${lastPoint.x} ${lastPoint.y} L ${lastPoint.x} ${lastPoint.y}`"
      fill="none"
      :stroke="color ?? sparklinePointStroke"
      stroke-width="4"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
      data-gr-sparkline-point
    />
  </svg>
</template>
