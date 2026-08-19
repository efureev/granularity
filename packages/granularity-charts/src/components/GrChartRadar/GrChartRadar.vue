<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import { type Point, polarPoint } from '../../chart/chartArc'
import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatValue } from '../../chart/chartFormat'
import type { Rect } from '../../chart/chartLayout'
import type { GrChartSeries, NormalizedSeries } from '../../chart/chartModel'
import { normalizeChartData } from '../../chart/chartModel'
import { symbolPath } from '../../chart/chartPath'
import {
  alignSeriesToAxes,
  nearestAxis,
  perAxisMaxima,
  radarAreaPath,
  radarAxisAngles,
  radarLabelAnchor,
  radarLinePath,
  radarRingPath,
  radarSegments,
} from '../../chart/chartRadar'
import { linearScale } from '../../chart/chartScale'
import { linearTicks } from '../../chart/chartTicks'
import type { ChartTableModel } from '../../chart/chartTable'
import type { ChartHitContext, GrChartActivePoint } from '../../composables/useChartTooltip'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import {
  ACTIVE_MARKER_SCALE,
  crosshairStroke,
  type GrChartSize,
  gridStroke,
  gridStrokeWidth,
  labelFill,
  markerSizes,
} from '../GrChartFrame/chartFrameStyles'
import {
  AXIS_LABEL_CHAR_EM,
  AXIS_LABEL_GAP_EM,
  RADAR_HIT_DEAD_ZONE,
  RADAR_INSET,
  radarActiveLabelFill,
  radarFillOpacity,
  radarLabelFontPx,
  radarMarkerHalo,
  radarStrokeWidth,
} from './grChartRadarStyles'

/**
 * Лепестковая диаграмма: профиль по нескольким осям и сравнение профилей.
 *
 * Отвечает на вопрос, которого не закрывает ни один другой тип: не «сколько» и
 * не «куда движется», а «какой формы». Столбцы дают те же числа и не дают
 * формы; круг говорит о долях одного целого, а не о профиле.
 *
 * Третья полярная система координат в пакете — и она въезжает в общую раму
 * меньшим числом подмен, чем первая: своими остаются только попадание, якорь
 * тултипа и (в режиме нормировки на ось) объявление с таблицей.
 */

