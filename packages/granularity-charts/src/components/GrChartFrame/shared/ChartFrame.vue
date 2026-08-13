<script setup lang="ts">
import GrEmptyState from '@feugene/granularity/components/GrEmptyState'
import GrSkeleton from '@feugene/granularity/components/GrSkeleton'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useFloating } from '@feugene/granularity/composables/useFloating'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref, useId, watch } from 'vue'

import type { GrChartNumberFormat } from '../../../chart/chartFormat'
import { formatNumber, formatTimeValue, formatValue } from '../../../chart/chartFormat'
import { chartLayout, type Rect } from '../../../chart/chartLayout'
import type { ChartData, NormalizedPoint, NormalizedSeries } from '../../../chart/chartModel'
import { createScale, type GrChartScale, linearScale } from '../../../chart/chartScale'
import { linearTicks } from '../../../chart/chartTicks'
import { chartTableModel } from '../../../chart/chartTable'
import { useChartScale } from '../../../composables/useChartScale'
import { type ChartTick, type ChartTickFormat, useChartTicks } from '../../../composables/useChartTicks'
import { type GrChartActivePoint, useChartTooltip } from '../../../composables/useChartTooltip'
import { useChartA11y } from '../../../composables/internal/useChartA11y'
import { useElementSize } from '../../../composables/internal/useElementSize'
import ChartAxis from './ChartAxis.vue'
import ChartDataTable from './ChartDataTable.vue'
import ChartGrid from './ChartGrid.vue'
import ChartLegend from './ChartLegend.vue'
import ChartTooltip from './ChartTooltip.vue'
import {
  crosshairStroke,
  type GrChartSize,
  frameRootClass,
  frameStateClass,
  frameSurfaceClass,
  frameSvgClass,
  labelFontPx,
  labelSizeClass,
} from '../chartFrameStyles'

/**
 * Общая рама графика: оси, сетка, легенда, тултип, состояния, клавиатура и
 * скрытая таблица данных. Сами марки рама не рисует — их отдаёт слот `plot`.
 *
 * Наружу не экспортируется и компонентом не является: у директории нет ни
 * `index.ts`, ни `config.ts`, поэтому генератор реестров её не видит (гейт
 * `frameOwnership.test.ts`). Владельцем токенов `--gr-chart-frame-*` она при
 * этом остаётся.
 */

export interface ChartPlotScope {
  plot: Rect
  xScale: GrChartScale
  yScale: GrChartScale
  data: ChartData
  visibleSeries: readonly NormalizedSeries[]
  activeIndex: number | null
  clipPathId: string
}

export interface ChartFrameProps {
  data: ChartData
  /** Высота холста в пикселях: раскладка обязана быть детерминированной до первого замера. */
  height?: number
  /** Объявленная ширина — от неё идёт серверный рендер, клиентская уточняется замером. */
  width?: number
  size?: GrChartSize
  axes?: boolean
  showGrid?: 'both' | 'x' | 'y' | 'none'
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom'
  tooltip?: boolean
  loading?: boolean
  empty?: boolean
  emptyText?: string
  dataTable?: 'hidden' | 'visible' | 'off'
  interactive?: boolean
  activeIndex?: number | null
  locale?: string
  ariaLabel?: string
  ariaDescription?: string
  /** Чем себя называет график: «линейный график», «столбцы». */
  roleDescription?: string
  xTickCount?: number
  yTickCount?: number
  xTickFormat?: ChartTickFormat
  yTickFormat?: (value: number) => string
  valueFormat?: GrChartNumberFormat
}

export interface ChartFrameEmits {
  (e: 'update:activeIndex', value: number | null): void
  (e: 'pointClick', value: GrChartActivePoint): void
  (e: 'pointHover', value: GrChartActivePoint | null): void
  (e: 'legendToggle', value: { seriesId: string, hidden: boolean }): void
}

