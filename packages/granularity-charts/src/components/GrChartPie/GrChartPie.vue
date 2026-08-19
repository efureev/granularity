<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref, useId } from 'vue'

import { arcCentroid, arcPath, type PieSlice, pieSlices, polarPoint, sliceAtPoint } from '../../chart/chartArc'
import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatShare, formatValue } from '../../chart/chartFormat'
import type { Rect } from '../../chart/chartLayout'
import type { GrChartPoint } from '../../chart/chartModel'
import { normalizeChartData } from '../../chart/chartModel'
import { seriesStyle } from '../../chart/chartSeriesStyle'
import type { ChartTableModel } from '../../chart/chartTable'
import type { ChartHitContext, GrChartActivePoint } from '../../composables/useChartTooltip'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import {
  frameTooltipClass,
  frameTooltipRowClass,
  frameTooltipTitleClass,
  frameTooltipValueClass,
  type GrChartSize,
} from '../GrChartFrame/chartFrameStyles'
import {
  ACTIVE_GROW,
  DONUT_RATIO,
  type GrChartPieTexture,
  LABEL_CHAR_EM,
  LABEL_MIN_SHARE,
  LEADER_GAP_EM,
  LEADER_LENGTH_EM,
  PIE_INSET,
  pieDimOpacity,
  pieGapStroke,
  pieGapWidth,
  pieLabelFontPx,
  pieLabelFill,
  pieLeaderStroke,
  pieLegendClass,
  pieLegendItemClass,
  pieLegendSwatchClass,
  pieLegendValueClass,
  pieTextureFor,
  pieTexturePaths,
  pieTextureStroke,
  pieTotalFill,
  pieTotalLabelFill,
  TEXTURE_OPACITY,
  TEXTURE_TILE,
  TEXTURE_WIDTH,
  TOTAL_LABEL_RATIO,
  TOTAL_VALUE_RATIO,
} from './grChartPieStyles'

/**
 * Круговая диаграмма: доли одного целого — сектором или кольцом.
 *
 * Живёт на общей раме, но система координат у неё полярная, и три вещи рама
 * получает от круга: попадание указателя (угловое, а не по абсциссе), якорь
 * тултипа (центроид доли) и строку скрытой таблицы (доля, а не значение по X).
 * Осей и сетки у круга нет, вертикали под активной точкой — тоже.
 */

export interface GrChartPieSlice {
  label: string
  /** `null`, ноль и отрицательное значение доли не дают: круг рисует только положительное. */
  value: number | null
  /** Свой цвет вместо палитры. Заданный цвет отменяет текстуру: выбор потребителя сильнее. */
  color?: string
  meta?: unknown
}

export interface PieEntry {
  index: number
  label: string
  value: number | null
  color: string
  texture: GrChartPieTexture
  share: number | null
  slice: PieSlice | null
}

export interface GrChartPieActiveSlice {
  index: number
  label: string
  value: number | null
  /** Доля от суммы, 0…1. `null` — доля не нарисована. */
  share: number | null
  color: string
}

export interface GrChartPieProps {
  /** Доли либо голый ряд чисел — тогда подписью становится порядковый номер. */
  data: readonly GrChartPieSlice[] | readonly (number | null)[]
  variant?: 'pie' | 'donut'
  /** Радиус дырки бублика долей внешнего радиуса. */
  donutRatio?: number
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  /** Угол первой доли в градусах от двенадцати часов, по часовой. */
  startAngle?: number
  /** Подписи снаружи кольца. `share` — проценты, `value` — значения. */
  labels?: 'none' | 'share' | 'value'
  /** Наименьшая доля, которую подписывают: на трёх процентах подпись перекроет соседнюю. */
  labelMinShare?: number
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom'
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
  valueFormat?: GrChartNumberFormat
  locale?: string
  /** Подпись под итогом в середине бублика. */
  totalLabel?: string
  ariaLabel?: string
  ariaDescription?: string
  /**
   * Потолок строк скрытой таблицы данных.
   *
   * `'auto'` (по умолчанию) — столько строк, сколько можно прочитать; выше
   * потолка таблица идёт равномерной выборкой и говорит об этом пометкой, а
   * поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок,
   * `Infinity` снимает его совсем, `dataTable: 'off'` убирает таблицу целиком —
   * что из этого нужно, решает приложение.
   */
  dataTableMaxRows?: number | 'auto'
}