export interface GrChartRadarProps {
  /** Серии по общему набору осей. Ось X всегда категориальная — своего `xScale` у радара нет. */
  series: readonly GrChartSeries[] | readonly (number | null)[]
  /**
   * Как масштабировать спицы.
   *
   * `shared` — одна шкала на все оси: площадь фигуры сравнима, форма честна.
   * `per-axis` — каждая ось нормирована своим максимумом; это единственный
   * способ показать разнородные метрики на одной паутине, но площади при этом
   * сравнивать нельзя.
   */
  axisScale?: 'shared' | 'per-axis'
  /** Верхние границы осей при `per-axis`, ключ — имя оси. Без них максимум берётся из данных. */
  axisMax?: Record<string, number>
  /**
   * Желаемое число колец сетки — то же, что число делений оси значений.
   *
   * Фактическое следует лестнице «красивых» чисел и может отличаться: кольцо
   * обязано стоять на круглом значении, иначе подпись под ним читается как
   * случайная. При нормировке на ось круглых значений нет, и колец ровно
   * столько, сколько запрошено.
   */
  rings?: number
  /** Форма колец сетки. */
  shape?: 'polygon' | 'circle'
  /** Угол первой оси в градусах от двенадцати часов, по часовой. */
  startAngle?: number
  fill?: boolean
  showPoints?: 'auto' | 'always' | 'never'
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  /** Границы оси значений при `shared`. Ноль в домене остаётся всегда. */
  yDomain?: readonly [number | null, number | null]
  showLegend?: boolean | 'auto'
  legendPosition?: 'top' | 'bottom'
  tooltip?: boolean
  /** Скрытые серии по id — `v-model:hiddenSeries`. Оси при этом не исчезают. */
  hiddenSeries?: readonly string[]
  /** Курсор — `v-model:activeIndex`. Индекс оси. */
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

export interface GrChartRadarEmits {
  (e: 'update:hiddenSeries', value: string[]): void
  (e: 'update:activeIndex', value: number | null): void
  (e: 'pointClick', value: GrChartActivePoint): void
  (e: 'pointHover', value: GrChartActivePoint | null): void
  (e: 'legendToggle', value: { seriesId: string, hidden: boolean }): void
}

const props = withDefaults(defineProps<GrChartRadarProps>(), {
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  axisScale: undefined,
  axisMax: undefined,
  rings: undefined,
  shape: undefined,
  startAngle: 0,
  fill: undefined,
  showPoints: undefined,
  height: undefined,
  width: 640,
  yDomain: undefined,
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
  valueFormat: undefined,
  locale: undefined,
  ariaLabel: undefined,
  ariaDescription: undefined,
  dataTableMaxRows: undefined,
})

const emit = defineEmits<GrChartRadarEmits>()

defineSlots<{
  tooltip?: (props: { active: GrChartActivePoint, formatValue: (value: number | null) => string }) => unknown
  legend?: (props: { series: readonly NormalizedSeries[], toggle: (id: string) => void }) => unknown
  empty?: () => unknown
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartRadar' })
const resolvedHeight = useGrComponentProp('GrChartRadar', 'height', () => props.height, 280)
const resolvedAxisScale = useGrComponentProp('GrChartRadar', 'axisScale', () => props.axisScale, 'shared' as const)
const resolvedRings = useGrComponentProp('GrChartRadar', 'rings', () => props.rings, 4)
const resolvedShape = useGrComponentProp('GrChartRadar', 'shape', () => props.shape, 'polygon' as const)
const resolvedFill = useGrComponentProp('GrChartRadar', 'fill', () => props.fill, true)
const resolvedPoints = useGrComponentProp('GrChartRadar', 'showPoints', () => props.showPoints, 'auto' as const)
const resolvedLegendMode = useGrComponentProp('GrChartRadar', 'showLegend', () => props.showLegend, 'auto' as const)
const resolvedLegendPosition = useGrComponentProp('GrChartRadar', 'legendPosition', () => props.legendPosition, 'bottom' as const)
const resolvedTooltip = useGrComponentProp('GrChartRadar', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartRadar', 'dataTable', () => props.dataTable, 'hidden' as const)
const resolvedTableMaxRows = useGrComponentProp('GrChartRadar', 'dataTableMaxRows', () => props.dataTableMaxRows, 'auto' as number | 'auto')

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const perAxis = computed(() => resolvedAxisScale.value === 'per-axis')

/**
 * Вход выравнивается по объединённому набору осей **до** нормализации.
 *
 * Иначе скрытие серии уносит спицу: категории собираются по всем сериям, а
 * позиции — только по видимым (`chart/chartRadar.ts`, `alignSeriesToAxes`).
 */
const seriesInput = computed<readonly GrChartSeries[] | readonly (number | null)[]>(() => {
  if (props.series.length > 0 && typeof props.series[0] === 'number')
    return props.series as readonly (number | null)[]

  const hidden = new Set(props.hiddenSeries ?? [])

  return alignSeriesToAxes(props.series as readonly GrChartSeries[])
    .map(series => ({ ...series, hidden: series.hidden === true || hidden.has(series.id) }))
})

const chartData = computed(() => normalizeChartData(seriesInput.value, {
  kind: 'band',
  // Центр паутины — ноль, и это не опция: длина луча и есть величина, а центр
  // не в нуле врёт о пропорциях фигуры тем сильнее, чем уже диапазон.
  includeZero: true,
  yDomain: props.yDomain,
}))

const visibleSeries = computed(() => chartData.value.series.filter(series => !series.hidden))
const axisCount = computed(() => chartData.value.positions.length)
const startAngleRad = computed(() => (props.startAngle * Math.PI) / 180)
const angles = computed(() => radarAxisAngles(axisCount.value, startAngleRad.value))

/**
 * Кольца и домен считаются одним вызовом.
 *
 * Возьми домен у `yScale` рамы, а значения колец отдельным вызовом — и они
 * разошлись бы при несовпадении счётчика делений: точка легла бы «между
 * кольцами». Тот же `yTickCount` уходит в раму, поэтому её внутренний домен
 * совпадает с нашим.
 */
const ringTicks = computed(() => linearTicks(chartData.value.yDomain, resolvedRings.value))

/** Верхняя граница каждой оси при нормировке на ось. Проп сильнее данных. */
const axisMaxima = computed(() => {
  const fromData = perAxisMaxima(chartData.value.series, chartData.value.positions)

  return fromData.map((max, index) => props.axisMax?.[chartData.value.categories[index] ?? ''] ?? max)
})

/**
 * Значение → доля радиуса.
 *
 * В `shared` шкала одна на все оси; в `per-axis` — своя на каждую, и `yScale`
 * рамы не используется вовсе. Доля живёт **только здесь**: `point.y` остаётся
 * исходным, иначе тултип и скрытая таблица начали бы показывать проценты
 * вместо величин.
 */
function fractionOf(value: number, axisIndex: number): number {
  if (perAxis.value) {
    const max = axisMaxima.value[axisIndex] ?? 1

    return Math.min(1, Math.max(0, value / max))
  }

  const [min, max] = ringTicks.value.niceDomain

  return Math.min(1, Math.max(0, linearScale([min, max], [0, 1]).scale(value)))
}

const labelFontSize = computed(() => radarLabelFontPx[resolvedSize.value])

const axisLabels = computed(() => chartData.value.categories.map((name, index) => (
  perAxis.value
    ? t('grCharts.radar.axisWithMax', '{axis} · {max}', { axis: name, max: formatPointValue(axisMaxima.value[index] ?? null) })
    : name
)))

interface RadarGeometry {
  cx: number
  cy: number
  radius: number
}

function geometryOf(plot: Rect): RadarGeometry {
  const font = labelFontSize.value
  const longest = axisLabels.value.reduce((max, label) => Math.max(max, label.length), 0)
  const gutterX = font * (AXIS_LABEL_GAP_EM + AXIS_LABEL_CHAR_EM * longest)
  const gutterY = font * 2

  return {
    cx: plot.x + plot.width / 2,
    cy: plot.y + plot.height / 2,
    radius: Math.max(0, Math.min(plot.width - gutterX * 2, plot.height - gutterY * 2) / 2 - RADAR_INSET),
  }
}

function vertexOf(series: NormalizedSeries, axisIndex: number, geometry: RadarGeometry): Point | null {
  const x = chartData.value.positions[axisIndex]
  const angle = angles.value[axisIndex]

  if (x === undefined || angle === undefined)
    return null

  const value = series.points.find(point => point.x === x)?.y

  if (typeof value !== 'number' || !Number.isFinite(value))
    return null

  return polarPoint(geometry.cx, geometry.cy, geometry.radius * fractionOf(value, axisIndex), angle)
}

function verticesOf(series: NormalizedSeries, geometry: RadarGeometry): (Point | null)[] {
  return angles.value.map((_, index) => vertexOf(series, index, geometry))
}

interface RadarShape {
  id: string
  color: string
  outline: string
  area: string
  dashArray: string | undefined
}

function shapesOf(series: readonly NormalizedSeries[], plot: Rect): RadarShape[] {
  const geometry = geometryOf(plot)

  return series.map((item) => {
    const vertices = verticesOf(item, geometry)
    const { segments, closed } = radarSegments(vertices)

    return {
      id: item.id,
      color: item.style.color,
      outline: radarLinePath(segments, closed),
      area: resolvedFill.value ? radarAreaPath(vertices) : '',
      dashArray: item.style.dashArray,
    }
  })
}

const showMarkers = computed(() => resolvedPoints.value !== 'never')

interface RadarMark {
  key: string
  d: string
  color: string
}

function marksOf(series: readonly NormalizedSeries[], plot: Rect, cursor: number | null): RadarMark[] {
  if (!showMarkers.value)
    return []

  const geometry = geometryOf(plot)
  const base = markerSizes[resolvedSize.value]

  return series.flatMap(item => angles.value.flatMap((_, index) => {
    const vertex = vertexOf(item, index, geometry)

    if (!vertex)
      return []

    // Активная ось — единственный признак, кроме перекрашенной спицы: у радара
    // приглушать соседей нельзя, многоугольник натянут на все оси сразу.
    const size = index === cursor ? base * ACTIVE_MARKER_SCALE : base

    return [{
      key: `${item.id}-${index}`,
      d: symbolPath(item.style.shape, vertex.x, vertex.y, size),
      color: item.style.color,
    }]
  }))
}

interface RadarRing {
  key: number
  radius: number
  path: string
  label: string
  labelX: number
  labelY: number
}

function ringsOf(plot: Rect): RadarRing[] {
  const geometry = geometryOf(plot)

  // Подпись кольца отходит вправо от верхней спицы: по центру она встала бы в
  // одну колонку с именем верхней оси, и на плотной паутине они наезжают.
  const offset = labelFontSize.value * 0.4

  const ring = (radius: number, label: string, key: number): RadarRing => ({
    key,
    radius,
    path: radarRingPath(geometry.cx, geometry.cy, radius, angles.value),
    label,
    labelX: geometry.cx + offset,
    labelY: geometry.cy - radius,
  })

  // При нормировке на ось единственного верного числа для кольца не существует:
  // у каждой оси свой максимум. Кольца становятся равными долями, а максимумы
  // уезжают в имена осей.
  if (perAxis.value) {
    return Array.from({ length: resolvedRings.value }, (_, index) => (
      ring((geometry.radius * (index + 1)) / resolvedRings.value, '', index)
    ))
  }

  // Радиус и подпись берутся из **одного** значения деления: считай их порознь
  // — и на домене с отрицательным низом подпись уехала бы к чужому кольцу.
  const [min] = ringTicks.value.niceDomain

  return ringTicks.value.values
    .filter(value => value > min)
    .map((value, index) => ring(geometry.radius * fractionOf(value, 0), formatPointValue(value), index))
}

interface RadarSpoke {
  key: number
  x: number
  y: number
  active: boolean
  label: string
  labelX: number
  labelY: number
  anchor: 'start' | 'middle' | 'end'
}

function spokesOf(plot: Rect, cursor: number | null): RadarSpoke[] {
  const geometry = geometryOf(plot)
  const gap = labelFontSize.value * AXIS_LABEL_GAP_EM

  return angles.value.map((angle, index) => {
    const end = polarPoint(geometry.cx, geometry.cy, geometry.radius, angle)
    const label = polarPoint(geometry.cx, geometry.cy, geometry.radius + gap, angle)

    return {
      key: index,
      x: end.x,
      y: end.y,
      active: index === cursor,
      label: axisLabels.value[index] ?? '',
      labelX: label.x,
      labelY: label.y,
      anchor: radarLabelAnchor(angle),
    }
  })
}

function hitTest(point: { x: number, y: number }, context: ChartHitContext): number {
  const geometry = geometryOf(context.plot)

  return nearestAxis(geometry.cx, geometry.cy, point.x, point.y, axisCount.value, startAngleRad.value, {
    minRadius: RADAR_HIT_DEAD_ZONE,
    maxRadius: geometry.radius + markerSizes[resolvedSize.value] * ACTIVE_MARKER_SCALE,
  })
}

/** Якорь тултипа — самая дальняя вершина на активной спице: над ней читатель и смотрит. */
function anchorPoint(index: number, context: ChartHitContext): { x: number, y: number } | null {
  const geometry = geometryOf(context.plot)
  const angle = angles.value[index]

  if (angle === undefined)
    return null

  const reach = visibleSeries.value.reduce((max, item) => {
    const vertex = vertexOf(item, index, geometry)

    if (!vertex)
      return max

    return Math.max(max, Math.hypot(vertex.x - geometry.cx, vertex.y - geometry.cy))
  }, 0)

  return polarPoint(geometry.cx, geometry.cy, reach || geometry.radius, angle)
}

const numberFormat = computed<GrChartNumberFormat>(() => ({ locale: resolvedLocale.value, ...props.valueFormat }))

function formatPointValue(value: number | null): string {
  return formatValue(value, numberFormat.value, t('grCharts.chart.noValue', 'no value'))
}

/**
 * При нормировке на ось объявление и таблица несут ещё и максимум оси.
 *
 * Услышать «NPS: 62» и не узнать, что предел здесь сто, — значит получить
 * другую диаграмму, чем видит зрячий сосед: именно предел задаёт форму фигуры.
 * В общей шкале максимум один и он подписан на кольцах, поэтому там работают
 * дефолты рамы.
 */
function describeAxisPoint(index: number, seriesIndex: number): string {
  const axis = chartData.value.categories[index]
  const x = chartData.value.positions[index]
  const series = visibleSeries.value
  const current = series[Math.min(seriesIndex, series.length - 1)]

  if (axis === undefined || x === undefined || !current)
    return ''

  return t('grCharts.radar.point', '{axis}. {series}: {value} of {max}', {
    axis,
    series: current.label,
    value: formatPointValue(current.points.find(point => point.x === x)?.y ?? null),
    max: formatPointValue(axisMaxima.value[index] ?? null),
  })
}

/** В общей шкале максимум один и подписан на кольцах — там работает дефолт рамы. */
const describePoint = computed(() => (perAxis.value ? describeAxisPoint : undefined))

const tableModel = computed<ChartTableModel | undefined>(() => {
  if (!perAxis.value)
    return undefined

  const series = visibleSeries.value

  return {
    caption: t('grCharts.chart.tableCaption', 'Chart data'),
    columns: [
      { key: 'axis', label: t('grCharts.radar.columnAxis', 'Axis') },
      ...series.map(item => ({ key: item.id, label: item.label })),
      { key: 'max', label: t('grCharts.radar.columnMax', 'Axis maximum') },
    ],
    rows: chartData.value.positions.map((x, index) => ({
      header: chartData.value.categories[index] ?? String(x),
      cells: [
        ...series.map(item => formatPointValue(item.points.find(point => point.x === x)?.y ?? null)),
        formatPointValue(axisMaxima.value[index] ?? null),
      ],
    })),
  }
})

const showLegend = computed(() => (
  resolvedLegendMode.value === 'auto' ? chartData.value.series.length > 1 : resolvedLegendMode.value === true
))

const surfaceLabel = computed(() => {
  if (props.ariaLabel)
    return props.ariaLabel

  const label = t('grCharts.radar.summary', 'Radar chart, {axes} axes, {series} series', {
    axes: axisCount.value,
    series: visibleSeries.value.length,
  })

  return `${label}. ${t('grCharts.radar.keyboardHint', 'Use arrow keys to browse axes')}`
})

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
    :data="chartData"
    :height="resolvedHeight"
    :width="width"
    :size="resolvedSize"
    :axes="false"
    show-grid="none"
    :crosshair="false"
    :y-tick-count="resolvedRings"
    :show-legend="showLegend"
    :legend-position="resolvedLegendPosition"
    :tooltip="resolvedTooltip"
    :loading="loading"
    :empty="empty"
    :empty-text="emptyText"
    :data-table="resolvedDataTable"
    :data-table-max-rows="resolvedTableMaxRows"
    :interactive="interactive"
    :active-index="activeIndex"
    :locale="locale"
    :aria-label="surfaceLabel"
    :aria-description="ariaDescription"
    :role-description="t('grCharts.radar.roleDescription', 'radar chart')"
    :value-format="valueFormat"
    :hit-test="hitTest"
    :anchor-point="anchorPoint"
    :table-model="tableModel"
    :describe-point="describePoint"
    data-gr-chart-radar
    @update:active-index="value => emit('update:activeIndex', value)"
    @point-click="value => emit('pointClick', value)"
    @point-hover="value => emit('pointHover', value)"
    @legend-toggle="onLegendToggle"
  >
    <template #header>
<slot name="header" />
</template>

    <template #plot="{ plot, visibleSeries: shown, activeIndex: cursor }">
      <g data-gr-chart-radar-body>
        <!-- Сетка: кольца и спицы. Токены берутся у рамы — второй цвет сетки
             на той же странице читался бы как ошибка вёрстки. -->
        <template v-for="ring in ringsOf(plot)" :key="ring.key">
          <circle
            v-if="resolvedShape === 'circle'"
            :data-gr-chart-radar-ring="ring.key"
            :cx="plot.x + plot.width / 2"
            :cy="plot.y + plot.height / 2"
            :r="ring.radius"
            fill="none"
            :stroke="gridStroke"
            :stroke-width="gridStrokeWidth"
          />
          <path
            v-else
            :data-gr-chart-radar-ring="ring.key"
            :d="ring.path"
            fill="none"
            :stroke="gridStroke"
            :stroke-width="gridStrokeWidth"
          />
        </template>

        <line
          v-for="spoke in spokesOf(plot, cursor)"
          :key="`spoke-${spoke.key}`"
          :data-gr-chart-radar-axis="spoke.key"
          :x1="plot.x + plot.width / 2"
          :y1="plot.y + plot.height / 2"
          :x2="spoke.x"
          :y2="spoke.y"
          :stroke="spoke.active ? crosshairStroke : gridStroke"
          :stroke-width="gridStrokeWidth"
        />

        <path
          v-for="shapeItem in shapesOf(shown, plot)"
          :key="`area-${shapeItem.id}`"
          :data-gr-chart-radar-area="shapeItem.id"
          :d="shapeItem.area"
          :fill="shapeItem.color"
          :fill-opacity="radarFillOpacity"
          stroke="none"
        />

        <path
          v-for="shapeItem in shapesOf(shown, plot)"
          :key="`outline-${shapeItem.id}`"
          :data-gr-chart-radar-outline="shapeItem.id"
          :d="shapeItem.outline"
          fill="none"
          :stroke="shapeItem.color"
          :stroke-width="radarStrokeWidth"
          :stroke-dasharray="shapeItem.dashArray"
          stroke-linejoin="round"
        />

        <path
          v-for="mark in marksOf(shown, plot, cursor)"
          :key="mark.key"
          :d="mark.d"
          :fill="mark.color"
          :stroke="radarMarkerHalo"
          stroke-width="1.5"
        />

        <text
          v-for="ring in ringsOf(plot)"
          :key="`ring-label-${ring.key}`"
          :x="plot.x + plot.width / 2"
          :y="ring.labelY"
          :fill="labelFill"
          :font-size="labelFontSize"
          text-anchor="middle"
          dominant-baseline="middle"
        >
{{ ring.label }}
</text>

        <text
          v-for="spoke in spokesOf(plot, cursor)"
          :key="`axis-label-${spoke.key}`"
          :data-gr-chart-radar-label="spoke.key"
          :x="spoke.labelX"
          :y="spoke.labelY"
          :fill="spoke.active ? radarActiveLabelFill : labelFill"
          :font-size="labelFontSize"
          :text-anchor="spoke.anchor"
          dominant-baseline="middle"
        >
{{ spoke.label }}
</text>
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
