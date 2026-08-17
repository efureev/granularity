<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref, useId } from 'vue'

import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatShare } from '../../chart/chartFormat'
import type { Rect } from '../../chart/chartLayout'
import { activeSymbolMarks, symbolMarks, toPixelPoints, toStackBand } from '../../chart/chartMarks'
import type { GrChartSeries, NormalizedSeries } from '../../chart/chartModel'
import { normalizeChartData, resolveScaleKind } from '../../chart/chartModel'
import type { GrChartReference } from '../../chart/chartReference'
import { referenceDomainValues } from '../../chart/chartReference'
import { areaPath, bandPath, type GrChartCurve, linePath } from '../../chart/chartPath'
import { type GrChartScale, type GrChartScaleKind, scaleForAxis } from '../../chart/chartScale'
import type { ChartTickFormat } from '../../composables/useChartTicks'
import type { GrChartActivePoint } from '../../composables/useChartTooltip'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import {
  ACTIVE_MARKER_SCALE,
  AUTO_MARKERS_LIMIT,
  type GrChartSize,
  markerSizes,
} from '../GrChartFrame/chartFrameStyles'
import {
  areaFillFade,
  areaFillOpacity,
  areaPointHalo,
  areaStackOpacity,
  areaStrokeWidth,
} from './grChartAreaStyles'

/**
 * Площадь: тот же ряд, что у линии, но с заливкой до базовой линии — и
 * складываемый в стек.
 *
 * Отдельным компонентом, а не пропом линии: взявший линию не должен получать в
 * бандл арифметику стека и разметку градиентов, которых он не просил.
 */

export interface GrChartAreaProps {
  /** Серии либо голый ряд чисел — тогда `x` становится порядковым номером. */
  series: readonly GrChartSeries[] | readonly number[]
  /** Тип оси X. Не задан — выводится из данных. */
  xScale?: GrChartScaleKind
  /**
   * Складывать серии: каждая полоса ложится на сумму предыдущих.
   *
   * `'100%'` вдобавок нормирует каждую позицию к единице — тогда лента
   * показывает, как менялось **распределение**, а не величины. Собственные
   * значения точек при этом не трогаются: тултип и таблица говорят «сорок», а
   * не «треть».
   */
  stacked?: boolean | '100%'
  /** Заливка. `auto` — градиент у наложения, плотная у стека. */
  fill?: 'auto' | 'gradient' | 'solid'
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  yDomain?: readonly [number | null, number | null]
  includeZero?: boolean
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
  curve?: GrChartCurve
  showPoints?: 'auto' | 'always' | 'never'
  showGrid?: 'both' | 'x' | 'y' | 'none'
  showLegend?: boolean | 'auto'
  legendPosition?: 'top' | 'bottom'
  tooltip?: boolean
  /** Скрытые серии по id — `v-model:hiddenSeries`. Скрытая серия из стека выпадает. */
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
  /** Порог, выше которого марки не рисуются даже при `showPoints: 'auto'`. */
  canvasThreshold?: number
}

export interface GrChartAreaEmits {
  (e: 'update:hiddenSeries', value: string[]): void
  (e: 'update:activeIndex', value: number | null): void
  (e: 'pointClick', value: GrChartActivePoint): void
  (e: 'pointHover', value: GrChartActivePoint | null): void
  (e: 'legendToggle', value: { seriesId: string, hidden: boolean }): void
}

const props = withDefaults(defineProps<GrChartAreaProps>(), {
  xScale: undefined,
  stacked: false,
  fill: undefined,
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  height: undefined,
  width: 640,
  yDomain: undefined,
  includeZero: false,
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
  canvasThreshold: 2000,
})

const emit = defineEmits<GrChartAreaEmits>()

