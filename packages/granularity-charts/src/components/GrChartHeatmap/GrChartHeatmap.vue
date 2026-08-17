<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatValue } from '../../chart/chartFormat'
import { labelGutters, type Rect } from '../../chart/chartLayout'
import type { HeatmapCell, HeatmapScaleKind } from '../../chart/chartHeatmap'
import { heatmapCells, heatmapColor, heatmapMatrix, heatmapOnDark, heatmapScale } from '../../chart/chartHeatmap'
import { normalizeChartData } from '../../chart/chartModel'
import type { ChartTableModel } from '../../chart/chartTable'
import type { ChartHitContext, GrChartActivePoint } from '../../composables/useChartTooltip'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import {
  frameLabelClass,
  frameTooltipClass,
  frameTooltipRowClass,
  frameTooltipTitleClass,
  frameTooltipValueClass,
  type GrChartSize,
  labelFill,
  labelFontPx,
  labelSizeClass,
} from '../GrChartFrame/chartFrameStyles'
import { heatmapLegendClass, heatmapLegendLabelClass, heatmapLegendSwatchClass } from './grChartHeatmapLegend'
import {
  CELL_LABEL_MAX,
  CELL_LABEL_MIN,
  CELL_LABEL_MIN_WIDTH,
  CELL_LABEL_RATIO,
  DEFAULT_HEATMAP_GAP,
  HEATMAP_HIGH_COLOR,
  HEATMAP_LOW_COLOR,
  HEATMAP_MID_COLOR,
  HEATMAP_OUTLINE_WIDTH,
  heatmapEmptyFill,
  heatmapLabelFill,
  heatmapLabelOnDarkFill,
  heatmapOutlineStroke,
  LEGEND_CONTINUOUS_STEPS,
} from './grChartHeatmapStyles'

/**
 * Теплокарта: матрица значений, где цвет кодирует величину.
 *
 * Шкала — одна роль темы через `color-mix`, а не набор из пяти цветов: пять
 * цветов пришлось бы подбирать заново под тёмную тему и заново же под вторую
 * теплокарту на соседней странице.
 *
 * Обе оси здесь категориальные, поэтому осей рамы нет вовсе — подписи строк и
 * колонок компонент рисует сам, как круг рисует свои выноски. Внутрь рамы уходит
 * линейный ряд по индексам колонок: у категориальной оси подписи проходят через
 * дедупликацию, и две одинаковые колонки («Q1» за два года) слиплись бы в одну
 * позицию, после чего курсор адресовал бы чужую ячейку.
 */

export interface GrChartHeatmapCell {
  x: number
  y: number
  xLabel: string
  yLabel: string
  value: number | null
}