export interface GrChartPieEmits {
  (e: 'update:activeIndex', value: number | null): void
  (e: 'sliceClick', value: GrChartPieActiveSlice): void
  (e: 'sliceHover', value: GrChartPieActiveSlice | null): void
}

const props = withDefaults(defineProps<GrChartPieProps>(), {
  variant: undefined,
  donutRatio: undefined,
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  height: undefined,
  width: 640,
  startAngle: 0,
  labels: undefined,
  labelMinShare: LABEL_MIN_SHARE,
  showLegend: undefined,
  legendPosition: undefined,
  tooltip: undefined,
  activeIndex: undefined,
  loading: false,
  empty: undefined,
  emptyText: undefined,
  dataTable: undefined,
  interactive: true,
  size: undefined,
  valueFormat: undefined,
  locale: undefined,
  totalLabel: undefined,
  ariaLabel: undefined,
  ariaDescription: undefined,
  dataTableMaxRows: undefined,
})

const emit = defineEmits<GrChartPieEmits>()

defineSlots<{
  /** Середина бублика. Содержимое — SVG: оно рисуется внутри холста. */
  center?: (props: { total: number, formattedTotal: string }) => unknown
  tooltip?: (props: {
    active: GrChartActivePoint
    slice: GrChartPieActiveSlice | null
    formatValue: (value: number | null) => string
  }) => unknown
  legend?: (props: { slices: readonly PieEntry[], formatValue: (value: number | null) => string }) => unknown
  empty?: () => unknown
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartPie' })
const resolvedHeight = useGrComponentProp('GrChartPie', 'height', () => props.height, 256)
const resolvedVariant = useGrComponentProp('GrChartPie', 'variant', () => props.variant, 'pie' as const)
const resolvedDonutRatio = useGrComponentProp('GrChartPie', 'donutRatio', () => props.donutRatio, DONUT_RATIO)
const resolvedLabels = useGrComponentProp('GrChartPie', 'labels', () => props.labels, 'none' as const)
const resolvedLegend = useGrComponentProp('GrChartPie', 'showLegend', () => props.showLegend, true)
const resolvedLegendPosition = useGrComponentProp('GrChartPie', 'legendPosition', () => props.legendPosition, 'bottom' as const)
const resolvedTooltip = useGrComponentProp('GrChartPie', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartPie', 'dataTable', () => props.dataTable, 'hidden' as const)
const resolvedTableMaxRows = useGrComponentProp('GrChartPie', 'dataTableMaxRows', () => props.dataTableMaxRows, 'auto' as number | 'auto')

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')

/** Свой id, а не `clipPathId` рамы: два круга на странице поделили бы текстуры. */
const patternBase = `gr-chart-pie-${useId()}`

const inputSlices = computed<GrChartPieSlice[]>(() => {
  const input = props.data

  // Вид входа решает первый непустой элемент: ряд вполне может начинаться с
  // пропуска, и по `input[0]` голый ряд чисел неотличим от списка долей.
  const sample = input.find(item => item !== null && item !== undefined)

  if (sample === undefined || typeof sample !== 'object') {
    return (input as readonly (number | null)[]).map((value, index) => ({
      label: String(index + 1),
      value,
    }))
  }

  return [...(input as readonly GrChartPieSlice[])]
})

/**
 * Внутрь рамы круг отдаёт линейный ряд, а не категориальный.
 *
 * У категориальной оси подписи проходят через дедупликацию по имени, и две доли
 * с одинаковым названием слиплись бы в одну позицию — после чего индекс доли
 * перестал бы совпадать с индексом позиции, по которому ходят курсор и
 * клавиатура. Абсцисса здесь всё равно ничего не значит: подпись живёт на самой
 * точке.
 */
const points = computed<GrChartPoint[]>(() => inputSlices.value.map((slice, index) => ({
  x: index,
  y: slice.value ?? null,
  label: slice.label,
})))

const frameData = computed(() => normalizeChartData(
  [{ id: 'pie', label: t('grCharts.pie.label', 'Pie chart'), data: points.value }],
  { kind: 'linear', sort: false },
))

const slices = computed(() => pieSlices(
  points.value.map(point => point.y),
  { startAngle: (props.startAngle * Math.PI) / 180 },
))

const entries = computed<PieEntry[]>(() => {
  const byIndex = new Map(slices.value.map(slice => [slice.sourceIndex, slice]))

  return inputSlices.value.map((item, index) => {
    const slice = byIndex.get(index) ?? null

    return {
      index,
      label: item.label,
      value: item.value ?? null,
      color: seriesStyle(index, { color: item.color }).color,
      texture: item.color ? 'solid' : pieTextureFor(index),
      share: slice?.share ?? null,
      slice,
    }
  })
})

const drawn = computed(() => entries.value.filter(entry => entry.slice !== null))
const textured = computed(() => drawn.value.filter(entry => entry.texture !== 'solid'))

const total = computed(() => slices.value.reduce((sum, slice) => sum + slice.value, 0))

/** Пусто не только «нет данных», но и «нечего рисовать»: круг из нулей — тот же пустой холст. */
const isEmpty = computed(() => props.empty ?? slices.value.length === 0)

const numberFormat = computed<GrChartNumberFormat>(() => ({
  locale: resolvedLocale.value,
  ...props.valueFormat,
}))

function formatPointValue(value: number | null): string {
  return formatValue(value, numberFormat.value, t('grCharts.chart.noValue', 'no value'))
}

function formatEntryShare(entry: Pick<PieEntry, 'share'>): string {
  return entry.share === null ? '—' : formatShare(entry.share, resolvedLocale.value)
}

const formattedTotal = computed(() => formatPointValue(total.value))
const labelFontSize = computed(() => pieLabelFontPx[resolvedSize.value])

const showLabels = computed(() => resolvedLabels.value !== 'none')

function labelTextOf(entry: PieEntry): string {
  return resolvedLabels.value === 'value' ? formatPointValue(entry.value) : formatEntryShare(entry)
}

/**
 * Место, которое подписи забирают у радиуса, считается по самой длинной из них.
 *
 * Замерить текст нечем — `getBBox` нет в jsdom и он форсирует reflow в браузере
 * (докблок `chart/chartLayout.ts`), — поэтому ширина оценивается по числу знаков.
 */
const labelGutter = computed(() => {
  if (!showLabels.value)
    return { x: 0, y: 0 }

  const longest = drawn.value.reduce((max, entry) => Math.max(max, labelTextOf(entry).length), 0)
  const font = labelFontSize.value

  return {
    x: font * (LEADER_LENGTH_EM + LEADER_GAP_EM + LABEL_CHAR_EM * longest),
    y: font * 2,
  }
})

interface PieGeometry {
  cx: number
  cy: number
  outer: number
  inner: number
}

function geometryOf(plot: Rect): PieGeometry {
  const gutter = labelGutter.value
  const outer = Math.max(
    0,
    Math.min(plot.width - gutter.x * 2, plot.height - gutter.y * 2) / 2 - PIE_INSET - ACTIVE_GROW,
  )

  return {
    cx: plot.x + plot.width / 2,
    cy: plot.y + plot.height / 2,
    outer,
    inner: resolvedVariant.value === 'donut' ? outer * resolvedDonutRatio.value : 0,
  }
}

/**
 * Попадание у круга угловое: декартово правило рамы ответило бы верно только
 * случайно. Возвращается **индекс входа**, а не порядок в раскладке — по нему
 * ходят курсор, клавиатура и таблица.
 */
function hitTest(point: { x: number, y: number }, context: ChartHitContext): number {
  const geometry = geometryOf(context.plot)
  // Радиус попадания — выросший, и для всех долей сразу: см. `ACTIVE_GROW`.
  const found = sliceAtPoint(
    slices.value,
    geometry.cx,
    geometry.cy,
    geometry.outer + ACTIVE_GROW,
    geometry.inner,
    point.x,
    point.y,
  )

  return found === -1 ? -1 : slices.value[found]!.sourceIndex
}

function anchorPoint(index: number, context: ChartHitContext): { x: number, y: number } | null {
  const entry = entries.value[index]

  if (!entry?.slice)
    return null

  const geometry = geometryOf(context.plot)

  return arcCentroid(
    geometry.cx,
    geometry.cy,
    geometry.outer,
    geometry.inner,
    entry.slice.startAngle,
    entry.slice.endAngle,
  )
}

function describePoint(index: number): string {
  const entry = entries.value[index]

  if (!entry)
    return ''

  const value = formatPointValue(entry.value)

  return entry.share === null
    ? t('grCharts.pie.sliceValue', '{label}: {value}', { label: entry.label, value })
    : t('grCharts.pie.slice', '{label}: {value}, {share}', {
        label: entry.label,
        value,
        share: formatEntryShare(entry),
      })
}

/**
 * Таблица круга — доли, а не ряд по оси.
 *
 * Доли, которых на рисунке нет (пропуск, ноль, отрицательное значение), из
 * таблицы **не выбрасываются**: значение потребитель передал, и промолчать о
 * нём значило бы показать читающему без зрения другие данные. Вместо доли у
 * такой строки прочерк — ровно то же, что видит зрячий сосед.
 */
const tableModel = computed<ChartTableModel>(() => ({
  caption: t('grCharts.pie.tableCaption', 'Chart data'),
  columns: [
    { key: 'label', label: t('grCharts.pie.columnLabel', 'Category') },
    { key: 'value', label: t('grCharts.pie.columnValue', 'Value') },
    { key: 'share', label: t('grCharts.pie.columnShare', 'Share') },
  ],
  rows: entries.value.map(entry => ({
    header: entry.label,
    cells: [formatPointValue(entry.value), formatEntryShare(entry)],
  })),
}))

const surfaceLabel = computed(() => {
  if (props.ariaLabel)
    return props.ariaLabel

  const label = t('grCharts.pie.summary', 'Pie chart, {count} slices, total {total}', {
    count: drawn.value.length,
    total: formattedTotal.value,
  })

  return `${label}. ${t('grCharts.pie.keyboardHint', 'Use arrow keys to browse slices')}`
})

interface ArcMark {
  index: number
  d: string
  fill: string
  dimmed: boolean
  active: boolean
}

function arcMarks(plot: Rect, cursor: number | null): ArcMark[] {
  const geometry = geometryOf(plot)

  return drawn.value.map((entry) => {
    const slice = entry.slice!
    const active = cursor === entry.index

    return {
      index: entry.index,
      d: arcPath(
        geometry.cx,
        geometry.cy,
        geometry.outer + (active ? ACTIVE_GROW : 0),
        geometry.inner,
        slice.startAngle,
        slice.endAngle,
      ),
      fill: entry.texture === 'solid' ? entry.color : `url(#${patternBase}-${entry.index})`,
      dimmed: cursor !== null && !active,
      active,
    }
  })
}

interface LabelMark {
  index: number
  leader: string
  x: number
  y: number
  anchor: 'start' | 'end'
  text: string
}

function labelMarks(plot: Rect): LabelMark[] {
  if (!showLabels.value)
    return []

  const geometry = geometryOf(plot)
  const font = labelFontSize.value

  return drawn.value
    .filter(entry => (entry.share ?? 0) >= props.labelMinShare)
    .map((entry) => {
      const slice = entry.slice!
      const angle = (slice.startAngle + slice.endAngle) / 2
      const from = polarPoint(geometry.cx, geometry.cy, geometry.outer, angle)
      const to = polarPoint(geometry.cx, geometry.cy, geometry.outer + font * LEADER_LENGTH_EM, angle)
      // Сторона решается синусом угла: справа подпись растёт вправо, слева — влево.
      const toRight = Math.sin(angle) >= 0
      const gap = font * LEADER_GAP_EM

      return {
        index: entry.index,
        leader: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
        x: to.x + (toRight ? gap : -gap),
        y: to.y,
        anchor: toRight ? 'start' as const : 'end' as const,
        text: labelTextOf(entry),
      }
    })
}

interface CenterMark {
  cx: number
  cy: number
  valueFont: number
  labelFont: number
}

/** Список из нуля или одной метки: шаблону негде объявить локальную переменную. */
function centerMarks(plot: Rect): CenterMark[] {
  if (resolvedVariant.value !== 'donut')
    return []

  const geometry = geometryOf(plot)

  return [{
    cx: geometry.cx,
    cy: geometry.cy,
    // Кегль от дырки, а не от размера компонента: иначе итог либо теряется в
    // большом бублике, либо не влезает в маленький.
    valueFont: clamp(geometry.inner * TOTAL_VALUE_RATIO, 12, 32),
    labelFont: clamp(geometry.inner * TOTAL_LABEL_RATIO, 9, 14),
  }]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function onPointClick(point: GrChartActivePoint): void {
  const slice = sliceAt(point.index)

  if (slice)
    emit('sliceClick', slice)
}

function sliceAt(index: number | null): GrChartPieActiveSlice | null {
  const entry = index === null ? undefined : entries.value[index]

  if (!entry)
    return null

  return { index: entry.index, label: entry.label, value: entry.value, share: entry.share, color: entry.color }
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
    :data="frameData"
    :height="resolvedHeight"
    :width="width"
    :size="resolvedSize"
    :axes="false"
    show-grid="none"
    :crosshair="false"
    :show-legend="resolvedLegend"
    :legend-position="resolvedLegendPosition"
    :tooltip="resolvedTooltip"
    :loading="loading"
    :empty="isEmpty"
    :empty-text="emptyText"
    :data-table="resolvedDataTable"
    :data-table-max-rows="resolvedTableMaxRows"
    :interactive="interactive"
    :active-index="activeIndex"
    :locale="locale"
    :aria-label="surfaceLabel"
    :aria-description="ariaDescription"
    :role-description="resolvedVariant === 'donut'
      ? t('grCharts.pie.roleDescriptionDonut', 'donut chart')
      : t('grCharts.pie.roleDescription', 'pie chart')"
    :value-format="valueFormat"
    :hit-test="hitTest"
    :anchor-point="anchorPoint"
    :table-model="tableModel"
    :describe-point="describePoint"
    data-gr-chart-pie
    @update:active-index="value => emit('update:activeIndex', value)"
    @point-click="onPointClick"
    @point-hover="value => emit('sliceHover', sliceAt(value?.index ?? null))"
  >
    <template #header>
<slot name="header" />
</template>

    <template #plot="{ plot, activeIndex: cursor }">
      <defs>
        <!-- Текстура второго круга палитры: плитка красится цветом доли, поверх идёт штриховка фоном. -->
        <pattern
          v-for="entry in textured"
          :id="`${patternBase}-${entry.index}`"
          :key="entry.index"
          :width="TEXTURE_TILE"
          :height="TEXTURE_TILE"
          patternUnits="userSpaceOnUse"
        >
          <rect :width="TEXTURE_TILE" :height="TEXTURE_TILE" :fill="entry.color" />
          <path
            v-for="(d, position) in pieTexturePaths(entry.texture)"
            :key="position"
            :d="d"
            fill="none"
            :stroke="pieTextureStroke"
            :stroke-width="TEXTURE_WIDTH"
            :stroke-opacity="TEXTURE_OPACITY"
          />
        </pattern>
      </defs>

      <g data-gr-chart-pie-body>
        <path
          v-for="mark in arcMarks(plot, cursor)"
          :key="mark.index"
          :data-gr-chart-pie-slice="mark.index"
          :d="mark.d"
          :fill="mark.fill"
          :fill-opacity="mark.dimmed ? pieDimOpacity : undefined"
          :stroke="pieGapStroke"
          :stroke-width="pieGapWidth"
          stroke-linejoin="round"
        />

        <template v-for="mark in labelMarks(plot)" :key="mark.index">
          <path :d="mark.leader" fill="none" :stroke="pieLeaderStroke" stroke-width="1" />
          <text
            :x="mark.x"
            :y="mark.y"
            :fill="pieLabelFill"
            :font-size="labelFontSize"
            :text-anchor="mark.anchor"
            dominant-baseline="middle"
          >
{{ mark.text }}
</text>
        </template>

        <g v-for="center in centerMarks(plot)" :key="center.valueFont" data-gr-chart-pie-center>
          <slot name="center" :total="total" :formatted-total="formattedTotal">
            <text
              :x="center.cx"
              :y="center.cy - center.labelFont * 0.5"
              :fill="pieTotalFill"
              :font-size="center.valueFont"
              font-weight="600"
              text-anchor="middle"
              dominant-baseline="middle"
            >
{{ formattedTotal }}
</text>
            <text
              :x="center.cx"
              :y="center.cy + center.valueFont * 0.55"
              :fill="pieTotalLabelFill"
              :font-size="center.labelFont"
              text-anchor="middle"
              dominant-baseline="middle"
            >
{{ totalLabel ?? t('grCharts.pie.total', 'Total') }}
</text>
          </slot>
        </g>
      </g>
    </template>

    <template #tooltip="scope">
      <slot name="tooltip" v-bind="scope" :slice="sliceAt(scope.active.index)">
        <div :class="frameTooltipClass">
          <template v-for="slice in [sliceAt(scope.active.index)]" :key="slice?.index ?? -1">
            <div v-if="slice" :class="frameTooltipTitleClass">
{{ slice.label }}
</div>
            <div v-if="slice" :class="frameTooltipRowClass">
              <svg :class="pieLegendSwatchClass" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                <rect width="12" height="12" rx="2" :fill="slice.color" />
              </svg>
              <span>{{ formatPointValue(slice.value) }}</span>
              <span :class="frameTooltipValueClass">{{ formatEntryShare(slice) }}</span>
            </div>
          </template>
        </div>
      </slot>
    </template>

    <!--
      Легенда круга — ключ, а не переключатель.
      Спрятать долю значило бы молча пересчитать проценты остальных: читатель
      увидел бы цифры, которых в его данных нет. Ряд линейного графика так
      прятать можно — доля целого нет.
    -->
    <template #legend>
      <slot name="legend" :slices="entries" :format-value="formatPointValue">
        <ul :class="pieLegendClass" data-gr-chart-pie-legend>
          <li v-for="entry in entries" :key="entry.index" :class="pieLegendItemClass">
            <svg :class="pieLegendSwatchClass" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
              <rect width="12" height="12" rx="2" :fill="entry.color" />
              <path
                v-for="(d, position) in pieTexturePaths(entry.texture, 12)"
                :key="position"
                :d="d"
                fill="none"
                :stroke="pieTextureStroke"
                :stroke-width="TEXTURE_WIDTH"
                :stroke-opacity="TEXTURE_OPACITY"
              />
            </svg>
            <span>{{ entry.label }}</span>
            <span :class="pieLegendValueClass">
              {{ formatPointValue(entry.value) }} · {{ formatEntryShare(entry) }}
            </span>
          </li>
        </ul>
      </slot>
    </template>

    <template v-if="$slots.empty" #empty>
<slot name="empty" />
</template>
  </ChartFrame>
</template>