defineSlots<{
  tooltip?: (props: { active: GrChartActivePoint, formatValue: (value: number | null) => string }) => unknown
  legend?: (props: { series: readonly NormalizedSeries[], toggle: (id: string) => void }) => unknown
  empty?: () => unknown
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartArea' })
const resolvedHeight = useGrComponentProp('GrChartArea', 'height', () => props.height, 256)
const resolvedCurve = useGrComponentProp('GrChartArea', 'curve', () => props.curve, 'linear' as GrChartCurve)
const resolvedGrid = useGrComponentProp('GrChartArea', 'showGrid', () => props.showGrid, 'y' as const)
const resolvedLegendMode = useGrComponentProp('GrChartArea', 'showLegend', () => props.showLegend, 'auto' as const)
const resolvedLegendPosition = useGrComponentProp('GrChartArea', 'legendPosition', () => props.legendPosition, 'bottom' as const)
const resolvedTooltip = useGrComponentProp('GrChartArea', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartArea', 'dataTable', () => props.dataTable, 'hidden' as const)

const fillMode = useGrComponentProp('GrChartArea', 'fill', () => props.fill, 'auto' as const)

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')

const isNormalized = computed(() => props.stacked === '100%')

/** В режиме ста процентов ось показывает доли — иначе на ней стояли бы 0,2 и 0,4. */
const yTickFormat = computed(() => (
  props.yTickFormat ?? (isNormalized.value ? (value: number) => formatShare(value, resolvedLocale.value) : undefined)
))

/**
 * `auto` — это градиент у наложения и плотная заливка у стека.
 *
 * Полосы стека стоят встык, и градиент внутри каждой превратил бы границу между
 * ними в размытый переход — ровно то, что стек и должен показывать чётко.
 * Наложенные же площади обязаны просвечивать, и ровная плашка тут спорит с
 * сеткой.
 */
const resolvedFill = computed(() => (
  fillMode.value === 'auto' ? (props.stacked ? 'solid' : 'gradient') : fillMode.value
))

const fillOpacity = computed(() => (props.stacked ? areaStackOpacity : areaFillOpacity))

/** Свой id: два графика на странице поделили бы градиенты общими именами. */
const gradientBase = `gr-chart-area-${useId()}`

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
  includeZero: props.includeZero,
  yDomain: props.yDomain,
  stacked: props.stacked,
  includeXValues: referenceDomain.value.x,
  includeYValues: referenceDomain.value.y,
  dualAxis: props.dualAxis,
  yDomainRight: props.yDomainRight,
}))

const showLegend = computed(() => (
  resolvedLegendMode.value === 'auto' ? data.value.series.length > 1 : resolvedLegendMode.value === true
))

const showMarkers = computed(() => {
  const total = data.value.positions.length

  if (props.showPoints === 'never')
    return false
  if (props.showPoints === 'always')
    return total <= props.canvasThreshold

  // На стеке `auto` означает «не надо». Марка садится на стык двух полос, и
  // обводка цветом фона превращает её в дырку между ними; сами же точки на
  // границе полос и так видны каждым изломом.
  if (props.stacked)
    return false

  return total <= Math.min(AUTO_MARKERS_LIMIT, props.canvasThreshold)
})

const markerSize = computed(() => markerSizes[resolvedSize.value])

function activeX(cursor: number | null): number | undefined {
  return cursor === null ? undefined : data.value.positions[cursor]
}

interface AreaMark {
  key: string
  d: string
  fill: string
  color: string
}

/**
 * Базовая линия — ноль, если он в домене, иначе ближний край области.
 *
 * Заливать всегда до низа холста нельзя: при отрицательных значениях площадь
 * ушла бы вниз от нуля, показывая «столько же, только со знаком».
 */
function baselineOf(yScale: GrChartScale, plot: Rect): number {
  return Math.min(Math.max(yScale.scale(0), plot.y), plot.y + plot.height)
}

function areaMarks(
  series: readonly NormalizedSeries[],
  xScale: GrChartScale,
  yScale: GrChartScale,
  plot: Rect,
  yScaleRight: GrChartScale | null = null,
): AreaMark[] {
  return series.map((item) => {
    // Шкала и базовая линия берутся у **одной** оси: разойдись они, площадь
    // правой серии заливалась бы до чужого нуля.
    const scale = scaleForAxis(item.axis, yScale, yScaleRight)
    const baseline = baselineOf(scale, plot)
    const paint = resolvedFill.value === 'gradient'
      ? `url(#${gradientBase}-${item.colorIndex})`
      : item.style.fill

    if (props.stacked) {
      const band = toStackBand(item, xScale, scale)

      return { key: item.id, d: bandPath(band.top, band.base, resolvedCurve.value), fill: paint, color: item.style.color }
    }

    return {
      key: item.id,
      d: areaPath(toPixelPoints(item, xScale, scale), baseline, resolvedCurve.value),
      fill: paint,
      color: item.style.color,
    }
  })
}

interface GradientStop {
  id: string
  color: string
  y1: number
  y2: number
}

/**
 * Градиент на серию, натянутый **от её собственной вершины до базовой линии**.
 *
 * Привязать его к области построения было бы проще, но тогда невысокий ряд
 * получал бы заливку, уже наполовину выцветшую в самой своей верхней точке: у
 * ряда, занимающего нижнюю треть холста, под линией оставалось бы процентов
 * пять непрозрачности вместо заявленных двадцати восьми. Каждая площадь обязана
 * читаться одинаково независимо от уровня.
 */