const props = withDefaults(defineProps<ChartFrameProps>(), {
  height: 256,
  width: 640,
  size: 'md',
  axes: true,
  showGrid: 'y',
  showLegend: false,
  legendPosition: 'bottom',
  tooltip: true,
  loading: false,
  empty: undefined,
  emptyText: undefined,
  dataTable: 'hidden',
  interactive: true,
  activeIndex: undefined,
  locale: undefined,
  ariaLabel: undefined,
  ariaDescription: undefined,
  roleDescription: undefined,
  xTickCount: 6,
  yTickCount: 5,
  xTickFormat: undefined,
  yTickFormat: undefined,
  valueFormat: undefined,
})

const emit = defineEmits<ChartFrameEmits>()

defineSlots<{
  /** Марки графика: линия, площадь, столбцы. */
  plot?: (props: ChartPlotScope) => unknown
  /** Своя панель тултипа. */
  tooltip?: (props: { active: GrChartActivePoint, formatValue: (value: number | null) => string }) => unknown
  /** Своя легенда. */
  legend?: (props: { series: readonly NormalizedSeries[], toggle: (id: string) => void }) => unknown
  /** Своё пустое состояние. */
  empty?: () => unknown
  /** Строка над графиком: заголовок, действия. */
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()
const { announce } = useAnnouncer()

const rootEl = ref<HTMLElement | null>(null)
const surfaceEl = ref<HTMLElement | null>(null)
const anchorEl = ref<HTMLElement | null>(null)
const tooltipEl = ref<HTMLElement | null>(null)

const clipPathId = `gr-chart-clip-${useId()}`

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const fontSizePx = computed(() => labelFontPx[props.size])
const { width } = useElementSize(rootEl, { initialWidth: () => props.width })

const visibleSeries = computed(() => props.data.series.filter(series => !series.hidden))
const isEmpty = computed(() => props.empty ?? props.data.positions.length === 0)
const showAxes = computed(() => props.axes && !isEmpty.value && !props.loading)

/**
 * Домен оси значений расширяется до «красивых» границ.
 *
 * Иначе верхнее деление сетки повисает под верхним краем данных, и график
 * выглядит обрезанным сверху.
 */
const niceYDomain = computed<[number, number]>(() => linearTicks(props.data.yDomain, props.yTickCount).niceDomain)

/**
 * Подписи считаются на единичной шкале, координаты — на настоящей.
 *
 * Круг замыкается иначе: раскладке нужны подписи (по ним считается отступ под
 * ось), а настоящей шкале — раскладка. Подписи от раскладки не зависят вовсе,
 * поэтому один проход форматирования делается заранее, а координаты
 * досчитываются потом.
 */
const labelScaleX = computed(() => createScale(props.data.kind, props.data.xDomain, [0, 1]))
const labelScaleY = computed(() => linearScale(niceYDomain.value, [1, 0]))

const xLabels = useChartTicks({
  scale: () => labelScaleX.value,
  count: () => props.xTickCount,
  categories: () => props.data.categories,
  locale: () => resolvedLocale.value,
  format: () => props.xTickFormat,
})

const yLabels = useChartTicks({
  scale: () => labelScaleY.value,
  count: () => props.yTickCount,
  locale: () => resolvedLocale.value,
  format: () => (props.yTickFormat ? value => props.yTickFormat!(value) : undefined),
})

/**
 * Пока данных нет, место под оси резервируется по образцовым подписям.
 *
 * Дважды зачем. Скелет тогда ложится **на область построения**, а не на весь
 * холст, и читается как «здесь будет график», а не как «здесь серый
 * прямоугольник». И, что важнее, область построения не переезжает в момент
 * прихода данных: без этого график прыгал бы на ширину оси у каждого
 * потребителя, который показывает загрузку.
 */
const LOADING_Y_LABEL = '0000'
const LOADING_X_LABEL = '00:00'

const reserveAxes = computed(() => props.axes && (props.loading || !isEmpty.value))

const layout = computed(() => chartLayout({
  width: width.value,
  height: props.height,
  yTickLabels: props.loading ? [LOADING_Y_LABEL] : showAxes.value ? yLabels.value.map(tick => tick.label) : [],
  xTickLabels: props.loading ? [LOADING_X_LABEL] : showAxes.value ? xLabels.value.map(tick => tick.label) : [],
  fontSizePx: fontSizePx.value,
  showYAxis: reserveAxes.value,
  showXAxis: reserveAxes.value,
}))

const plot = computed(() => layout.value.plot)

const plotStyle = computed(() => ({
  left: `${plot.value.x}px`,
  top: `${plot.value.y}px`,
  width: `${plot.value.width}px`,
  height: `${plot.value.height}px`,
}))

const { xScale, yScale } = useChartScale({
  data: () => props.data,
  plot: () => plot.value,
  yDomain: () => niceYDomain.value,
})

function withPosition(ticks: readonly ChartTick[], scale: GrChartScale): ChartTick[] {
  return ticks.map(tick => ({ ...tick, position: scale.scale(tick.value) }))
}

const xTicks = computed(() => withPosition(xLabels.value, xScale.value))
const yTicks = computed(() => withPosition(yLabels.value, yScale.value))

const tooltipApi = useChartTooltip({
  data: () => props.data,
  xScale: () => xScale.value,
  yScale: () => yScale.value,
  plot: () => plot.value,
  surface: surfaceEl,
  enabled: () => props.tooltip && props.interactive && !isEmpty.value,
})

const { floatingStyle } = useFloating(anchorEl, tooltipEl, tooltipApi.open, {
  placement: 'top',
  offsetPx: 12,
  zIndexVar: '--gr-z-tooltip',
})

const activeSeriesIndex = ref(0)

function formatX(point: NormalizedPoint): string {
  if (props.data.kind === 'time')
    return formatTimeValue(point.x, resolvedLocale.value)
  if (props.data.kind === 'band')
    return props.data.categories[point.x] ?? String(point.raw)

  return formatNumber(point.x, { locale: resolvedLocale.value })
}

const numberFormat = computed<GrChartNumberFormat>(() => ({
  locale: resolvedLocale.value,
  ...props.valueFormat,
}))

function formatPointValue(value: number | null): string {
  return formatValue(value, numberFormat.value, t('grCharts.chart.noValue', 'no value'))
}

function pointAt(index: number): NormalizedPoint | null {
  const x = props.data.positions[index]

  if (x === undefined)
    return null

  for (const series of visibleSeries.value) {
    const point = series.points.find(item => item.x === x)

    if (point)
      return point
  }

  return null
}

/**
 * Строка активной точки для живого региона.
 *
 * При нескольких сериях читается только активная: перечислять пять значений на
 * каждое нажатие стрелки — это не доступность, а шум.
 */
function describePoint(index: number, seriesIndex: number): string {
  const point = pointAt(index)
  const x = props.data.positions[index]

  if (!point || x === undefined)
    return ''

  const series = visibleSeries.value
  const xText = formatX(point)

  if (series.length <= 1) {
    const only = series[0]?.points.find(item => item.x === x)

    return t('grCharts.chart.point', '{x}. {values}', { x: xText, values: formatPointValue(only?.y ?? null) })
  }

  const current = series[Math.min(seriesIndex, series.length - 1)]!
  const value = current.points.find(item => item.x === x)?.y ?? null
  const values = t('grCharts.chart.seriesValue', '{series}: {value}', {
    series: current.label,
    value: formatPointValue(value),
  })

  return t('grCharts.chart.point', '{x}. {values}', { x: xText, values })
}

const a11y = useChartA11y({
  data: () => props.data,
  activeIndex: tooltipApi.activeIndex,
  activeSeriesIndex,
  setActive: index => tooltipApi.setActive(index),
  announce: message => announce(message),
  describe: describePoint,
  onActivate: () => {
    if (tooltipApi.active.value)
      emit('pointClick', tooltipApi.active.value)
  },
})

const surfaceLabel = computed(() => {
  if (props.ariaLabel)
    return props.ariaLabel

  const label = t('grCharts.chart.label', 'Chart, {series} series, {points} points', {
    series: visibleSeries.value.length,
    points: props.data.positions.length,
  })

  return `${label}. ${t('grCharts.chart.keyboardHint', 'Use arrow keys to browse points')}`
})

const tableModel = computed(() => chartTableModel(props.data, {
  xLabel: t('grCharts.chart.columnX', 'X'),
  caption: t('grCharts.chart.tableCaption', 'Chart data'),
  formatX,
  formatY: formatPointValue,
}))

const tooltipTitle = computed(() => {
  const point = tooltipApi.active.value

  return point ? formatX({ x: point.x, y: null, sourceIndex: 0, raw: point.raw }) : ''
})

const plotScope = computed<ChartPlotScope>(() => ({
  plot: plot.value,
  xScale: xScale.value,
  yScale: yScale.value,
  data: props.data,
  visibleSeries: visibleSeries.value,
  activeIndex: tooltipApi.activeIndex.value,
  clipPathId,
}))

function onKeydown(event: KeyboardEvent): void {
  if (a11y.onKeydown(event))
    event.preventDefault()
}

function onClick(): void {
  if (tooltipApi.active.value)
    emit('pointClick', tooltipApi.active.value)
}

function toggleSeries(id: string): void {
  const series = props.data.series.find(item => item.id === id)

  emit('legendToggle', { seriesId: id, hidden: !(series?.hidden ?? false) })
}

/**
 * Результат переключения серии объявляется **после того, как он состоялся**.
 *
 * Объявить его прямо в обработчике клика значило бы пообещать за потребителя:
 * `hiddenSeries` — его состояние, и применить наше событие он не обязан.
 */
watch(
  () => props.data.series.map(series => series.hidden),
  (next, previous) => {
    if (!previous)
      return

    const index = next.findIndex((hidden, position) => hidden !== previous[position])
    const series = props.data.series[index]

    if (!series)
      return

    const params = {
      label: series.label,
      shown: next.filter(hidden => !hidden).length,
      total: next.length,
    }

    announce(series.hidden
      ? t('grCharts.legend.hidden', '{label} hidden, {shown} of {total} series shown', params)
      : t('grCharts.legend.shown', '{label} shown, {shown} of {total} series shown', params))
  },
)

// Управляемый курсор: пара графиков синхронизируется через `v-model:activeIndex`.
watch(() => props.activeIndex, (value) => {
  if (value !== undefined && value !== tooltipApi.activeIndex.value)
    tooltipApi.setActive(value)
}, { immediate: true })

watch(tooltipApi.activeIndex, (value) => {
  emit('update:activeIndex', value)
  emit('pointHover', tooltipApi.active.value)
})
</script>

<template>
  <div
    ref="rootEl"
    :class="frameRootClass"
    :aria-busy="loading ? 'true' : undefined"
    data-gr-chart-frame
  >
    <slot name="header" />

    <slot
      v-if="showLegend && legendPosition === 'top'"
      name="legend"
      :series="data.series"
      :toggle="toggleSeries"
    >
      <ChartLegend
        :series="data.series"
        :interactive="interactive"
        :toggle-label="label => t('grCharts.legend.toggle', 'Toggle {label}', { label })"
        @toggle="toggleSeries"
      />
    </slot>

    <div class="relative" :style="{ height: `${height}px` }">
      <!--
        В интерактивном режиме рисунок — декорация: смысл несут оверлей с
        клавиатурой и скрытая таблица. `role="img"` на `<svg>` объявил бы его
        потомков презентационными, и точки перестали бы существовать для
        скринридера — тот же капкан, что у `role="progressbar"` в ядре.
      -->
      <svg
        :class="frameSvgClass"
        :viewBox="`0 0 ${width} ${height}`"
        :width="width"
        :height="height"
        :role="interactive ? undefined : 'img'"
        :aria-hidden="interactive ? 'true' : undefined"
        :aria-label="interactive ? undefined : surfaceLabel"
        focusable="false"
      >
        <defs>
          <!-- id из `useId()`: два графика на странице обрежут друг друга общим id, а SSR разойдётся. -->
          <clipPath :id="clipPathId">
            <rect :x="plot.x" :y="plot.y" :width="plot.width" :height="plot.height" />
          </clipPath>
        </defs>

        <ChartGrid :plot="plot" :x-ticks="xTicks" :y-ticks="yTicks" :show="showAxes ? showGrid : 'none'" />

        <template v-if="showAxes">
          <ChartAxis
            :plot="plot"
            :ticks="yTicks"
            orientation="y"
            :font-size-px="fontSizePx"
            :size-class="labelSizeClass[size]"
            :truncated="layout.truncated"
            :label="t('grCharts.chart.axisY', 'Y axis')"
          />
          <ChartAxis
            :plot="plot"
            :ticks="xTicks"
            orientation="x"
            :font-size-px="fontSizePx"
            :size-class="labelSizeClass[size]"
            :truncated="false"
            :label="t('grCharts.chart.axisX', 'X axis')"
          />
        </template>

        <line
          v-if="tooltipApi.activeIndex.value !== null && !isEmpty"
          data-gr-chart-crosshair
          :x1="xScale.scale(data.positions[tooltipApi.activeIndex.value] ?? 0)"
          :x2="xScale.scale(data.positions[tooltipApi.activeIndex.value] ?? 0)"
          :y1="plot.y"
          :y2="plot.y + plot.height"
          :stroke="crosshairStroke"
          stroke-width="1"
        />

        <g v-if="!isEmpty && !loading">
          <slot name="plot" v-bind="plotScope" />
        </g>
      </svg>

      <!-- Якорь тултипа — HTML-див нулевого размера: `useFloating` типизирован
           `HTMLElement`, а марка графика это `SVGElement`. -->
      <div ref="anchorEl" :style="tooltipApi.anchorStyle.value" aria-hidden="true" />

      <div
        v-if="interactive && !isEmpty"
        ref="surfaceEl"
        :class="frameSurfaceClass"
        data-gr-chart-surface
        role="application"
        tabindex="0"
        :aria-roledescription="roleDescription ?? t('grCharts.chart.roleDescription', 'chart')"
        :aria-label="surfaceLabel"
        :aria-description="ariaDescription"
        @pointermove="tooltipApi.onPointerMove"
        @pointerleave="tooltipApi.onPointerLeave"
        @keydown="onKeydown"
        @click="onClick"
        @blur="tooltipApi.close"
      />

      <!-- Скелет ложится на область построения, а не на весь холст: гуттеры под
           оси уже зарезервированы, и данные придут ровно сюда же. -->
      <div v-if="loading" class="absolute" :style="plotStyle" role="status">
        <GrSkeleton variant="rect" width="100%" height="100%" rounded="var(--gr-radius-sm)" />
        <span class="sr-only">{{ t('grCharts.chart.loading', 'Loading chart') }}</span>
      </div>

      <div v-else-if="isEmpty" :class="frameStateClass">
        <slot name="empty">
          <GrEmptyState variant="ghost" :title="emptyText ?? t('grCharts.chart.empty', 'No data')" />
        </slot>
      </div>
    </div>

    <slot
      v-if="showLegend && legendPosition === 'bottom'"
      name="legend"
      :series="data.series"
      :toggle="toggleSeries"
    >
      <ChartLegend
        :series="data.series"
        :interactive="interactive"
        :toggle-label="label => t('grCharts.legend.toggle', 'Toggle {label}', { label })"
        @toggle="toggleSeries"
      />
    </slot>

    <!-- Панель тултипа обязана быть в DOM до открытия: позиционирование не
         измеряет то, чего нет в дереве. Отсюда `v-show`, а не `v-if`. -->
    <div v-show="tooltipApi.open.value && tooltipApi.active.value" ref="tooltipEl" :style="floatingStyle">
      <template v-if="tooltipApi.active.value">
        <slot name="tooltip" :active="tooltipApi.active.value" :format-value="formatPointValue">
          <ChartTooltip
            :active="tooltipApi.active.value"
            :title="tooltipTitle"
            :format-value="formatPointValue"
          />
        </slot>
      </template>
    </div>

    <ChartDataTable v-if="dataTable !== 'off'" :model="tableModel" :visible="dataTable === 'visible'" />
  </div>
</template>
