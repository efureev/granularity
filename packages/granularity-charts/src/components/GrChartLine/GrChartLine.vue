<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { type GrChartScaleKind, scaleForAxis } from '../../chart/chartScale'
import type { GrChartSeries, GrChartXValue, NormalizedSeries } from '../../chart/chartModel'
import { normalizeChartData, resolveScaleKind, resolveXWindow } from '../../chart/chartModel'
import type { GrChartReference } from '../../chart/chartReference'
import { referenceDomainValues } from '../../chart/chartReference'
import { activeSymbolMarks, symbolMarks, toPixelPoints } from '../../chart/chartMarks'
import { bridgePath, dashArrayFor, type GrChartCurve, linePath } from '../../chart/chartPath'
import type { ChartTickFormat } from '../../composables/useChartTicks'
import type { GrChartActivePoint } from '../../composables/useChartTooltip'
import type { GrChartZoom } from '../../composables/internal/useChartZoom'
import type { GrChartXWindow } from '../../chart/chartZoom'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import {
  ACTIVE_MARKER_SCALE,
  AUTO_MARKERS_LIMIT,
  type GrChartSize,
  markerSizes,
} from '../GrChartFrame/chartFrameStyles'
import { GAP_DASH, gapStrokeOpacity, lineStrokeWidth, pointHaloStroke } from './grChartLineStyles'

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
  /**
   * Чем закрыть разрыв ряда.
   *
   * `hidden` — ничем: линия рвётся, и это честнее всего. `shadow` и `dashed`
   * рисуют перемычку, заметно отличную от линии, — она показывает, куда ряд
   * ушёл за время без замеров, но собой данными не притворяется.
   */
  gaps?: 'hidden' | 'shadow' | 'dashed'
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
  /**
   * Когда прореживать ряд для рисунка (LTTB).
   *
   * `'auto'` включается, только когда точек больше бюджета: выше двух вершин на
   * пиксель SVG всё равно не покажет того, что выбросил бы алгоритм, а платит за
   * это длиной строки `d`. Прорежённые точки идут **только** в рисунок — курсор,
   * клавиатура, тултип и скрытая таблица знают полный ряд.
   */
  decimate?: 'auto' | 'always' | 'never'
  /** Бюджет точек на серию. Не задан — считается от ширины области построения. */
  maxPoints?: number
  /**
   * Порог, выше которого маркеры не рисуются даже при `showPoints: 'always'`.
   *
   * На `'auto'` при дефолтах не влияет: тот отсекает марки раньше, на
   * `AUTO_MARKERS_LIMIT`. Влиять начинает, если задать порог ниже него.
   */
  canvasThreshold?: number
  /**
   * Какими жестами пользователь меняет видимое окно. По умолчанию — никакими.
   *
   * Управляется только указателем; клавиатурного пути к окну у графика нет.
   * Поэтому окно и выведено наружу как `v-model:xWindow` — приложение обязано
   * дать к нему свой доступный путь: кнопку сброса, поля диапазона.
   */
  zoom?: GrChartZoom
  /**
   * Видимое окно по абсциссе — `v-model:xWindow`. `null` — весь ряд.
   *
   * Окно **выбирает данные**, а не обрезает рисунок: по нему считаются позиции,
   * курсор, клавиатура, скрытая таблица и размах оси значений. Прореживание —
   * противоположный случай, оно рисунку невидимо и полный ряд не трогает.
   * Отсюда же следствие: `activeIndex` адресует текущее окно.
   */
  xWindow?: readonly [GrChartXValue, GrChartXValue] | null
  /**
   * Потолок строк скрытой таблицы данных.
   *
   * `'auto'` (по умолчанию) — столько же, сколько вершин в рисунке: выше
   * потолка таблица печатает те же точки, что нарисованы, и говорит об этом
   * пометкой. Число задаёт свой потолок, `Infinity` снимает его совсем,
   * `dataTable: 'off'` убирает таблицу целиком — что из этого нужно, решает
   * приложение.
   */
  dataTableMaxRows?: number | 'auto'
}

