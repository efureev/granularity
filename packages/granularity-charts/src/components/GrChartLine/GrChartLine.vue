<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import type { GrChartNumberFormat } from '../../chart/chartFormat'
import type { GrChartScale, GrChartScaleKind  } from '../../chart/chartScale'
import type { GrChartSeries, NormalizedSeries } from '../../chart/chartModel'
import { normalizeChartData } from '../../chart/chartModel'
import { type GrChartCurve, linePath, type PathPoint, symbolPath } from '../../chart/chartPath'
import type { ChartTickFormat } from '../../composables/useChartTicks'
import type { GrChartActivePoint } from '../../composables/useChartTooltip'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'
import {
  ACTIVE_POINT_SCALE,
  AUTO_POINTS_LIMIT,
  lineStrokeWidth,
  pointHaloStroke,
  pointSizes,
} from './grChartLineStyles'

/**
 * Линейный график: ряд во времени, по числовой оси или по категориям.
 *
 * Рисует только марки — оси, сетку, легенду, тултип, состояния, клавиатуру и
 * скрытую таблицу данных берёт на себя общая рама.
 */

export interface GrChartLineProps {
  /** Серии либо голый ряд чисел — тогда `x` становится порядковым номером. */
  series: readonly GrChartSeries[] | readonly number[]
  /** Тип оси X. Не задан — выводится из данных. */
  xScale?: GrChartScaleKind
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  yDomain?: readonly [number | null, number | null]
  includeZero?: boolean
  xTickCount?: number
  yTickCount?: number
  xTickFormat?: ChartTickFormat
  yTickFormat?: (value: number) => string
  valueFormat?: GrChartNumberFormat
  curve?: GrChartCurve
  showPoints?: 'auto' | 'always' | 'never'
  showGrid?: 'both' | 'x' | 'y' | 'none'
  showLegend?: boolean | 'auto'
  legendPosition?: 'top' | 'bottom'
  tooltip?: boolean
  /** Скрытые серии по id — `v-model:hiddenSeries`. */
  hiddenSeries?: readonly string[]
  /** Курсор — `v-model:activeIndex`. Синхронизирует пару графиков. */
  activeIndex?: number | null
  loading?: boolean
  empty?: boolean
  emptyText?: string
  dataTable?: 'hidden' | 'visible' | 'off'
  /** `false` — график становится картинкой: без фокуса, тултипа и клавиатуры. */
  interactive?: boolean
  size?: GrChartSize
  locale?: string
  ariaLabel?: string
  ariaDescription?: string
  /** Рендерер. Расширится значением `canvas`, когда появится второй путь. */
  renderer?: 'auto' | 'svg'
  /** Порог, выше которого маркеры не рисуются даже при `showPoints: 'auto'`. */
  canvasThreshold?: number
}

export interface GrChartLineEmits {
  (e: 'update:hiddenSeries', value: string[]): void
  (e: 'update:activeIndex', value: number | null): void
  (e: 'pointClick', value: GrChartActivePoint): void
  (e: 'pointHover', value: GrChartActivePoint | null): void
  (e: 'legendToggle', value: { seriesId: string, hidden: boolean }): void
}

const props = withDefaults(defineProps<GrChartLineProps>(), {
  xScale: undefined,
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  height: undefined,
  width: 640,
  yDomain: undefined,
  includeZero: false,
  xTickCount: 6,
  yTickCount: 5,
  xTickFormat: undefined,
  yTickFormat: undefined,
  valueFormat: undefined,
  curve: undefined,
  showPoints: 'auto',
  showGrid: undefined,
  showLegend: undefined,
  legendPosition: undefined,
  tooltip: undefined,
  hiddenSeries: undefined,
  activeIndex: undefined,
  loading: false,
  empty: undefined,
  emptyText: undefined,
  dataTable: undefined,
  interactive: true,
  size: undefined,
  locale: undefined,
  ariaLabel: undefined,
  ariaDescription: undefined,
  renderer: 'auto',
  canvasThreshold: 2000,
})

const emit = defineEmits<GrChartLineEmits>()

defineSlots<{
  tooltip?: (props: { active: GrChartActivePoint, formatValue: (value: number | null) => string }) => unknown
  legend?: (props: { series: readonly NormalizedSeries[], toggle: (id: string) => void }) => unknown
  empty?: () => unknown
  header?: () => unknown
}>()

