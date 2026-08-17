<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import { barPath, type BarDirection, barRect, groupSlots } from '../../chart/chartBars'
import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatNumber, formatValue } from '../../chart/chartFormat'
import { labelGutters, type Rect } from '../../chart/chartLayout'
import type { GrChartPoint } from '../../chart/chartModel'
import { normalizeChartData } from '../../chart/chartModel'
import { bandScale, type GrChartScale, linearScale, nearestIndex } from '../../chart/chartScale'
import type { ChartTableModel } from '../../chart/chartTable'
import { bandTicks, linearTicks } from '../../chart/chartTicks'
import type { GrChartWaterfallStep, WaterfallSegment } from '../../chart/chartWaterfall'
import { waterfallSegments } from '../../chart/chartWaterfall'
import type { ChartTick } from '../../composables/useChartTicks'
import type { ChartHitContext, GrChartActivePoint } from '../../composables/useChartTooltip'
import ChartAxis from '../GrChartFrame/shared/ChartAxis.vue'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import ChartGrid from '../GrChartFrame/shared/ChartGrid.vue'
import {
  frameTooltipClass,
  frameTooltipRowClass,
  frameTooltipTitleClass,
  frameTooltipValueClass,
  type GrChartSize,
  labelFontPx,
  labelSizeClass,
} from '../GrChartFrame/chartFrameStyles'
import {
  DEFAULT_WATERFALL_BAR_RADIUS,
  waterfallConnectorStroke,
  waterfallConnectorWidth,
  waterfallFallFill,
  waterfallRiseFill,
  waterfallTotalFill,
  waterfallZeroFill,
  waterfallZeroStepWidth,
} from './grChartWaterfallStyles'

/**
 * Мост: как из начала периода получился конец.
 *
 * Расходящиеся столбцы отвечают «сколько пришло и сколько ушло»; мост отвечает
 * «как одно превратилось в другое» — каждый столбец начинается там, где кончился
 * предыдущий. Вся арифметика в `chart/chartWaterfall.ts`, здесь только рисунок.
 *
 * Ось шагов категориальная, но категорией становится **индекс**, а не подпись:
 * две «Корректировки» подряд — обычное дело для моста, а нормализация
 * схлопывает одинаковые категории внутри серии, и курсор после этого адресовал
 * бы чужой шаг. Настоящие подписи приезжают на ось через `xTickFormat`.
 */

export interface GrChartWaterfallActiveStep {
  index: number
  label: string
  value: number
  /** Накопление до и после шага. */
  before: number
  after: number
  kind: 'delta' | 'total'
}

export interface GrChartWaterfallProps {
  steps: readonly GrChartWaterfallStep[]
  /** Начальное накопление. */
  baseline?: number
  /** Дорисовать итоговый столбец справа. Строка задаёт его подпись. */
  showTotal?: boolean | string
  showConnectors?: boolean
  barRadius?: number
  orientation?: 'vertical' | 'horizontal'
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  yDomain?: readonly [number | null, number | null]
  yTickCount?: number
  yTickFormat?: (value: number) => string
  valueFormat?: GrChartNumberFormat
  /** Какая сетка нужна. Оси названы по данным: при горизонтали они меняются местами сами. */
  showGrid?: 'both' | 'x' | 'y' | 'none'
  tooltip?: boolean
  /** Курсор — `v-model:activeIndex`. */
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
}

export interface GrChartWaterfallEmits {
  (e: 'update:activeIndex', value: number | null): void
  (e: 'stepClick', value: GrChartWaterfallActiveStep): void
  (e: 'stepHover', value: GrChartWaterfallActiveStep | null): void
}

const props = withDefaults(defineProps<GrChartWaterfallProps>(), {
  baseline: 0,
  showTotal: false,
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  showConnectors: undefined,
  barRadius: undefined,
  orientation: undefined,
  height: undefined,
  width: 640,
  yDomain: undefined,
  yTickCount: 5,
  yTickFormat: undefined,
  valueFormat: undefined,
  showGrid: undefined,
  tooltip: undefined,
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
})

const emit = defineEmits<GrChartWaterfallEmits>()

