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
  sparklineCanvasClass,
  sparklineFillOpacity,
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
  summary: undefined,
  valueFormat: undefined,
  locale: undefined,
  ariaLabel: undefined,
})

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedVariant = useGrComponentProp('GrSparkline', 'variant', () => props.variant, 'line' as const)
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

const points = computed<PathPoint[]>(() => {
  const mapped: PathPoint[] = (series.value?.points ?? []).map(point => ({
    x: scales.value.x.scale(point.x),
    y: point.y === null ? null : scales.value.y.scale(point.y),
  }))

  const solid = mapped.filter(point => point.y !== null)

  /**
   * Единственное значение растягивается в горизонтальную линию во всю ширину.
   *
   * Отрезок нулевой длины не рисует ни один рендерер, и холст остался бы
   * пустым — а пустой холст читается как «нет данных». Одна точка означает
   * другое: «изменений пока нет», и плоская линия говорит это ровно.
   */
  if (solid.length === 1)
    return [{ x: 0, y: solid[0]!.y }, { x: VIEW_WIDTH, y: solid[0]!.y }]

  return mapped
})

const linePathD = computed(() => linePath(points.value))
const areaPathD = computed(() => (resolvedVariant.value === 'area' ? areaPath(points.value, VIEW_HEIGHT) : ''))

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
  <span :class="sparklineRootClass" role="img" :aria-label="label" data-gr-sparkline>
    <!-- Смысл несёт имя обёртки: рисунок для скринридера — декорация. -->
    <svg
      :class="sparklineCanvasClass"
      :viewBox="`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        v-if="areaPathD"
        :d="areaPathD"
        :fill="color ?? sparklineStroke"
        :fill-opacity="sparklineFillOpacity"
        stroke="none"
      />
      <!--
        Торцы — `butt`, а не `round`: холст растянут неравномерно, и круглый
        торец приезжает сплющенной линзой. Концы ряда — граница данных, им
        скругление и не нужно; стыки внутри линии остаются круглыми.
      -->
      <path
        v-if="linePathD"
        :d="linePathD"
        fill="none"
        :stroke="color ?? sparklineStroke"
        :stroke-width="sparklineStrokeWidth"
        stroke-linecap="butt"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
        data-gr-sparkline-line
      />
    </svg>
  </span>
</template>