const { t } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartLine' })
const resolvedHeight = useGrComponentProp('GrChartLine', 'height', () => props.height, 256)
const resolvedCurve = useGrComponentProp('GrChartLine', 'curve', () => props.curve, 'linear' as GrChartCurve)
const resolvedGrid = useGrComponentProp('GrChartLine', 'showGrid', () => props.showGrid, 'y' as const)
const resolvedLegendMode = useGrComponentProp('GrChartLine', 'showLegend', () => props.showLegend, 'auto' as const)
const resolvedLegendPosition = useGrComponentProp('GrChartLine', 'legendPosition', () => props.legendPosition, 'bottom' as const)
const resolvedTooltip = useGrComponentProp('GrChartLine', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartLine', 'dataTable', () => props.dataTable, 'hidden' as const)

/** Скрытые серии приходят пропом, а флаг живёт на самой серии — сводим здесь. */
const seriesInput = computed<readonly GrChartSeries[] | readonly number[]>(() => {
  if (props.series.length > 0 && typeof props.series[0] === 'number')
    return props.series as readonly number[]

  const hidden = new Set(props.hiddenSeries ?? [])

  return (props.series as readonly GrChartSeries[]).map(series => ({
    ...series,
    hidden: series.hidden === true || hidden.has(series.id),
  }))
})

const data = computed(() => normalizeChartData(seriesInput.value, {
  kind: props.xScale,
  includeZero: props.includeZero,
  yDomain: props.yDomain,
}))

const showLegend = computed(() => (
  resolvedLegendMode.value === 'auto' ? data.value.series.length > 1 : resolvedLegendMode.value === true
))

/**
 * Порог маркеров работает уже сейчас, хотя canvas-пути ещё нет.
 *
 * «SVG до двух тысяч точек» иначе осталось бы обещанием в доке: при
 * `showPoints: 'always'` и пятидесяти тысячах точек виноват был бы пакет.
 */
const showMarkers = computed(() => {
  const total = data.value.positions.length

  if (props.showPoints === 'never')
    return false
  if (total > props.canvasThreshold)
    return false

  return props.showPoints === 'always' || total <= AUTO_POINTS_LIMIT
})

const markerSize = computed(() => pointSizes[resolvedSize.value])

function toPixels(series: NormalizedSeries, xScale: GrChartScale, yScale: GrChartScale): PathPoint[] {
  return series.points.map(point => ({
    x: xScale.scale(point.x),
    y: point.y === null ? null : yScale.scale(point.y),
  }))
}

interface Marker {
  key: string
  d: string
  color: string
}

/** Маркеры всех видимых серий одним плоским списком — так шаблон остаётся плоским. */
function markers(
  series: readonly NormalizedSeries[],
  xScale: GrChartScale,
  yScale: GrChartScale,
): Marker[] {
  const size = markerSize.value

  return series.flatMap(item => item.points
    .filter(point => point.y !== null)
    .map(point => ({
      key: `${item.id}-${point.sourceIndex}`,
      d: symbolPath(item.style.shape, xScale.scale(point.x), yScale.scale(point.y!), size),
      color: item.style.color,
    })))
}

/** Активная точка крупнее соседних: вертикаль показывает «где», размер — «что именно». */
function activeMarkers(
  series: readonly NormalizedSeries[],
  xScale: GrChartScale,
  yScale: GrChartScale,
  cursor: number | null,
): Marker[] {
  if (cursor === null)
    return []

  const x = data.value.positions[cursor]

  if (x === undefined)
    return []

  const size = markerSize.value * ACTIVE_POINT_SCALE

  return series.flatMap((item) => {
    const point = item.points.find(candidate => candidate.x === x && candidate.y !== null)

    if (!point)
      return []

    return [{
      key: `active-${item.id}`,
      d: symbolPath(item.style.shape, xScale.scale(point.x), yScale.scale(point.y!), size),
      color: item.style.color,
    }]
  })
}

function onLegendToggle(payload: { seriesId: string, hidden: boolean }): void {
  emit('legendToggle', payload)

  const next = new Set(props.hiddenSeries ?? [])

  if (payload.hidden)
    next.add(payload.seriesId)
  else
    next.delete(payload.seriesId)

  emit('update:hiddenSeries', [...next])
}

const frameEl = ref<InstanceType<typeof ChartFrame> | null>(null)

defineExpose({
  /** Корневой элемент — для замеров и скролла в потребителе. */
  element: computed(() => (frameEl.value?.$el ?? null) as HTMLElement | null),
})
</script>

<template>
  <ChartFrame
    ref="frameEl"
    :data="data"
    :height="resolvedHeight"
    :width="width"
    :size="resolvedSize"
    :show-grid="resolvedGrid"
    :show-legend="showLegend"
    :legend-position="resolvedLegendPosition"
    :tooltip="resolvedTooltip"
    :loading="loading"
    :empty="empty"
    :empty-text="emptyText"
    :data-table="resolvedDataTable"
    :interactive="interactive"
    :active-index="activeIndex"
    :locale="locale"
    :aria-label="ariaLabel"
    :aria-description="ariaDescription"
    :role-description="t('grCharts.line.label', 'Line chart')"
    :x-tick-count="xTickCount"
    :y-tick-count="yTickCount"
    :x-tick-format="xTickFormat"
    :y-tick-format="yTickFormat"
    :value-format="valueFormat"
    data-gr-chart-line
    @update:active-index="value => emit('update:activeIndex', value)"
    @point-click="value => emit('pointClick', value)"
    @point-hover="value => emit('pointHover', value)"
    @legend-toggle="onLegendToggle"
  >
    <template #header>
<slot name="header" />
</template>

    <template #plot="{ xScale: sx, yScale: sy, visibleSeries, activeIndex: cursor, clipPathId }">
      <g :clip-path="`url(#${clipPathId})`" data-gr-chart-line-body>
        <path
          v-for="item in visibleSeries"
          :key="item.id"
          :data-gr-chart-series="item.id"
          :d="linePath(toPixels(item, sx, sy), resolvedCurve)"
          fill="none"
          :stroke="item.style.color"
          :stroke-width="lineStrokeWidth"
          :stroke-dasharray="item.style.dashArray"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <path
          v-for="marker in (showMarkers ? markers(visibleSeries, sx, sy) : [])"
          :key="marker.key"
          :d="marker.d"
          :fill="marker.color"
          :stroke="pointHaloStroke"
          stroke-width="1.5"
        />

        <path
          v-for="marker in activeMarkers(visibleSeries, sx, sy, cursor)"
          :key="marker.key"
          data-gr-chart-active-point
          :d="marker.d"
          :fill="marker.color"
          :stroke="pointHaloStroke"
          stroke-width="2"
        />
      </g>
    </template>

    <template v-if="$slots.tooltip" #tooltip="scope">
<slot name="tooltip" v-bind="scope" />
</template>
    <template v-if="$slots.legend" #legend="scope">
<slot name="legend" v-bind="scope" />
</template>
    <template v-if="$slots.empty" #empty>
<slot name="empty" />
</template>
  </ChartFrame>
</template>