function gradientStops(
  series: readonly NormalizedSeries[],
  yScale: GrChartScale,
  plot: Rect,
  yScaleRight: GrChartScale | null = null,
): GradientStop[] {
  return series.map((item) => {
    const scale = scaleForAxis(item.axis, yScale, yScaleRight)
    const baseline = baselineOf(scale, plot)
    const values = item.points.map(point => point.y).filter((value): value is number => value !== null)
    const top = values.length > 0 ? scale.scale(Math.max(...values)) : plot.y
    const bottom = values.length > 0 ? scale.scale(Math.min(...values)) : plot.y + plot.height

    return {
      id: `${gradientBase}-${item.colorIndex}`,
      color: item.style.fill,
      // Градиент натянут на всю закрашиваемую фигуру, включая её часть под
      // базовой линией: у ряда, уходящего в минус, иначе весь минус оказывался
      // бы за концом градиента и красился последним стопом, то есть никак.
      y1: Math.min(top, baseline),
      // Вырожденный случай (ряд лежит на базовой линии) дал бы градиент нулевой
      // высоты, а его браузер рисует первым стопом на всю фигуру.
      y2: Math.max(bottom, baseline, Math.min(top, baseline) + 1),
    }
  })
}

/** Верхний край полосы: в стеке это сумма, вне стека — само значение. */
function edgePoints(
  series: NormalizedSeries,
  xScale: GrChartScale,
  yScale: GrChartScale,
  yScaleRight: GrChartScale | null = null,
) {
  const scale = scaleForAxis(series.axis, yScale, yScaleRight)

  return props.stacked
    ? toStackBand(series, xScale, scale).top
    : toPixelPoints(series, xScale, scale)
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
    :role-description="stacked === '100%'
      ? t('grCharts.area.labelNormalized', 'Stacked area chart, 100%')
      : stacked ? t('grCharts.area.labelStacked', 'Stacked area chart')
        : t('grCharts.area.label', 'Area chart')"
    :x-tick-count="xTickCount"
    :y-tick-count="yTickCount"
    :x-tick-format="xTickFormat"
    :y-tick-format="yTickFormat"
    :value-format="valueFormat"
    :references="references"
    :y-tick-format-right="yTickFormatRight"
    :value-format-right="valueFormatRight"
    data-gr-chart-area
    @update:active-index="value => emit('update:activeIndex', value)"
    @point-click="value => emit('pointClick', value)"
    @point-hover="value => emit('pointHover', value)"
    @legend-toggle="onLegendToggle"
  >
    <template #header>
<slot name="header" />
</template>

    <template #plot="{ plot, xScale: sx, yScale: sy, yScaleRight: syr, visibleSeries, activeIndex: cursor, clipPathId }">
      <defs v-if="resolvedFill === 'gradient'">
        <linearGradient
          v-for="stop in gradientStops(visibleSeries, sy, plot, syr)"
          :id="stop.id"
          :key="stop.id"
          gradientUnits="userSpaceOnUse"
          :x1="plot.x"
          :y1="stop.y1"
          :x2="plot.x"
          :y2="stop.y2"
        >
          <stop offset="0%" :stop-color="stop.color" :stop-opacity="fillOpacity" />
          <stop offset="100%" :stop-color="stop.color" :stop-opacity="areaFillFade" />
        </linearGradient>
      </defs>

      <g :clip-path="`url(#${clipPathId})`" data-gr-chart-area-body>
        <path
          v-for="mark in areaMarks(visibleSeries, sx, sy, plot, syr)"
          :key="mark.key"
          :data-gr-chart-area-fill="mark.key"
          :d="mark.d"
          :fill="mark.fill"
          :fill-opacity="resolvedFill === 'gradient' ? undefined : fillOpacity"
          stroke="none"
        />

        <path
          v-for="item in visibleSeries"
          :key="item.id"
          :data-gr-chart-series="item.id"
          :d="linePath(edgePoints(item, sx, sy, syr), resolvedCurve)"
          fill="none"
          :stroke="item.style.color"
          :stroke-width="areaStrokeWidth"
          :stroke-dasharray="item.style.dashArray"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <path
          v-for="mark in (showMarkers ? symbolMarks(visibleSeries, sx, sy, markerSize, stacked !== false, syr) : [])"
          :key="mark.key"
          :d="mark.d"
          :fill="mark.color"
          :stroke="areaPointHalo"
          stroke-width="1.5"
        />

        <path
          v-for="mark in activeSymbolMarks(visibleSeries, sx, sy, activeX(cursor), markerSize * ACTIVE_MARKER_SCALE, stacked !== false, syr)"
          :key="mark.key"
          data-gr-chart-active-point
          :d="mark.d"
          :fill="mark.color"
          :stroke="areaPointHalo"
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