export interface GrChartLineEmits {
  (e: 'update:hiddenSeries', value: string[]): void
  (e: 'update:activeIndex', value: number | null): void
  (e: 'update:xWindow', value: GrChartXWindow | null): void
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
  gaps: undefined,
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
  decimate: undefined,
  maxPoints: undefined,
  canvasThreshold: 2000,
  zoom: undefined,
  xWindow: undefined,
  dataTableMaxRows: undefined,
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
const resolvedDecimate = useGrComponentProp('GrChartLine', 'decimate', () => props.decimate, 'auto' as const)
const resolvedMaxPoints = useGrComponentProp('GrChartLine', 'maxPoints', () => props.maxPoints, undefined as unknown as number)
const resolvedZoom = useGrComponentProp('GrChartLine', 'zoom', () => props.zoom, false as GrChartZoom)
const resolvedTableMaxRows = useGrComponentProp('GrChartLine', 'dataTableMaxRows', () => props.dataTableMaxRows, 'auto' as number | 'auto')
const resolvedHeight = useGrComponentProp('GrChartLine', 'height', () => props.height, 256)
const resolvedCurve = useGrComponentProp('GrChartLine', 'curve', () => props.curve, 'linear' as GrChartCurve)
const resolvedGaps = useGrComponentProp('GrChartLine', 'gaps', () => props.gaps, 'hidden' as const)

/** Узор перемычки: штрих — рисунком, тень — яркостью. */
const gapDashArray = computed(() => (resolvedGaps.value === 'dashed' ? dashArrayFor(GAP_DASH, 2) : undefined))
const gapOpacity = computed(() => (resolvedGaps.value === 'shadow' ? gapStrokeOpacity : undefined))
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

/**
 * Окно живёт здесь, а не в раме: оно уходит в нормализацию данных, а рама
 * получает уже готовую модель. Пропом окно только синхронизируется — без
 * привязки график приближается сам по себе.
 */
const ownWindow = ref<GrChartXWindow | null>(null)

// `undefined` и `null` тут разное: первое — «окном никто не управляет», второе —
// «управляет и просит весь ряд». Слей их `??`, и сброс снаружи возвращал бы
// последнее приближение, сделанное жестом.
const xWindow = computed<GrChartXWindow | null>(() => (
  props.xWindow === undefined ? ownWindow.value : resolveXWindow(scaleKind.value, props.xWindow)
))

function applyWindow(value: GrChartXWindow | null): void {
  ownWindow.value = value
  emit('update:xWindow', value)
}

const data = computed(() => normalizeChartData(seriesInput.value, {
  kind: scaleKind.value,
  includeZero: props.includeZero,
  yDomain: props.yDomain,
  includeXValues: referenceDomain.value.x,
  includeYValues: referenceDomain.value.y,
  dualAxis: props.dualAxis,
  yDomainRight: props.yDomainRight,
  xWindow: xWindow.value,
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

  return props.showPoints === 'always' || total <= AUTO_MARKERS_LIMIT
})

const markerSize = computed(() => markerSizes[resolvedSize.value])

/** Позиция курсора — в абсциссу ряда: марки ищутся по ней, а не по индексу. */
function activeX(cursor: number | null): number | undefined {
  return cursor === null ? undefined : data.value.positions[cursor]
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
    :decimate="resolvedDecimate"
    :max-points="resolvedMaxPoints"
    :zoom="resolvedZoom"
    :x-window="xWindow"
    :data-table-max-rows="resolvedTableMaxRows"
    :aria-label="ariaLabel"
    :aria-description="ariaDescription"
    :role-description="t('grCharts.line.label', 'Line chart')"
    :x-tick-count="xTickCount"
    :y-tick-count="yTickCount"
    :x-tick-format="xTickFormat"
    :y-tick-format="yTickFormat"
    :value-format="valueFormat"
    :references="references"
    :y-tick-format-right="yTickFormatRight"
    :value-format-right="valueFormatRight"
    data-gr-chart-line
    @update:active-index="value => emit('update:activeIndex', value)"
    @update:x-window="applyWindow"
    @point-click="value => emit('pointClick', value)"
    @point-hover="value => emit('pointHover', value)"
    @legend-toggle="onLegendToggle"
  >
    <template #header>
<slot name="header" />
</template>

    <!--
      Рисуй по `drawSeries`, утверждай по `visibleSeries`: активная марка стоит
      на конкретном значении, и брать его из прорежённой выборки нельзя — она
      сводка, а не данные.
    -->
    <template #plot="{ xScale: sx, yScale: sy, yScaleRight: syr, visibleSeries, drawSeries, activeIndex: cursor, clipPathId }">
      <g :clip-path="`url(#${clipPathId})`" data-gr-chart-line-body>
        <!--
          Перемычки идут ПОД линией и под марками: разрыв не должен спорить с
          тем, что действительно измерено.
        -->
        <path
          v-for="item in (resolvedGaps === 'hidden' ? [] : drawSeries)"
          :key="`gap-${item.id}`"
          :data-gr-chart-gap="item.id"
          :d="bridgePath(toPixelPoints(item, sx, scaleForAxis(item.axis, sy, syr)))"
          fill="none"
          :stroke="item.style.color"
          :stroke-width="lineStrokeWidth"
          :stroke-opacity="gapOpacity"
          :stroke-dasharray="gapDashArray"
          stroke-linecap="butt"
        />

        <path
          v-for="item in drawSeries"
          :key="item.id"
          :data-gr-chart-series="item.id"
          :d="linePath(toPixelPoints(item, sx, scaleForAxis(item.axis, sy, syr)), resolvedCurve)"
          fill="none"
          :stroke="item.style.color"
          :stroke-width="lineStrokeWidth"
          :stroke-dasharray="item.style.dashArray"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <path
          v-for="marker in (showMarkers ? symbolMarks(drawSeries, sx, sy, markerSize, false, syr) : [])"
          :key="marker.key"
          :d="marker.d"
          :fill="marker.color"
          :stroke="pointHaloStroke"
          stroke-width="1.5"
        />

        <path
          v-for="marker in activeSymbolMarks(visibleSeries, sx, sy, activeX(cursor), markerSize * ACTIVE_MARKER_SCALE, false, syr)"
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
