<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import { barPath, barRect, groupSlots } from '../../chart/chartBars'
import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatShare } from '../../chart/chartFormat'
import type { Rect } from '../../chart/chartLayout'
import type { GrChartSeries, NormalizedSeries } from '../../chart/chartModel'
import { normalizeChartData, resolveScaleKind } from '../../chart/chartModel'
import type { GrChartReference } from '../../chart/chartReference'
import { referenceDomainValues } from '../../chart/chartReference'
import { type GrChartScale, type GrChartScaleKind, nearestIndex, scaleForAxis } from '../../chart/chartScale'
import type { ChartTickFormat } from '../../composables/useChartTicks'
import type { ChartHitContext, GrChartActivePoint } from '../../composables/useChartTooltip'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'
import {
  barDimOpacity,
  barGapStroke,
  barGapWidth,
  DEFAULT_BAR_RADIUS,
} from './grChartBarStyles'

/**
 * Столбцы: величины по категориям — рядом, стопкой или долями до ста процентов.
 *
 * Ось значений у столбцов **всегда** начинается от нуля: высота полосы это и
 * есть величина, и обрезанная снизу ось врёт о ней в разы. У линии обрезать
 * можно — она показывает изменение, а не величину.
 */

export interface GrChartBarProps {
  /** Серии либо голый ряд чисел — тогда категорией становится порядковый номер. */
  series: readonly GrChartSeries[] | readonly number[]
  /** Тип оси X. Не задан — выводится из данных; для столбцов это обычно категории. */
  xScale?: GrChartScaleKind
  /** `true` — стопка, `'100%'` — стопка с нормировкой столбца к единице. */
  stacked?: boolean | '100%'
  /** Доля ширины слота, уходящая в зазор между сериями внутри категории. */
  groupPadding?: number
  /** Скругление дальнего от базовой линии конца полосы, пиксели. */
  barRadius?: number
  /**
   * Гасить полосы неактивных категорий при наведении.
   *
   * `false` — активная категория ничем не выделяется, о ней говорит только
   * тултип. Это осмысленно там, где график стоит рядом с легендой или таблицей
   * и лишнее движение цвета мешает читать соседей.
   */
  dimInactive?: boolean
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  yDomain?: readonly [number | null, number | null]
  /**
   * Опорные линии и полосы: порог, план, коридор допустимого.
   *
   * Не серия и нигде ею не считается: в легенду не попадает, индекс палитры не
   * тратит, в стек не входит и в скрытую таблицу уезжает примечанием, а не
   * строкой данных.
   */
  references?: readonly GrChartReference[]
  /**
   * Включить опоры в домен оси.
   *
   * По умолчанию нет, и это осознанно: порог `1.0` при данных около `0.03`
   * растянул бы ось так, что сами данные схлопнулись бы в линию.
   */
  includeReferencesInDomain?: boolean
  /**
   * Показывать вторую ось значений справа.
   *
   * Без неё серии с `axis: 'right'` попадают на левую. Включение осознанное:
   * две оси позволяют подогнать любые два ряда под видимую корреляцию, и это
   * должно быть решением автора графика, а не побочным эффектом поля в данных.
   */
  dualAxis?: boolean
  yDomainRight?: readonly [number | null, number | null]
  yTickFormatRight?: (value: number) => string
  valueFormatRight?: GrChartNumberFormat
  xTickCount?: number
  yTickCount?: number
  xTickFormat?: ChartTickFormat
  yTickFormat?: (value: number) => string
  valueFormat?: GrChartNumberFormat
  showGrid?: 'both' | 'x' | 'y' | 'none'
  showLegend?: boolean | 'auto'
  legendPosition?: 'top' | 'bottom'
  tooltip?: boolean
  /** Скрытые серии по id — `v-model:hiddenSeries`. Скрытая серия из стопки выпадает. */
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
}

export interface GrChartBarEmits {
  (e: 'update:hiddenSeries', value: string[]): void
  (e: 'update:activeIndex', value: number | null): void
  (e: 'pointClick', value: GrChartActivePoint): void
  (e: 'pointHover', value: GrChartActivePoint | null): void
  (e: 'legendToggle', value: { seriesId: string, hidden: boolean }): void
}

const props = withDefaults(defineProps<GrChartBarProps>(), {
  xScale: undefined,
  stacked: false,
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  groupPadding: undefined,
  barRadius: undefined,
  dimInactive: undefined,
  height: undefined,
  width: 640,
  yDomain: undefined,
  references: undefined,
  includeReferencesInDomain: false,
  dualAxis: false,
  yDomainRight: undefined,
  yTickFormatRight: undefined,
  valueFormatRight: undefined,
  xTickCount: 6,
  yTickCount: 5,
  xTickFormat: undefined,
  yTickFormat: undefined,
  valueFormat: undefined,
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
})