export interface GrChartHeatmapProps {
  /** Значения построчно: `values[y][x]`. `null` — ячейки нет, а не «ноль». */
  values: readonly (readonly (number | null)[])[]
  xLabels: readonly string[]
  yLabels: readonly string[]
  /** Границы шкалы. Не заданы — считаются по данным. */
  domain?: readonly [number, number]
  /** Последовательная (одна роль) или расходящаяся (две роли вокруг середины). */
  scale?: HeatmapScaleKind
  /** Середина расходящейся шкалы. */
  midpoint?: number
  lowColor?: string
  highColor?: string
  midColor?: string
  /** Число ступеней шкалы. `0` — непрерывная. */
  steps?: number
  /** Зазор между ячейками в пикселях. */
  cellGap?: number
  showLegend?: boolean
  /** Значения в ячейках. `'auto'` — только если они помещаются. */
  showValues?: boolean | 'auto'
  valueFormat?: GrChartNumberFormat
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  tooltip?: boolean
  /** Курсор — `v-model:activeCell`. */
  activeCell?: { x: number, y: number } | null
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

export interface GrChartHeatmapEmits {
  (e: 'update:activeCell', value: { x: number, y: number } | null): void
  (e: 'cellClick', value: GrChartHeatmapCell): void
  (e: 'cellHover', value: GrChartHeatmapCell | null): void
}

const props = withDefaults(defineProps<GrChartHeatmapProps>(), {
  domain: undefined,
  scale: 'sequential',
  midpoint: 0,
  lowColor: HEATMAP_LOW_COLOR,
  highColor: HEATMAP_HIGH_COLOR,
  midColor: HEATMAP_MID_COLOR,
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  steps: undefined,
  cellGap: undefined,
  showLegend: undefined,
  showValues: undefined,
  valueFormat: undefined,
  height: undefined,
  width: 640,
  tooltip: undefined,
  activeCell: undefined,
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

const emit = defineEmits<GrChartHeatmapEmits>()

defineSlots<{
  tooltip?: (props: { active: GrChartActivePoint, cell: GrChartHeatmapCell | null }) => unknown
  legend?: (props: { thresholds: readonly number[], colorAt: (fraction: number) => string }) => unknown
  empty?: () => unknown
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartHeatmap' })
const resolvedHeight = useGrComponentProp('GrChartHeatmap', 'height', () => props.height, 256)
const resolvedGap = useGrComponentProp('GrChartHeatmap', 'cellGap', () => props.cellGap, DEFAULT_HEATMAP_GAP)
const resolvedSteps = useGrComponentProp('GrChartHeatmap', 'steps', () => props.steps, 5)
const resolvedLegend = useGrComponentProp('GrChartHeatmap', 'showLegend', () => props.showLegend, true)
const resolvedShowValues = useGrComponentProp('GrChartHeatmap', 'showValues', () => props.showValues, 'auto' as const)
const resolvedTooltip = useGrComponentProp('GrChartHeatmap', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartHeatmap', 'dataTable', () => props.dataTable, 'hidden' as const)

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')

const columns = computed(() => props.xLabels.length)
const rows = computed(() => props.yLabels.length)

const matrix = computed(() => heatmapMatrix(props.values, columns.value, rows.value))

const scale = computed(() => heatmapScale(matrix.value, {
  domain: props.domain,
  kind: props.scale,
  midpoint: props.midpoint,
  steps: resolvedSteps.value,
}))

const roles = computed(() => ({
  low: props.lowColor,
  high: props.highColor,
  mid: props.midColor,
  empty: heatmapEmptyFill,
}))

/**
 * Строка матрицы становится серией, колонка — позицией.
 *
 * Так двумерная клавиатура ложится на уже существующую: `←→` рама ведёт по
 * позициям, `↑↓` — по сериям, и это ровно «колонка» и «строка».
 */
const data = computed(() => normalizeChartData(
  props.yLabels.map((label, y) => ({
    id: `row-${y}`,
    label,
    data: props.xLabels.map((xLabel, x) => ({ x, y: matrix.value[y]?.[x] ?? null, label: xLabel })),
  })),
  { kind: 'linear', sort: false },
))

const isEmpty = computed(() => props.empty ?? (columns.value === 0 || rows.value === 0))

const numberFormat = computed<GrChartNumberFormat>(() => ({ locale: resolvedLocale.value, ...props.valueFormat }))

function formatCellValue(value: number | null): string {
  return formatValue(value, numberFormat.value, '—')
}

const innerColumn = ref<number | null>(null)
const innerRow = ref(0)

const activeColumn = computed(() => props.activeCell?.x ?? innerColumn.value)
const activeRow = computed(() => props.activeCell?.y ?? innerRow.value)

const fontSizePx = computed(() => labelFontPx[resolvedSize.value])

/**
 * Место под подписи строк и колонок.
 *
 * Рама идёт с `axes: false`: её ось значений числовая по построению, а здесь обе
 * оси категориальные. Гуттер поэтому считается внутри области построения и
 * ужимает сетку — тот же приём, что у круга под выносными подписями.
 */
const gutters = computed(() => labelGutters({
  leftLabels: props.yLabels,
  bottomLabels: props.xLabels,
  fontSizePx: fontSizePx.value,
}))

function gridOf(plot: Rect): Rect {
  return {
    x: plot.x + gutters.value.left,
    y: plot.y,
    width: Math.max(0, plot.width - gutters.value.left),
    height: Math.max(0, plot.height - gutters.value.bottom),
  }
}

function cellsOf(plot: Rect): HeatmapCell[] {
  return heatmapCells(matrix.value, scale.value, {
    plot: gridOf(plot),
    columns: columns.value,
    rows: rows.value,
    gap: resolvedGap.value,
  })
}

function fillOf(cell: HeatmapCell): string {
  return heatmapColor(cell.fraction, roles.value, props.scale)
}

/** Подпись в ячейке имеет смысл, только когда она туда влезает. */
function labelFontOf(cell: HeatmapCell): number {
  return Math.min(CELL_LABEL_MAX, Math.max(CELL_LABEL_MIN, cell.rect.height * CELL_LABEL_RATIO))
}

function showsValues(cells: readonly HeatmapCell[]): boolean {
  if (resolvedShowValues.value === true)
    return true
  if (resolvedShowValues.value === false)
    return false

  return (cells[0]?.rect.width ?? 0) >= CELL_LABEL_MIN_WIDTH
}

function valueCells(plot: Rect): HeatmapCell[] {
  const cells = cellsOf(plot)

  return showsValues(cells) ? cells.filter(cell => cell.value !== null) : []
}

interface AxisLabel {
  key: string
  x: number
  y: number
  text: string
  anchor: 'start' | 'middle' | 'end'
}

function rowLabels(plot: Rect): AxisLabel[] {
  const grid = gridOf(plot)
  const step = rows.value > 0 ? grid.height / rows.value : 0

  return props.yLabels.map((text, y) => ({
    key: `row-${y}`,
    x: grid.x - DEFAULT_HEATMAP_GAP * 2,
    y: grid.y + step * y + step / 2,
    text,
    anchor: 'end' as const,
  }))
}

function columnLabels(plot: Rect): AxisLabel[] {
  const grid = gridOf(plot)
  const step = columns.value > 0 ? grid.width / columns.value : 0

  return props.xLabels.map((text, x) => ({
    key: `column-${x}`,
    x: grid.x + step * x + step / 2,
    y: grid.y + grid.height + fontSizePx.value,
    text,
    anchor: 'middle' as const,
  }))
}

function outlineOf(plot: Rect): Rect[] {
  const column = activeColumn.value

  if (column === null)
    return []

  const cell = cellsOf(plot).find(item => item.x === column && item.y === activeRow.value)

  return cell ? [cell.rect] : []
}

/** Попадание по колонке: рама ведёт курсор по позициям, а это и есть колонки. */
function hitTest(point: { x: number, y: number }, context: ChartHitContext): number {
  const grid = gridOf(context.plot)

  if (point.x < grid.x || point.x > grid.x + grid.width || point.y < grid.y || point.y > grid.y + grid.height)
    return -1

  const step = grid.width / Math.max(1, columns.value)

  return Math.min(columns.value - 1, Math.max(0, Math.floor((point.x - grid.x) / step)))
}

/** Вторая координата: у матрицы попадание двумерное, и строку считает компонент. */
function hitSeries(point: { x: number, y: number }, context: ChartHitContext): number {
  const grid = gridOf(context.plot)

  if (point.y < grid.y || point.y > grid.y + grid.height)
    return -1

  const step = grid.height / Math.max(1, rows.value)

  return Math.min(rows.value - 1, Math.max(0, Math.floor((point.y - grid.y) / step)))
}

function anchorPoint(index: number, context: ChartHitContext): { x: number, y: number } | null {
  const cell = cellsOf(context.plot).find(item => item.x === index && item.y === activeRow.value)

  return cell ? { x: cell.rect.x + cell.rect.width / 2, y: cell.rect.y } : null
}

function cellAt(x: number | null, y: number): GrChartHeatmapCell | null {
  if (x === null || x < 0 || x >= columns.value || y < 0 || y >= rows.value)
    return null

  return {
    x,
    y,
    xLabel: props.xLabels[x] ?? String(x),
    yLabel: props.yLabels[y] ?? String(y),
    value: matrix.value[y]?.[x] ?? null,
  }
}

function describePoint(index: number, seriesIndex: number): string {
  const cell = cellAt(index, seriesIndex)

  if (!cell)
    return ''

  return t('grCharts.heatmap.cell', '{row}, {column}: {value}', {
    row: cell.yLabel,
    column: cell.xLabel,
    value: formatCellValue(cell.value),
  })
}

/**
 * Скрытая таблица — настоящая таблица с заголовками строк и колонок.
 *
 * Здесь она ценнее, чем где бы то ни было: визуальная теплокарта без неё
 * нечитаема вовсе, а не просто менее удобна.
 */
const tableModel = computed<ChartTableModel>(() => ({
  caption: t('grCharts.heatmap.tableCaption', 'Chart data'),
  columns: [
    { key: 'row', label: t('grCharts.heatmap.columnRow', 'Row') },
    ...props.xLabels.map((label, x) => ({ key: `column-${x}`, label })),
  ],
  rows: props.yLabels.map((label, y) => ({
    header: label,
    cells: props.xLabels.map((_, x) => formatCellValue(matrix.value[y]?.[x] ?? null)),
  })),
}))

const surfaceLabel = computed(() => {
  if (props.ariaLabel)
    return props.ariaLabel

  const label = t('grCharts.heatmap.summary', 'Heatmap, {rows} rows, {columns} columns', {
    rows: rows.value,
    columns: columns.value,
  })

  return `${label}. ${t('grCharts.heatmap.keyboardHint', 'Use arrow keys to browse cells')}`
})

/** Легенда — шкала с подписями границ, а не список категорий. */
const legendSwatches = computed(() => {
  const total = scale.value.steps > 0 ? scale.value.steps : LEGEND_CONTINUOUS_STEPS

  return Array.from({ length: total }, (_, index) => {
    const share = total === 1 ? 1 : index / (total - 1)

    return {
      index,
      color: heatmapColor(props.scale === 'diverging' ? share * 2 - 1 : share, roles.value, props.scale),
    }
  })
})

const legendBounds = computed(() => [
  formatCellValue(scale.value.domain[0]),
  formatCellValue(scale.value.domain[1]),
])

function colorAt(fraction: number): string {
  return heatmapColor(fraction, roles.value, props.scale)
}

function onActiveColumn(value: number | null): void {
  innerColumn.value = value
  emit('update:activeCell', value === null ? null : { x: value, y: activeRow.value })
}

function onActiveRow(value: number): void {
  innerRow.value = value

  if (activeColumn.value !== null)
    emit('update:activeCell', { x: activeColumn.value, y: value })
}

function onPointClick(): void {
  const cell = cellAt(activeColumn.value, activeRow.value)

  if (cell)
    emit('cellClick', cell)
}

function onPointHover(point: GrChartActivePoint | null): void {
  emit('cellHover', point === null ? null : cellAt(point.index, activeRow.value))
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
    :axes="false"
    show-grid="none"
    :crosshair="false"
    :show-legend="resolvedLegend"
    :tooltip="resolvedTooltip"
    :loading="loading"
    :empty="isEmpty"
    :empty-text="emptyText"
    :data-table="resolvedDataTable"
    :interactive="interactive"
    :active-index="activeColumn"
    :active-series-index="activeRow"
    :locale="locale"
    :aria-label="surfaceLabel"
    :aria-description="ariaDescription"
    :role-description="t('grCharts.heatmap.roleDescription', 'heatmap')"
    :hit-test="hitTest"
    :hit-series="hitSeries"
    :anchor-point="anchorPoint"
    :table-model="tableModel"
    :describe-point="describePoint"
    :keyboard="{ wrapSeries: false, pageMode: 'series' }"
    data-gr-chart-heatmap
    @update:active-index="onActiveColumn"
    @update:active-series-index="onActiveRow"
    @point-click="onPointClick"
    @point-hover="onPointHover"
  >
    <template #header>
      <slot name="header" />
    </template>

    <template #plot="{ plot }">
      <g data-gr-chart-heatmap-body>
        <rect
          v-for="cell in cellsOf(plot)"
          :key="`${cell.y}-${cell.x}`"
          :data-gr-chart-heatmap-cell="`${cell.y}-${cell.x}`"
          :x="cell.rect.x"
          :y="cell.rect.y"
          :width="cell.rect.width"
          :height="cell.rect.height"
          :fill="fillOf(cell)"
          stroke="none"
        />

        <text
          v-for="cell in valueCells(plot)"
          :key="`value-${cell.y}-${cell.x}`"
          :class="frameLabelClass"
          :x="cell.rect.x + cell.rect.width / 2"
          :y="cell.rect.y + cell.rect.height / 2"
          :fill="heatmapOnDark(cell.fraction) ? heatmapLabelOnDarkFill : heatmapLabelFill"
          :font-size="labelFontOf(cell)"
          text-anchor="middle"
          dominant-baseline="central"
        >
{{ formatCellValue(cell.value) }}
</text>

        <!-- Обводка активной ячейки поверх всех заливок: под соседней она бы срезалась. -->
        <rect
          v-for="(rect, index) in outlineOf(plot)"
          :key="`outline-${index}`"
          data-gr-chart-heatmap-outline
          :x="rect.x"
          :y="rect.y"
          :width="rect.width"
          :height="rect.height"
          fill="none"
          :stroke="heatmapOutlineStroke"
          :stroke-width="HEATMAP_OUTLINE_WIDTH"
        />

        <text
          v-for="label in rowLabels(plot)"
          :key="label.key"
          :class="[frameLabelClass, labelSizeClass[resolvedSize]]"
          data-gr-chart-heatmap-row-label
          :x="label.x"
          :y="label.y"
          :fill="labelFill"
          :text-anchor="label.anchor"
          dominant-baseline="middle"
        >
{{ label.text }}
</text>

        <text
          v-for="label in columnLabels(plot)"
          :key="label.key"
          :class="[frameLabelClass, labelSizeClass[resolvedSize]]"
          data-gr-chart-heatmap-column-label
          :x="label.x"
          :y="label.y"
          :fill="labelFill"
          :text-anchor="label.anchor"
        >
{{ label.text }}
</text>
      </g>
    </template>

    <template #legend>
      <slot name="legend" :thresholds="scale.thresholds" :color-at="colorAt">
        <div :class="heatmapLegendClass" data-gr-chart-heatmap-legend>
          <span :class="heatmapLegendLabelClass">{{ legendBounds[0] }}</span>
          <svg :class="heatmapLegendSwatchClass" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <rect
              v-for="swatch in legendSwatches"
              :key="swatch.index"
              :x="(swatch.index / legendSwatches.length) * 100"
              y="0"
              :width="100 / legendSwatches.length"
              height="10"
              :fill="swatch.color"
              stroke="none"
            />
          </svg>
          <span :class="heatmapLegendLabelClass">{{ legendBounds[1] }}</span>
        </div>
      </slot>
    </template>

    <template #tooltip="scope">
      <slot name="tooltip" v-bind="scope" :cell="cellAt(scope.active.index, activeRow)">
        <div :class="frameTooltipClass">
          <template v-for="cell in [cellAt(scope.active.index, activeRow)]" :key="`${cell?.y}-${cell?.x}`">
            <div v-if="cell" :class="frameTooltipTitleClass">
              {{ cell.yLabel }} · {{ cell.xLabel }}
            </div>
            <div v-if="cell" :class="frameTooltipRowClass">
              <span :class="frameTooltipValueClass">{{ formatCellValue(cell.value) }}</span>
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