defineSlots<{
  tooltip?: (props: {
    active: GrChartActivePoint
    step: GrChartWaterfallActiveStep | null
    formatValue: (value: number | null) => string
  }) => unknown
  empty?: () => unknown
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartWaterfall' })
const resolvedHeight = useGrComponentProp('GrChartWaterfall', 'height', () => props.height, 256)
const resolvedRadius = useGrComponentProp('GrChartWaterfall', 'barRadius', () => props.barRadius, DEFAULT_WATERFALL_BAR_RADIUS)
const resolvedConnectors = useGrComponentProp('GrChartWaterfall', 'showConnectors', () => props.showConnectors, true)
const resolvedOrientation = useGrComponentProp('GrChartWaterfall', 'orientation', () => props.orientation, 'vertical' as const)
const resolvedGrid = useGrComponentProp('GrChartWaterfall', 'showGrid', () => props.showGrid, 'y' as const)
const resolvedTooltip = useGrComponentProp('GrChartWaterfall', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartWaterfall', 'dataTable', () => props.dataTable, 'hidden' as const)

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const isHorizontal = computed(() => resolvedOrientation.value === 'horizontal')

const totalLabel = computed(() => (
  typeof props.showTotal === 'string' ? props.showTotal : t('grCharts.waterfall.total', 'Total')
))

const model = computed(() => waterfallSegments(props.steps, {
  baseline: props.baseline,
  total: props.showTotal === false ? false : { label: totalLabel.value },
}))

const segments = computed(() => model.value.segments)

/**
 * Внутрь рамы мост отдаёт индексы шагов категориями, а не их подписи.
 *
 * Одинаковые подписи в мосте — норма («Корректировка» дважды), а нормализация
 * схлопывает повторы внутри серии: после этого позиций стало бы меньше, чем
 * шагов, и курсор с клавиатурой поехали бы по чужим данным.
 */
const points = computed<GrChartPoint[]>(() => segments.value.map((segment, index) => ({
  x: String(index),
  y: segment.value,
  label: segment.label,
})))

const data = computed(() => normalizeChartData(
  [{ id: 'waterfall', label: t('grCharts.waterfall.roleDescription', 'waterfall chart'), data: points.value }],
  {
    kind: 'band',
    // Ноль в оси всегда: мост, оторванный от нуля, врёт о величинах.
    includeZero: true,
    // Ось обязана вместить основания и вершины столбцов, а не значения шагов:
    // дельта в десять, стоящая на накоплении в тысячу, уходит к тысяче.
    includeYValues: model.value.domain,
    yDomain: props.yDomain,
  },
))

const numberFormat = computed<GrChartNumberFormat>(() => ({ locale: resolvedLocale.value, ...props.valueFormat }))

function formatPointValue(value: number | null): string {
  return formatValue(value, numberFormat.value, t('grCharts.chart.noValue', 'no value'))
}

function formatTick(value: number): string {
  return props.yTickFormat?.(value) ?? formatNumber(value, { locale: resolvedLocale.value })
}

/** Подпись деления оси шагов: индекс категории → настоящее имя шага. */
function stepTickLabel(index: number): string {
  return segments.value[index]?.label ?? String(index)
}

/**
 * Место под собственные подписи при горизонтали.
 *
 * Рама туда идёт с `axes: false`: её ось значений вертикальна по построению, а
 * здесь она внизу. Содержимое нижних подписей на высоту гуттера не влияет —
 * важно лишь то, что строка текста под областью есть.
 */
const gutters = computed(() => (isHorizontal.value
  ? labelGutters({
      leftLabels: segments.value.map(segment => segment.label),
      bottomLabels: ['0'],
      fontSizePx: labelFontPx[resolvedSize.value],
    })
  : { left: 0, bottom: 0, truncated: false }))

/** `showGrid` называет оси по данным; при горизонтали стороны меняются местами. */
const horizontalGrid = computed<'both' | 'x' | 'y' | 'none'>(() => {
  const grid = resolvedGrid.value

  if (grid === 'both' || grid === 'none')
    return grid

  return grid === 'y' ? 'x' : 'y'
})

interface WaterfallGeometry {
  /** Шкала значений: у вертикали это ось рамы, у горизонтали — своя. */
  value: GrChartScale
  /** Шкала шагов. */
  category: GrChartScale
  /** Область под марки за вычетом собственных гуттеров. */
  area: Rect
}

/**
 * Одна точка, из которой берут систему координат марки, попадание и якорь
 * тултипа: разъедься они — и тултип встанет не на тот столбец.
 *
 * Домен значений при горизонтали берётся у шкалы рамы: он уже расширен до
 * «красивых» границ, и посчитанный заново разошёлся бы с ней на округлении.
 */
function geometryOf(plot: Rect, xScale: GrChartScale, yScale: GrChartScale): WaterfallGeometry {
  if (!isHorizontal.value)
    return { value: yScale, category: xScale, area: plot }

  const area = {
    x: plot.x + gutters.value.left,
    y: plot.y,
    width: Math.max(0, plot.width - gutters.value.left),
    height: Math.max(0, plot.height - gutters.value.bottom),
  }

  return {
    value: linearScale(yScale.domain, [area.x, area.x + area.width]),
    category: bandScale(segments.value.length, [area.y, area.y + area.height]),
    area,
  }
}

interface BarMark {
  index: number
  d: string
  fill: string
}

interface LineMark {
  index: number
  x1: number
  y1: number
  x2: number
  y2: number
  stroke: string
  width: string
}

/**
 * Цвет по знаку шага, а не по индексу серии: мост это один ряд, и различать в
 * нём надо прибавление и убавление. Явный цвет шага сильнее.
 */
function fillOf(segment: WaterfallSegment): string {
  const own = props.steps[segment.index]?.color

  if (own !== undefined)
    return own
  if (segment.kind === 'total')
    return waterfallTotalFill
  if (segment.sign === 0)
    return waterfallZeroFill

  return segment.sign > 0 ? waterfallRiseFill : waterfallFallFill
}

function slotAt(geometry: WaterfallGeometry) {
  return groupSlots(1, geometry.category.bandwidth)[0] ?? { offset: 0, width: 0 }
}

function barMarks(geometry: WaterfallGeometry): BarMark[] {
  const slot = slotAt(geometry)

  return segments.value.flatMap((segment) => {
    if (segment.sign === 0)
      return []

    const center = geometry.category.scale(segment.index)
    const from = geometry.value.scale(segment.from)
    const to = geometry.value.scale(segment.to)

    const rect = isHorizontal.value
      ? {
          x: Math.min(from, to),
          y: center - slot.width / 2,
          width: Math.abs(to - from),
          height: slot.width,
        }
      : barRect(center, slot, from, to)

    // Скругляется дальний от основания конец: в пикселях он там, куда шаг вырос.
    const toward: BarDirection = isHorizontal.value
      ? (to >= from ? 'right' : 'left')
      : (to <= from ? 'up' : 'down')

    return [{ index: segment.index, d: barPath(rect, resolvedRadius.value, toward), fill: fillOf(segment) }]
  })
}

/**
 * Нулевой шаг — черта на уровне накопления, а не пустота.
 *
 * «Движения не было» — это факт, и пропасть он не должен: пустое место читается
 * как «шага нет», то есть как другая история.
 */
function zeroMarks(geometry: WaterfallGeometry): LineMark[] {
  const slot = slotAt(geometry)

  return segments.value.filter(segment => segment.sign === 0).map((segment) => {
    const center = geometry.category.scale(segment.index)
    const level = geometry.value.scale(segment.to)
    const half = slot.width / 2

    return {
      index: segment.index,
      x1: isHorizontal.value ? level : center - half,
      y1: isHorizontal.value ? center - half : level,
      x2: isHorizontal.value ? level : center + half,
      y2: isHorizontal.value ? center + half : level,
      stroke: fillOf(segment),
      width: waterfallZeroStepWidth,
    }
  })
}

/** Соединитель от вершины предыдущего столбца к основанию следующего. */
function connectorMarks(geometry: WaterfallGeometry): LineMark[] {
  if (!resolvedConnectors.value)
    return []

  const slot = slotAt(geometry)
  const half = slot.width / 2

  return segments.value.flatMap((segment) => {
    if (segment.connector === null)
      return []

    const level = geometry.value.scale(segment.connector)
    const from = geometry.category.scale(segment.index)
    const to = geometry.category.scale(segment.index + 1)

    return [{
      index: segment.index,
      x1: isHorizontal.value ? level : from - half,
      y1: isHorizontal.value ? from - half : level,
      x2: isHorizontal.value ? level : to + half,
      y2: isHorizontal.value ? to + half : level,
      stroke: waterfallConnectorStroke,
      width: waterfallConnectorWidth,
    }]
  })
}

function valueTicks(geometry: WaterfallGeometry): ChartTick[] {
  return linearTicks(geometry.value.domain, props.yTickCount).values.map(value => ({
    value,
    position: geometry.value.scale(value),
    label: formatTick(value),
  }))
}

function stepTicks(geometry: WaterfallGeometry): ChartTick[] {
  return bandTicks(segments.value.length, 12).map(index => ({
    value: index,
    position: geometry.category.scale(index),
    label: stepTickLabel(index),
  }))
}

/**
 * Попадание считается в своей системе координат.
 *
 * Декартово правило рамы смотрит на абсциссу, а при горизонтали шаги идут по
 * ординате — оно отвечало бы верно только случайно.
 */
function hitTest(point: { x: number, y: number }, context: ChartHitContext): number {
  const geometry = geometryOf(context.plot, context.xScale, context.yScale)
  const along = isHorizontal.value ? point.y : point.x
  const across = isHorizontal.value ? point.x : point.y
  const box = geometry.area
  const min = isHorizontal.value ? box.x : box.y
  const max = isHorizontal.value ? box.x + box.width : box.y + box.height

  if (across < min || across > max)
    return -1

  const index = nearestIndex(data.value.positions, geometry.category, along)

  if (index === -1)
    return -1

  return Math.abs(along - geometry.category.scale(index)) <= geometry.category.bandwidth / 2 ? index : -1
}

function anchorPoint(index: number, context: ChartHitContext): { x: number, y: number } | null {
  const segment = segments.value[index]

  if (!segment)
    return null

  const geometry = geometryOf(context.plot, context.xScale, context.yScale)
  const center = geometry.category.scale(index)
  // Якорь садится на вершину столбца, а не на его значение: у моста это разные
  // числа, и панель уехала бы внутрь полосы.
  const tip = geometry.value.scale(segment.to >= segment.from ? segment.to : segment.from)

  return isHorizontal.value ? { x: tip, y: center } : { x: center, y: tip }
}

function describePoint(index: number): string {
  const segment = segments.value[index]

  if (!segment)
    return ''

  return t('grCharts.waterfall.point', '{label}: {value}, running total {after}', {
    label: segment.label,
    value: formatPointValue(segment.value),
    after: formatPointValue(segment.after),
  })
}

/**
 * Таблица моста — три колонки значений, а не одна.
 *
 * По одной дельте мост не восстановить: читающий без зрения обязан видеть то же,
 * что видит зрячий по высоте столбца, — накопление до и после шага.
 */
const tableModel = computed<ChartTableModel>(() => ({
  caption: t('grCharts.waterfall.tableCaption', 'Chart data'),
  columns: [
    { key: 'step', label: t('grCharts.waterfall.columnStep', 'Step') },
    { key: 'value', label: t('grCharts.waterfall.columnValue', 'Change') },
    { key: 'before', label: t('grCharts.waterfall.columnBefore', 'Running total before') },
    { key: 'after', label: t('grCharts.waterfall.columnAfter', 'Running total after') },
  ],
  rows: segments.value.map(segment => ({
    header: segment.label,
    cells: [
      formatPointValue(segment.value),
      formatPointValue(segment.before),
      formatPointValue(segment.after),
    ],
  })),
}))

const surfaceLabel = computed(() => {
  if (props.ariaLabel)
    return props.ariaLabel

  const label = t('grCharts.waterfall.summary', 'Waterfall chart, {steps} steps, total {total}', {
    steps: segments.value.length,
    total: formatPointValue(model.value.total),
  })

  return `${label}. ${t('grCharts.waterfall.keyboardHint', 'Use arrow keys to browse steps')}`
})

function stepAt(index: number | null): GrChartWaterfallActiveStep | null {
  const segment = index === null ? undefined : segments.value[index]

  if (!segment)
    return null

  return {
    index: segment.index,
    label: segment.label,
    value: segment.value,
    before: segment.before,
    after: segment.after,
    kind: segment.kind,
  }
}

function onPointClick(point: GrChartActivePoint): void {
  const step = stepAt(point.index)

  if (step)
    emit('stepClick', step)
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
    :axes="!isHorizontal"
    :show-grid="isHorizontal ? 'none' : resolvedGrid"
    :crosshair="false"
    :tooltip="resolvedTooltip"
    :loading="loading"
    :empty="empty"
    :empty-text="emptyText"
    :data-table="resolvedDataTable"
    :interactive="interactive"
    :active-index="activeIndex"
    :locale="locale"
    :aria-label="surfaceLabel"
    :aria-description="ariaDescription"
    :role-description="t('grCharts.waterfall.roleDescription', 'waterfall chart')"
    :y-tick-count="yTickCount"
    :x-tick-format="stepTickLabel"
    :y-tick-format="formatTick"
    :value-format="valueFormat"
    :hit-test="hitTest"
    :anchor-point="anchorPoint"
    :table-model="tableModel"
    :describe-point="describePoint"
    data-gr-chart-waterfall
    @update:active-index="value => emit('update:activeIndex', value)"
    @point-click="onPointClick"
    @point-hover="value => emit('stepHover', stepAt(value?.index ?? null))"
  >
    <template #header>
      <slot name="header" />
    </template>

    <template #plot="{ plot, xScale: sx, yScale: sy }">
      <template v-for="geometry in [geometryOf(plot, sx, sy)]" :key="geometry.area.width">
        <template v-if="isHorizontal">
          <ChartGrid
            :plot="geometry.area"
            :x-ticks="valueTicks(geometry)"
            :y-ticks="[]"
            :show="horizontalGrid"
          />
          <ChartAxis
            :plot="geometry.area"
            :ticks="stepTicks(geometry)"
            orientation="y"
            :font-size-px="labelFontPx[resolvedSize]"
            :size-class="labelSizeClass[resolvedSize]"
            :truncated="gutters.truncated"
            :label="t('grCharts.chart.axisY', 'Y axis')"
          />
          <ChartAxis
            :plot="geometry.area"
            :ticks="valueTicks(geometry)"
            orientation="x"
            :font-size-px="labelFontPx[resolvedSize]"
            :size-class="labelSizeClass[resolvedSize]"
            :truncated="false"
            :label="t('grCharts.chart.axisX', 'X axis')"
          />
        </template>

        <!--
          Соединители под столбцами: они показывают преемственность накопления,
          а не величину, и спорить с полосами им нечем.
        -->
        <g data-gr-chart-waterfall-connectors>
          <line
            v-for="mark in connectorMarks(geometry)"
            :key="mark.index"
            :data-gr-chart-waterfall-connector="mark.index"
            :x1="mark.x1"
            :y1="mark.y1"
            :x2="mark.x2"
            :y2="mark.y2"
            fill="none"
            :stroke="mark.stroke"
            :stroke-width="mark.width"
          />
        </g>

        <g data-gr-chart-waterfall-body>
          <path
            v-for="mark in barMarks(geometry)"
            :key="mark.index"
            :data-gr-chart-waterfall-step="mark.index"
            :d="mark.d"
            :fill="mark.fill"
            stroke="none"
          />

          <line
            v-for="mark in zeroMarks(geometry)"
            :key="mark.index"
            :data-gr-chart-waterfall-zero="mark.index"
            :x1="mark.x1"
            :y1="mark.y1"
            :x2="mark.x2"
            :y2="mark.y2"
            fill="none"
            :stroke="mark.stroke"
            :stroke-width="mark.width"
            stroke-linecap="round"
          />
        </g>
      </template>
    </template>

    <template #tooltip="scope">
      <slot name="tooltip" v-bind="scope" :step="stepAt(scope.active.index)">
        <div :class="frameTooltipClass">
          <template v-for="step in [stepAt(scope.active.index)]" :key="step?.index ?? -1">
            <div v-if="step" :class="frameTooltipTitleClass">
              {{ step.label }}
            </div>
            <div v-if="step" :class="frameTooltipRowClass">
              <span>{{ formatPointValue(step.value) }}</span>
              <span :class="frameTooltipValueClass">{{ formatPointValue(step.after) }}</span>
            </div>
          </template>
        </div>
      </slot>
    </template>

    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
  </ChartFrame>
</template>