const emit = defineEmits<GrChartBarEmits>()

defineSlots<{
  tooltip?: (props: { active: GrChartActivePoint, formatValue: (value: number | null) => string }) => unknown
  legend?: (props: { series: readonly NormalizedSeries[], toggle: (id: string) => void }) => unknown
  empty?: () => unknown
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartBar' })
const resolvedHeight = useGrComponentProp('GrChartBar', 'height', () => props.height, 256)
const resolvedRadius = useGrComponentProp('GrChartBar', 'barRadius', () => props.barRadius, DEFAULT_BAR_RADIUS)
const resolvedGroupPadding = useGrComponentProp('GrChartBar', 'groupPadding', () => props.groupPadding, 0.1)
const resolvedDimInactive = useGrComponentProp('GrChartBar', 'dimInactive', () => props.dimInactive, true)
const resolvedGrid = useGrComponentProp('GrChartBar', 'showGrid', () => props.showGrid, 'y' as const)
const resolvedLegendMode = useGrComponentProp('GrChartBar', 'showLegend', () => props.showLegend, 'auto' as const)
const resolvedLegendPosition = useGrComponentProp('GrChartBar', 'legendPosition', () => props.legendPosition, 'bottom' as const)
const resolvedTooltip = useGrComponentProp('GrChartBar', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartBar', 'dataTable', () => props.dataTable, 'hidden' as const)

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')

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

/**
 * Тип оси нужен раньше нормализации: значение опоры (`Date`, ISO-строка, имя
 * категории) без него не разобрать, а разобрать его надо до того, как
 * посчитается домен.
 */
const scaleKind = computed(() => resolveScaleKind(seriesInput.value, props.xScale))

const referenceDomain = computed(() => (
  props.includeReferencesInDomain
    ? referenceDomainValues(props.references ?? [], scaleKind.value)
    : { x: [], y: [] }
))

const data = computed(() => normalizeChartData(seriesInput.value, {
  kind: scaleKind.value,
  // Ноль включается всегда и не спрашивая: столбец, не начинающийся от нуля,
  // врёт о своей величине — и врёт тем сильнее, чем уже диапазон.
  includeZero: true,
  yDomain: props.yDomain,
  stacked: props.stacked,
  includeXValues: referenceDomain.value.x,
  includeYValues: referenceDomain.value.y,
  dualAxis: props.dualAxis,
  yDomainRight: props.yDomainRight,
}))

const isNormalized = computed(() => props.stacked === '100%')

/** В режиме ста процентов ось показывает доли — иначе на ней стояли бы 0,2 и 0,4. */
const yTickFormat = computed(() => (
  props.yTickFormat ?? (isNormalized.value ? (value: number) => formatShare(value, resolvedLocale.value) : undefined)
))

const showLegend = computed(() => (
  resolvedLegendMode.value === 'auto' ? data.value.series.length > 1 : resolvedLegendMode.value === true
))

/**
 * Ширина категории.
 *
 * У непрерывной шкалы её нет вовсе (`bandwidth === 0`), а столбцы по датам —
 * обычное дело: тогда ширина считается от числа позиций. Без этого график по
 * оси времени рисовался бы полосами нулевой ширины, то есть ничем.
 */
function bandOf(xScale: GrChartScale, plot: Rect, count: number): number {
  return xScale.bandwidth > 0 ? xScale.bandwidth : (plot.width / Math.max(1, count)) * 0.8
}

interface BarMark {
  key: string
  d: string
  color: string
  seriesId: string
  dimmed: boolean
}

/**
 * Полосы всех видимых серий одним плоским списком.
 *
 * Скругляется только дальний от базовой линии конец, и в стопке — только у
 * верхнего сегмента столбца: скругли каждый, и стопка распадётся на отдельные
 * пилюли вместо одного целого.
 */
function barMarks(
  series: readonly NormalizedSeries[],
  xScale: GrChartScale,
  yScale: GrChartScale,
  plot: Rect,
  cursor: number | null,
  yScaleRight: GrChartScale | null = null,
): BarMark[] {
  const activeX = cursor === null ? undefined : data.value.positions[cursor]
  const stacked = props.stacked !== false
  const bandwidth = bandOf(xScale, plot, data.value.positions.length)
  const slots = groupSlots(stacked ? 1 : series.length, bandwidth, { groupPadding: resolvedGroupPadding.value })
  const top = topmostAt(series)
  const marks: BarMark[] = []

  series.forEach((item, seriesIndex) => {
    const slot = slots[stacked ? 0 : seriesIndex]

    if (!slot)
      return

    // Шкала и её ноль берутся у одной оси: иначе столбец правой серии встал бы
    // на чужую базовую линию и показал бы величину, которой нет.
    const scale = scaleForAxis(item.axis, yScale, yScaleRight)
    const baseline = Math.min(Math.max(scale.scale(0), plot.y), plot.y + plot.height)

    for (const point of item.points) {
      if (point.y === null)
        continue
      if (stacked && point.stackTop === undefined)
        continue

      const from = stacked ? scale.scale(point.stackBase!) : baseline
      const to = stacked ? scale.scale(point.stackTop!) : scale.scale(point.y)
      // Имя не `rounded`: гейт `styleTokens` ищет утилиту с тем же написанием.
      const withRadius = !stacked || top.get(point.x) === item.id

      marks.push({
        key: `${item.id}-${point.sourceIndex}`,
        d: barPath(barRect(xScale.scale(point.x), slot, from, to), withRadius ? resolvedRadius.value : 0, to <= from ? 'up' : 'down'),
        color: item.style.color,
        seriesId: item.id,
        dimmed: resolvedDimInactive.value && activeX !== undefined && point.x !== activeX,
      })
    }
  })

  return marks
}

/** Кто в каждой категории лежит сверху: только его сегмент получает скругление. */
function topmostAt(series: readonly NormalizedSeries[]): Map<number, string> {
  const top = new Map<number, string>()

  for (const item of series) {
    for (const point of item.points) {
      if (point.y !== null)
        top.set(point.x, item.id)
    }
  }

  return top
}

/**
 * Попадание — в колонку категории, а не «в ближайшую вообще».
 *
 * Дефолт рамы берёт ближайшую позицию по абсциссе, где бы курсор ни стоял: над
 * зазором между категориями, на полях холста, под осью. Для линии это верно —
 * ряд непрерывен, и «ближайшая точка» есть у любой абсциссы. У столбцов между
 * категориями пусто, и тултип там сообщает о том, на что человек не наводился.
 *
 * По вертикали граница — область построения: подписи оси и отступ сверху к
 * данным не относятся. По горизонтали — ширина полосы категории, то есть
 * footprint самих столбцов. Требовать попадания в **конкретный** столбец было
 * бы хуже: тултип показывает всю категорию сразу, а низкую полосу в один
 * процент нельзя было бы навести вовсе — и это ровно то значение, которое чаще
 * всего и хотят прочитать.
 */
function hitTest(point: { x: number, y: number }, context: ChartHitContext): number {
  const { plot, xScale } = context

  if (point.y < plot.y || point.y > plot.y + plot.height)
    return -1

  const positions = data.value.positions
  const index = nearestIndex(positions, xScale, point.x)

  if (index === -1)
    return -1

  const half = bandOf(xScale, plot, positions.length) / 2

  return Math.abs(point.x - xScale.scale(positions[index]!)) <= half ? index : -1
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
    :crosshair="false"
    :hit-test="hitTest"
    :loading="loading"
    :empty="empty"
    :empty-text="emptyText"
    :data-table="resolvedDataTable"
    :interactive="interactive"
    :active-index="activeIndex"
    :locale="locale"
    :aria-label="ariaLabel"
    :aria-description="ariaDescription"
    :role-description="stacked === '100%'
      ? t('grCharts.bar.labelNormalized', 'Stacked bar chart, 100%')
      : stacked
        ? t('grCharts.bar.labelStacked', 'Stacked bar chart')
        : t('grCharts.bar.label', 'Bar chart')"
    :x-tick-count="xTickCount"
    :y-tick-count="yTickCount"
    :x-tick-format="xTickFormat"
    :y-tick-format="yTickFormat"
    :value-format="valueFormat"
    :references="references"
    :y-tick-format-right="yTickFormatRight"
    :value-format-right="valueFormatRight"
    data-gr-chart-bar
    @update:active-index="value => emit('update:activeIndex', value)"
    @point-click="value => emit('pointClick', value)"
    @point-hover="value => emit('pointHover', value)"
    @legend-toggle="onLegendToggle"
  >
    <template #header>
<slot name="header" />
</template>

    <template #plot="{ plot, xScale: sx, yScale: sy, yScaleRight: syr, visibleSeries, activeIndex: cursor, clipPathId }">
      <g :clip-path="`url(#${clipPathId})`" data-gr-chart-bar-body>
        <path
          v-for="mark in barMarks(visibleSeries, sx, sy, plot, cursor, syr)"
          :key="mark.key"
          :data-gr-chart-bar-mark="mark.seriesId"
          :d="mark.d"
          :fill="mark.color"
          :fill-opacity="mark.dimmed ? barDimOpacity : undefined"
          :stroke="stacked !== false ? barGapStroke : 'none'"
          :stroke-width="stacked !== false ? barGapWidth : undefined"
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
