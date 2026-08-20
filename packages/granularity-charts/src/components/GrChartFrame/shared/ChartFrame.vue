<script setup lang="ts">
import GrEmptyState from '@feugene/granularity/components/GrEmptyState'
import GrSkeleton from '@feugene/granularity/components/GrSkeleton'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useFloating } from '@feugene/granularity/composables/useFloating'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, onScopeDispose, ref, shallowRef, useId, watch } from 'vue'

import { decimateChartData, decimateSeriesGroup, decimationBudget } from '../../../chart/chartDecimate'
import type { GrChartNumberFormat } from '../../../chart/chartFormat'
import { formatNumber, formatTimeSequence, formatTimeValue, formatValue } from '../../../chart/chartFormat'
import { chartLayout, type Rect } from '../../../chart/chartLayout'
import { linePath } from '../../../chart/chartPath'
import type { ChartData, NormalizedPoint, NormalizedSeries } from '../../../chart/chartModel'
import type { GrChartReference } from '../../../chart/chartReference'
import { normalizeReferences } from '../../../chart/chartReference'
import { createScale, type GrChartScale, linearScale } from '../../../chart/chartScale'
import { alignedTicks, linearTicks, timeTicks } from '../../../chart/chartTicks'
import { type ChartTableModel, chartTableModel, trimTableModel } from '../../../chart/chartTable'
import { useChartScale } from '../../../composables/useChartScale'
import { type ChartTick, type ChartTickFormat, useChartTicks } from '../../../composables/useChartTicks'
import { type ChartHitContext, type GrChartActivePoint, useChartTooltip } from '../../../composables/useChartTooltip'
import type { ChartKeyboardOptions } from '../../../composables/internal/useChartA11y'
import { useChartA11y } from '../../../composables/internal/useChartA11y'
import { useElementSize } from '../../../composables/internal/useElementSize'
import type { GrChartZoom } from '../../../composables/internal/useChartZoom'
import { useChartZoom } from '../../../composables/internal/useChartZoom'
import type { GrChartXWindow } from '../../../chart/chartZoom'
import ChartAxis from './ChartAxis.vue'
import ChartBrush from './ChartBrush.vue'
import ChartDataTable from './ChartDataTable.vue'
import { shouldUseCanvas } from '../../../chart/chartCanvasMode'
import ChartGrid from './ChartGrid.vue'
import ChartLegend from './ChartLegend.vue'
import ChartReferences from './ChartReferences.vue'
import ChartTooltip from './ChartTooltip.vue'
import {
  crosshairStroke,
  frameGhostClass,
  ghostStroke,
  gridStroke,
  gridStrokeWidth,
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
  /** Шкала правой оси. `null` — второй оси нет, серия `axis: 'right'` падает на левую. */
  yScaleRight: GrChartScale | null
  data: ChartData
  /**
   * Полные серии. По ним считается всё, что **утверждает** значение: активная
   * марка, попадание, тултип.
   */
  visibleSeries: readonly NormalizedSeries[]
  /**
   * Серии для **рисования**: те же объекты, но, возможно, прорежённые.
   *
   * Контракт: рисуй по `drawSeries`, утверждай по `visibleSeries`. Без
   * прореживания это один и тот же массив по ссылке.
   */
  drawSeries: readonly NormalizedSeries[]
  /**
   * Рисовать ли тело на холсте.
   *
   * Решает рама, а не компонент: порог считается по **нарисованным** вершинам,
   * а прореживание живёт здесь же. Компоненту остаётся выбрать ветку.
   */
  useCanvas: boolean
  xTicks: readonly ChartTick[]
  yTicks: readonly ChartTick[]
  activeIndex: number | null
  /** Активная серия. У матрицы это строка; декартовы графики её игнорируют. */
  activeSeriesIndex: number
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
  /**
   * Порог перехода на холст в **нарисованных вершинах**.
   *
   * Ноль — холста нет вовсе: так рама ведёт себя для типов, которым второй
   * рендерер не нужен. Считает рама, потому что прореживание живёт здесь.
   */
  canvasThreshold?: number
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom'
  tooltip?: boolean
  loading?: boolean
  empty?: boolean
  emptyText?: string
  dataTable?: 'hidden' | 'visible' | 'off'
  interactive?: boolean
  activeIndex?: number | null
  /** Курсор по сериям — `v-model:activeSeriesIndex` у матрицы. */
  activeSeriesIndex?: number
  locale?: string
  ariaLabel?: string
  ariaDescription?: string
  /** Чем себя называет график: «линейный график», «столбцы». */
  roleDescription?: string
  /**
   * Роль оверлея. Дефолт — `application`: у графика своя карта клавиш, и роль
   * обязана её включить.
   *
   * `meter` у bullet: там не приложение, а величина на шкале, и
   * `aria-valuenow` без этой роли не значит ничего. Роль с презентационными
   * потомками здесь безопасна — оверлей пуст, а скрытая таблица ему сиблинг.
   */
  surfaceRole?: string
  /** Атрибуты оверлея сверх имени: `aria-valuenow` и соседи у `meter`. */
  surfaceAttrs?: Record<string, string | number | undefined>
  xTickCount?: number
  yTickCount?: number
  xTickFormat?: ChartTickFormat
  yTickFormat?: (value: number) => string
  /** Формат подписей правой оси: у неё свои единицы, иначе она их и не заслужила. */
  yTickFormatRight?: (value: number) => string
  valueFormat?: GrChartNumberFormat
  /** Формат значений правой оси в тултипе, таблице и объявлении. */
  valueFormatRight?: GrChartNumberFormat
  /** Вертикаль под активной точкой. У круга её нет: там активна доля, а не абсцисса. */
  crosshair?: boolean
  /**
   * Опорные линии и полосы: порог, план, коридор допустимого.
   *
   * Слой рисует рама, а не компонент, и это не удобство. Опора обязана дойти до
   * читателя без зрения — через `aria-description` поверхности и `<tfoot>`
   * скрытой таблицы, — а собирает то и другое рама. Разложи слой по трём
   * компонентам, и порядок «под марками, над сеткой» пришлось бы соблюдать
   * трижды, причём его нарушение молчит: порядка элементов не видит ни один
   * гейт.
   *
   * Домен опора не расширяет: это решает компонент пропом
   * `includeReferencesInDomain`.
   */
  references?: readonly GrChartReference[]
  /**
   * Когда прореживать ряд для рисунка.
   *
   * `'auto'` — только когда точек больше бюджета; `'always'` — всегда;
   * `'never'` — никогда. Прорежённые точки идут **только** в рисунок: курсор,
   * клавиатура, тултип и скрытая таблица продолжают знать полный ряд.
   */
  decimate?: 'auto' | 'always' | 'never'
  /** Бюджет точек на серию. Не задан — считается от ширины области построения. */
  maxPoints?: number
  /**
   * Общий набор абсцисс на всю группу серий.
   *
   * Нужен стеку: независимо прорежённые серии выбрали бы разные точки, и полосы
   * разошлись бы швами.
   */
  decimateSharedX?: boolean
  /**
   * Рисует ли слой опор сама рама.
   *
   * `false` ставит компонент, у которого своя система координат: рама считает
   * опору своими шкалами, и при горизонтальной раскладке порог по значению лёг
   * бы поперёк области. Текст опоры рама несёт в любом случае —
   * `aria-description` и строка `<tfoot>` не зависят от того, кто рисует линию,
   * поэтому читатель без зрения порог не теряет.
   */
  referenceLayer?: boolean
  /**
   * Точки, зависящие от системы координат. Дефолты декартовы; круг подменяет
   * их, потому что у него попадание угловое, якорь тултипа — центроид доли,
   * строка таблицы — доля, а описание точки включает процент.
   */
  hitTest?: (point: { x: number, y: number }, context: ChartHitContext) => number
  /**
   * Строка под указателем: у матрицы попадание двумерное. `-1` — мимо.
   *
   * Отдельным пропом, а не внутри `hitTest`: `useChartTooltip` знает одну ось и
   * должен таким остаться — вторая координата ему не нужна ни для чего.
   */
  hitSeries?: (point: { x: number, y: number }, context: ChartHitContext) => number
  anchorPoint?: (index: number, context: ChartHitContext) => { x: number, y: number } | null
  tableModel?: ChartTableModel
  describePoint?: (index: number, seriesIndex: number) => string
  /** Карта клавиш под свою систему координат. Не задана — декартова. */
  keyboard?: ChartKeyboardOptions
  /**
   * Какими жестами меняется видимое окно. `false` — приближения нет.
   *
   * Рама только производит окно и рисует полосу выделения; владеет окном
   * компонент — оно уходит в нормализацию данных, а рама получает уже готовые.
   */
  zoom?: GrChartZoom
  /** Текущее окно; `null` — весь ряд. */
  xWindow?: GrChartXWindow | null
  /**
   * Потолок строк скрытой таблицы. `'auto'` — столько же, сколько вершин в
   * рисунке; число — явный потолок; `Infinity` — полный ряд всегда.
   */
  dataTableMaxRows?: number | 'auto'
}

export interface ChartFrameEmits {
  (e: 'update:activeIndex', value: number | null): void
  (e: 'pointClick', value: GrChartActivePoint): void
  (e: 'pointHover', value: GrChartActivePoint | null): void
  (e: 'update:activeSeriesIndex', value: number): void
  (e: 'legendToggle', value: { seriesId: string, hidden: boolean }): void
  (e: 'update:xWindow', value: GrChartXWindow | null): void
}

const props = withDefaults(defineProps<ChartFrameProps>(), {
  height: 256,
  width: 640,
  size: 'md',
  axes: true,
  showGrid: 'y',
  canvasThreshold: 0,
  showLegend: false,
  legendPosition: 'bottom',
  tooltip: true,
  loading: false,
  empty: undefined,
  emptyText: undefined,
  dataTable: 'hidden',
  interactive: true,
  activeIndex: undefined,
  activeSeriesIndex: undefined,
  locale: undefined,
  ariaLabel: undefined,
  ariaDescription: undefined,
  roleDescription: undefined,
  surfaceRole: undefined,
  surfaceAttrs: undefined,
  xTickCount: 6,
  yTickCount: 5,
  xTickFormat: undefined,
  yTickFormat: undefined,
  yTickFormatRight: undefined,
  valueFormat: undefined,
  valueFormatRight: undefined,
  crosshair: true,
  decimate: 'never',
  maxPoints: undefined,
  decimateSharedX: false,
  referenceLayer: true,
  references: undefined,
  hitTest: undefined,
  hitSeries: undefined,
  anchorPoint: undefined,
  tableModel: undefined,
  describePoint: undefined,
  keyboard: undefined,
  zoom: false,
  xWindow: null,
  dataTableMaxRows: 'auto',
})

const emit = defineEmits<ChartFrameEmits>()

defineSlots<{
  /** Марки графика: линия, площадь, столбцы. */
  plot?: (props: ChartPlotScope) => unknown
  /**
   * Тело графика на холсте вместо SVG-марок.
   *
   * Слот отдельный от `plot`, потому что `<canvas>` ребёнком `<svg>` не бывает:
   * содержимое кладётся в обёртку области построения, под сам `<svg>`. Есть
   * слот — сетку рисует холст, иначе она легла бы поверх рядов.
   */
  canvas?: (props: ChartPlotScope) => unknown
  /**
   * Своя панель тултипа.
   *
   * Указателя она не перехватывает: панель висит над областью построения, и
   * любой её хит закрывал бы тултип, из-за которого она и появилась.
   * Интерактивному содержимому здесь места нет — ему место в `header` или в
   * обработчике `pointClick`.
   */
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
const yTicksLeft = computed(() => linearTicks(props.data.yDomain, props.yTickCount))
const niceYDomain = computed<[number, number]>(() => yTicksLeft.value.niceDomain)

/**
 * Правая ось не выбирает своё число делений.
 *
 * Две «красивые» лестницы дают разное количество линий, сетка от этого двоится
 * и становится нечитаемой. Счёт приходит от левой оси; сетка рисуется тоже по
 * левой, а правая даёт только подписи.
 */
const rightTicks = computed(() => (props.data.yDomainRight === undefined
  ? null
  : alignedTicks(props.data.yDomainRight, yTicksLeft.value.values.length)))

const hasRightAxis = computed(() => rightTicks.value !== null)

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
 * Подписи правой оси строятся по её **готовым** делениям, а не через
 * `useChartTicks`: тот пересчитал бы лестницу заново от `yTickCount` и вернул
 * своё число линий — ровно то расхождение, ради которого и заведён
 * `alignedTicks`.
 */
const yLabelsRight = computed<ChartTick[]>(() => (rightTicks.value?.values ?? []).map(value => ({
  value,
  position: 0,
  label: props.yTickFormatRight?.(value) ?? formatNumber(value, { locale: resolvedLocale.value }),
})))

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

/**
 * Призрак графика на время загрузки.
 *
 * Форма фиксированная и намеренно **не похожа на данные**: рисуется приглушённым
 * `--gr-muted-fg`, а не цветом серии, — иначе читатель начнёт считывать с неё
 * тренд, которого ещё нет. Задача призрака одна: сказать «здесь будет линия», а
 * не «вот линия».
 *
 * Считается один раз на модуль: геометрия не зависит ни от данных, ни от
 * размера — холст растягивается сам.
 */
const GHOST_VIEW = { width: 100, height: 40 } as const

/**
 * Приглушение призрака — не декоративная мелочь.
 *
 * `--gr-muted-fg` в светлой теме достаточно тёмный, чтобы линия читалась как
 * настоящий ряд; на полупрозрачности она остаётся видимой, но очевидно
 * незавершённой — и одинаково ведёт себя в обеих темах, потому что роль
 * подстраивается сама.
 */
const GHOST_OPACITY = 0.45
const GHOST_FRACTIONS = [0.62, 0.5, 0.68, 0.34, 0.42, 0.26, 0.3, 0.14]
const GHOST_GRID = [0.25, 0.5, 0.75]

const GHOST_PATH = linePath(
  GHOST_FRACTIONS.map((fraction, index) => ({
    x: (index / (GHOST_FRACTIONS.length - 1)) * GHOST_VIEW.width,
    y: fraction * GHOST_VIEW.height,
  })),
  'smooth',
)

const reserveAxes = computed(() => props.axes && (props.loading || !isEmpty.value))

const layout = computed(() => chartLayout({
  width: width.value,
  height: props.height,
  yTickLabels: props.loading ? [LOADING_Y_LABEL] : showAxes.value ? yLabels.value.map(tick => tick.label) : [],
  yTickLabelsRight: showAxes.value && hasRightAxis.value ? yLabelsRight.value.map(tick => tick.label) : [],
  showYAxisRight: reserveAxes.value && hasRightAxis.value,
  xTickLabels: props.loading ? [LOADING_X_LABEL] : showAxes.value ? xLabels.value.map(tick => tick.label) : [],
  fontSizePx: fontSizePx.value,
  showYAxis: reserveAxes.value,
  showXAxis: reserveAxes.value,
}))

const plot = computed(() => layout.value.plot)

/**
 * Серии для рисунка.
 *
 * Считает рама, а не компонент в слоте: у неё лежат и область построения, и
 * список видимых серий, а `computed` мемоизирует результат. В слоте тот же
 * расчёт шёл бы на каждое движение указателя — слот перерисовывается вместе с
 * активной точкой.
 */
/** Бюджет вершин рисунка; `null` — прореживания нет. Его же берёт таблица при `'auto'`. */
const drawBudget = computed(() => decimationBudget({
  mode: props.decimate,
  kind: props.data.kind,
  plotWidth: plot.value.width,
  maxPoints: props.maxPoints,
  total: visibleSeries.value.reduce((max, series) => Math.max(max, series.points.length), 0),
}))

const drawSeries = computed<readonly NormalizedSeries[]>(() => {
  const budget = drawBudget.value

  if (budget === null)
    return visibleSeries.value

  return decimateSeriesGroup(visibleSeries.value, { maxPoints: budget, sharedX: props.decimateSharedX })
})

/** Режим рисования: решает рама, потому что прореживание живёт здесь же. */
const useCanvas = computed(() => shouldUseCanvas(drawSeries.value, props.canvasThreshold))

const plotStyle = computed(() => ({
  left: `${plot.value.x}px`,
  top: `${plot.value.y}px`,
  width: `${plot.value.width}px`,
  height: `${plot.value.height}px`,
}))

/**
 * Высота области построения.
 *
 * Пустому графику площадь не нужна: рисовать там нечего, и две пустые карточки
 * рядом съедали бы по `height` каждая ради одной фразы. Ограничение сверху
 * заданной высотой обязательно — иначе график, которому явно задали 80px, от
 * пустоты бы вырос.
 *
 * Загрузка высоту сохраняет: скелет занимает место будущего графика, иначе
 * страница прыгнет в момент прихода данных.
 */
const frameHeightStyle = computed(() => ({
  height: isEmpty.value && !props.loading
    ? `min(${props.height}px, var(--gr-chart-frame-empty-height, 8rem))`
    : `${props.height}px`,
}))

const { xScale, yScale, yScaleRight } = useChartScale({
  data: () => props.data,
  plot: () => plot.value,
  yDomain: () => niceYDomain.value,
  yDomainRight: () => rightTicks.value?.niceDomain,
})

function withPosition(ticks: readonly ChartTick[], scale: GrChartScale): ChartTick[] {
  return ticks.map(tick => ({ ...tick, position: scale.scale(tick.value) }))
}

const xTicks = computed(() => withPosition(xLabels.value, xScale.value))
const yTicks = computed(() => withPosition(yLabels.value, yScale.value))
const yTicksRight = computed(() => (yScaleRight.value === null ? [] : withPosition(yLabelsRight.value, yScaleRight.value)))

const tooltipApi = useChartTooltip({
  data: () => props.data,
  xScale: () => xScale.value,
  yScale: () => yScale.value,
  yScaleRight: () => yScaleRight.value,
  plot: () => plot.value,
  surface: surfaceEl,
  // Во время протяжки тултип молчит: панель под рукой закрывала бы ровно тот
  // участок, который сейчас выделяют.
  enabled: () => props.tooltip && props.interactive && !isEmpty.value && !isBrushing(),
  hitTest: props.hitTest,
  anchor: props.anchorPoint,
})

const zoomApi = useChartZoom({
  mode: () => (props.interactive && !isEmpty.value ? props.zoom ?? false : false),
  surface: surfaceEl,
  plot: () => plot.value,
  xScale: () => xScale.value,
  positions: () => props.data.positions,
  full: () => props.data.fullXDomain,
  window: () => props.xWindow ?? null,
  apply: value => emit('update:xWindow', value),
  cursor: () => {
    const index = tooltipApi.activeIndex.value

    return index === null ? null : props.data.positions[index] ?? null
  },
})

/**
 * Тултип и приближение ссылаются друг на друга: одному нужна активная точка,
 * другому — знание, что идёт протяжка. Поднятая функция разрывает порядок
 * объявления, не заводя третьего состояния.
 */
function isBrushing(): boolean {
  return zoomApi.brushing.value
}

const { floatingStyle } = useFloating(anchorEl, tooltipEl, tooltipApi.open, {
  placement: 'top',
  offsetPx: 12,
  zIndexVar: '--gr-z-tooltip',
})

const activeSeriesIndex = ref(0)

function formatX(point: NormalizedPoint): string {
  if (props.data.kind === 'band')
    return props.data.categories[point.x] ?? String(point.raw)

  return formatXValue(point.x)
}

/** Абсцисса без точки: границы окна — это значения шкалы, а не данные. */
function formatXValue(x: number): string {
  return props.data.kind === 'time'
    ? formatTimeValue(x, resolvedLocale.value)
    : formatNumber(x, { locale: resolvedLocale.value })
}

/**
 * Смена окна — в живой регион.
 *
 * Приближение меняет и рисунок, и содержимое скрытой таблицы: без объявления
 * читатель без зрения обнаружил бы подмену только по следующей стрелке.
 */
watch(() => props.xWindow, (value, previous) => {
  if (!props.interactive || sameWindow(value ?? null, previous ?? null))
    return

  announce(value
    ? t('grCharts.zoom.window', 'Showing {from} to {to}, {points} points', {
        from: formatXValue(value[0]),
        to: formatXValue(value[1]),
        points: props.data.positions.length,
      })
    : t('grCharts.zoom.reset', 'Full range'))
})

function sameWindow(a: GrChartXWindow | null, b: GrChartXWindow | null): boolean {
  if (a === null || b === null)
    return a === b

  return a[0] === b[0] && a[1] === b[1]
}

const numberFormat = computed<GrChartNumberFormat>(() => ({
  locale: resolvedLocale.value,
  ...props.valueFormat,
}))

/** Правая ось меряет в своих единицах — и форматируется своим форматом. */
const numberFormatRight = computed<GrChartNumberFormat>(() => ({
  locale: resolvedLocale.value,
  ...(props.valueFormatRight ?? props.valueFormat),
}))

function formatPointValue(value: number | null, axis: 'left' | 'right' = 'left'): string {
  const format = axis === 'right' ? numberFormatRight.value : numberFormat.value

  return formatValue(value, format, t('grCharts.chart.noValue', 'no value'))
}

/**
 * Опоры считаются по **расширенному** домену оси значений, а не по домену
 * данных: рисует их та же шкала, что и марки, и «за пределами» обязано значить
 * то же самое для обеих.
 */
const normalizedReferences = computed(() => normalizeReferences(props.references ?? [], {
  kind: props.data.kind,
  categories: props.data.categories,
  xDomain: props.data.xDomain,
  yDomain: niceYDomain.value,
}))

function formatReferenceValue(axis: 'x' | 'y', value: number): string {
  if (axis === 'y')
    return formatPointValue(value)
  if (props.data.kind === 'time')
    return formatTimeValue(value, resolvedLocale.value)
  if (props.data.kind === 'band')
    return props.data.categories[value] ?? String(value)

  return formatNumber(value, { locale: resolvedLocale.value })
}

/**
 * Опора текстом — для описания графика и для скрытой таблицы.
 *
 * Опора, существующая только визуально, — худший вид ложной доступности:
 * зрячий видит порог и сравнивает с ним, читающий без зрения получает ряд без
 * системы отсчёта и об этом не догадывается.
 */
const referenceDescriptions = computed<string[]>(() => normalizedReferences.value.map((reference) => {
  const value = reference.band
    ? t('grCharts.reference.band', '{from} to {to}', {
        from: formatReferenceValue(reference.axis, reference.from),
        to: formatReferenceValue(reference.axis, reference.to),
      })
    : formatReferenceValue(reference.axis, reference.from)

  return reference.label
    ? t('grCharts.reference.labeled', '{label}: {value}', { label: reference.label, value })
    : t('grCharts.reference.plain', 'Reference: {value}', { value })
}))

/**
 * Описание графика вместе с опорами.
 *
 * Опора за пределами домена в описание всё равно попадает: «порог не виден» и
 * «порога нет» — разные утверждения, и отличить их читателю больше нечем.
 */
const surfaceDescription = computed(() => {
  // Подсказка про приближение живёт здесь, а не в имени: имя потребитель
  // перебивает пропом `ariaLabel` (и почти всегда перебивает), а описание
  // достраивается к его собственному.
  const zoomHint = props.zoom === false
    ? undefined
    : t('grCharts.zoom.keyboardHint', 'Plus and minus zoom, Shift with arrows pans, zero resets')
  const parts = [props.ariaDescription, ...referenceDescriptions.value, zoomHint].filter(Boolean)

  return parts.length > 0 ? parts.join('. ') : undefined
})

function pointAt(index: number): NormalizedPoint | null {
  const x = props.data.positions[index]

  if (x === undefined)
    return null

  for (const series of visibleSeries.value) {
    const point = series.byX.get(x)

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
    const only = series[0]

    return t('grCharts.chart.point', '{x}. {values}', {
      x: xText,
      values: formatPointValue(only?.byX.get(x)?.y ?? null, only?.axis ?? 'left'),
    })
  }

  const current = series[Math.min(seriesIndex, series.length - 1)]!
  const value = current.byX.get(x)?.y ?? null
  const values = t('grCharts.chart.seriesValue', '{series}: {value}', {
    series: current.label,
    value: formatPointValue(value, current.axis),
  })

  return t('grCharts.chart.point', '{x}. {values}', { x: xText, values })
}

const a11y = useChartA11y({
  data: () => props.data,
  activeIndex: tooltipApi.activeIndex,
  activeSeriesIndex,
  setActive: index => tooltipApi.setActive(index),
  announce: message => announce(message),
  describe: (index, seriesIndex) => (props.describePoint ?? describePoint)(index, seriesIndex),
  onActivate: () => {
    if (tooltipApi.active.value)
      emit('pointClick', tooltipApi.active.value)
  },
  keyboard: () => props.keyboard,
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

/**
 * Подписи строк видимой таблицы для оси времени.
 *
 * Скрытая таблица печатает полную дату в каждой строке и обязана: скринридер
 * читает строку вне соседей. Видимую то же самое превращает в двадцать четыре
 * повтора «12 июл. 2026 г.» подряд — контекст, который мешает сравнивать
 * значения. Здесь он остаётся на первой строке и на каждой смене суток.
 *
 * Единица берётся у той же лестницы, что размечает ось, но по числу строк, а
 * не делений: подписывается ряд данных, а не ось.
 */
const visibleTimeLabels = computed<Map<number, string> | null>(() => {
  if (props.dataTable !== 'visible' || props.data.kind !== 'time')
    return null

  const positions = props.data.positions

  if (positions.length === 0)
    return null

  const { unit } = timeTicks([positions[0]!, positions[positions.length - 1]!], positions.length)

  return new Map(formatTimeSequence(positions, unit, resolvedLocale.value).map((label, index) => [positions[index]!, label]))
})

function formatTableX(point: NormalizedPoint): string {
  return visibleTimeLabels.value?.get(point.x) ?? formatX(point)
}

/**
 * Скрытая таблица догоняет **успокоившееся** окно, а не каждый его шаг.
 *
 * Строк в ней столько же, сколько точек в ряду, и перестроение десяти тысяч —
 * это порядок сотни миллисекунд. Приближение колесом и автоповтором клавиши
 * меняет окно десятки раз в секунду, и синхронная таблица превращала бы жест в
 * очередь перерисовок, из которой график не выбирается.
 *
 * Контракт при этом не меняется: в покое таблица точно совпадает с рисунком.
 * Расходятся они только пока идёт жест — а посреди жеста таблицу никто не
 * читает: смену окна диктор узнаёт из живого региона, и объявление синхронно.
 *
 * Задержка ставится только на смену **окна**: любые другие данные — новые
 * серии, скрытая серия, другой домен — приезжают в таблицу сразу.
 */
const TABLE_SETTLE_MS = 80

const tableData = shallowRef(props.data)
let tableWindow = props.xWindow ?? null
let settleTimer: ReturnType<typeof setTimeout> | null = null

function cancelSettle(): void {
  if (settleTimer === null)
    return

  clearTimeout(settleTimer)
  settleTimer = null
}

watch(() => props.data, (value) => {
  cancelSettle()

  if (sameWindow(props.xWindow ?? null, tableWindow)) {
    tableData.value = value

    return
  }

  settleTimer = setTimeout(() => {
    settleTimer = null
    tableWindow = props.xWindow ?? null
    // Берём свежее, а не захваченное: за время ожидания данные могли уехать
    // дальше окна — например, потребитель скрыл серию.
    tableData.value = props.data
  }, TABLE_SETTLE_MS)
})

onScopeDispose(cancelSettle)

/**
 * Ряд, из которого строится скрытая таблица.
 *
 * Строка на точку — контракт, который держится ровно до тех пор, пока строк
 * можно прочитать. На десяти тысячах он перестаёт кого-либо обслуживать: подряд
 * такую таблицу не читает никто, а перестроение стоит сотню миллисекунд.
 *
 * Выше потолка таблица печатает **те же точки, что нарисованы** — тот же LTTB,
 * тот же бюджет. Это и есть заявленный контракт доступности в его сильной
 * форме: незрячий читает буквально то, что видит зрячий. Поточечная полнота при
 * этом никуда не девается — стрелки обходят весь ряд и проговаривают каждую
 * точку, о чём и сообщает пометка в подвале таблицы.
 *
 * `'auto'` берёт бюджет рисунка: сказал потребитель «рисуй все точки»
 * (`decimate: 'never'`) — таблица тоже полная. Решение о том, включать ли
 * усечение, остаётся за приложением: число задаёт свой потолок, `Infinity`
 * снимает его совсем, `dataTable: 'off'` убирает таблицу целиком.
 */
/**
 * Потолок строк таблицы.
 *
 * `'auto'` берёт бюджет рисунка — тогда таблица показывает буквально
 * нарисованное. Бюджета нет у категориальной оси и при `decimate: 'never'`, и
 * там `'auto'` опускается до фиксированного потолка: выше пятисот строк таблица
 * перестаёт быть таблицей — её не прочитать подряд ни глазами, ни диктором.
 */
const AUTO_TABLE_ROWS = 500

const tableRowCap = computed(() => (
  props.dataTableMaxRows === 'auto'
    ? drawBudget.value ?? AUTO_TABLE_ROWS
    : props.dataTableMaxRows
))

const tableSource = computed<ChartData>(() => {
  const data = tableData.value
  const cap = tableRowCap.value

  if (!Number.isFinite(cap) || data.positions.length <= cap)
    return data

  return decimateChartData(data, cap)
})

const tableModel = computed<ChartTableModel>(() => {
  const source = tableSource.value
  const drawn = source !== tableData.value
  const built = props.tableModel ?? chartTableModel(source, {
    xLabel: t('grCharts.chart.columnX', 'X'),
    caption: t('grCharts.chart.tableCaption', 'Chart data'),
    formatX: formatTableX,
    formatY: formatPointValue,
    axisLabel: axis => (axis === 'right'
      ? t('grCharts.chart.axisRight', 'right axis')
      : t('grCharts.chart.axisLeft', 'left axis')),
  })
  // Страховка на все типы: у категориальной оси бюджета рисунка нет, а шесть
  // типов строят модель сами и сужение по `ChartData` проходят мимо.
  const base = trimTableModel(built, tableRowCap.value)
  const notes = [...referenceDescriptions.value]

  // Усечение обязано быть названо вслух: без пометки таблица выглядит полной, и
  // читатель решит, что между строками ничего не было.
  if (drawn) {
    notes.push(t('grCharts.chart.tableTrimmed', 'Showing {shown} of {total} points — the ones the chart draws. Arrow keys walk all of them.', {
      shown: source.positions.length,
      total: tableData.value.positions.length,
    }))
  }
  else if (base !== built) {
    notes.push(t('grCharts.chart.tableSampled', 'Showing {shown} of {total} rows, evenly spaced. Arrow keys walk all of them.', {
      shown: base.rows.length,
      total: built.rows.length,
    }))
  }

  // Опора приписывается к готовой модели, а не строкой данных: позиции по X у
  // порога нет, и строка утверждала бы её.
  return notes.length === 0 ? base : { ...base, notes: [...(base.notes ?? []), ...notes] }
})

const tooltipTitle = computed(() => {
  const point = tooltipApi.active.value

  return point ? formatX({ x: point.x, y: null, sourceIndex: 0, raw: point.raw }) : ''
})

const plotScope = computed<ChartPlotScope>(() => ({
  plot: plot.value,
  xScale: xScale.value,
  yScale: yScale.value,
  yScaleRight: yScaleRight.value,
  data: props.data,
  visibleSeries: visibleSeries.value,
  drawSeries: drawSeries.value,
  useCanvas: useCanvas.value,
  xTicks: xTicks.value,
  yTicks: yTicks.value,
  activeIndex: tooltipApi.activeIndex.value,
  activeSeriesIndex: activeSeriesIndex.value,
  clipPathId,
}))

/**
 * Строка под указателем — рядом с колонкой, а не внутри `useChartTooltip`.
 *
 * У матрицы попадание двумерное, но тултипу вторая координата не нужна ни для
 * чего: он живёт на одной оси и должен таким остаться.
 */
function onPointerMove(event: PointerEvent): void {
  tooltipApi.onPointerMove(event)

  if (!props.hitSeries || !surfaceEl.value)
    return

  const rect = surfaceEl.value.getBoundingClientRect()
  const row = props.hitSeries(
    { x: event.clientX - rect.left, y: event.clientY - rect.top },
    { plot: plot.value, xScale: xScale.value, yScale: yScale.value, yScaleRight: yScaleRight.value },
  )

  if (row !== -1)
    activeSeriesIndex.value = row
}

function onKeydown(event: KeyboardEvent): void {
  // Приближение спрашивается первым: `Shift`+стрелка иначе увела бы курсор —
  // модификаторы карта позиций не смотрит.
  if (zoomApi.onKeydown(event) || a11y.onKeydown(event))
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

watch(() => props.activeSeriesIndex, (value) => {
  if (value !== undefined && value !== activeSeriesIndex.value)
    activeSeriesIndex.value = value
}, { immediate: true })

watch(activeSeriesIndex, value => emit('update:activeSeriesIndex', value))

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

    <!-- Пустой график легенды не получает: она объясняла бы цвета, которых на
         экране нет. Гасится в раме, а не в обёртках, — тогда правило действует
         и на собственные легенды круга и матрицы, идущие в этот же слот. -->
    <slot
      v-if="showLegend && !isEmpty && legendPosition === 'top'"
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

    <div data-gr-chart-plot class="relative" :style="frameHeightStyle">
      <!--
        Холст лежит **под** `<svg>`: оверлей, оси и активная точка обязаны
        остаться сверху. Слот необязательный — без него рама рисует как раньше,
        целиком в SVG.
      -->
      <slot v-if="useCanvas" name="canvas" v-bind="plotScope" />
      <!--
        В интерактивном режиме рисунок — декорация: смысл несут оверлей с
        клавиатурой и скрытая таблица. `role="img"` на `<svg>` объявил бы его
        потомков презентационными, и точки перестали бы существовать для
        скринридера — тот же капкан, что у `role="progressbar"` в ядре.
      -->
      <!-- Пустой холст не рисуется вовсе: сетка, оси и марки уже погашены, а
           полная высота переполнила бы укороченную обёртку. -->
      <svg
        v-if="!isEmpty || loading"
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

        <!-- Сетку рисует холст, когда он есть: оставшись здесь, она легла бы поверх рядов. -->
        <ChartGrid v-if="!useCanvas" :plot="plot" :x-ticks="xTicks" :y-ticks="yTicks" :show="showAxes ? showGrid : 'none'" />

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
            v-if="hasRightAxis"
            :plot="plot"
            :ticks="yTicksRight"
            orientation="y"
            side="right"
            :font-size-px="fontSizePx"
            :size-class="labelSizeClass[size]"
            :truncated="layout.truncated"
            :label="t('grCharts.chart.axisRight', 'right axis')"
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

        <!--
          Опоры над осями и под вертикалью курсора: полоса допустимого не должна
          глотать указатель, а марки — теряться под порогом.
        -->
        <ChartReferences
          v-if="referenceLayer && normalizedReferences.length > 0 && !isEmpty && !loading"
          :references="normalizedReferences"
          :plot="plot"
          :x-scale="xScale"
          :y-scale="yScale"
          :size-class="labelSizeClass[size]"
          :font-size-px="fontSizePx"
        />

        <line
          v-if="crosshair && tooltipApi.activeIndex.value !== null && !isEmpty"
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

        <ChartBrush v-if="zoomApi.band.value" :band="zoomApi.band.value" :plot="plot" />
      </svg>

      <!-- Якорь тултипа — HTML-див нулевого размера: `useFloating` типизирован
           `HTMLElement`, а марка графика это `SVGElement`. -->
      <div ref="anchorEl" :style="tooltipApi.anchorStyle.value" aria-hidden="true" />

      <div
        v-if="interactive && !isEmpty"
        ref="surfaceEl"
        :class="frameSurfaceClass"
        data-gr-chart-surface
        :role="surfaceRole ?? 'application'"
        tabindex="0"
        v-bind="surfaceAttrs"
        :aria-roledescription="roleDescription ?? t('grCharts.chart.roleDescription', 'chart')"
        :aria-label="surfaceLabel"
        :aria-description="surfaceDescription"
        @pointermove="onPointerMove"
        @pointerdown="zoomApi.onPointerDown"
        @wheel="zoomApi.onWheel"
        @pointerleave="tooltipApi.onPointerLeave"
        @keydown="onKeydown"
        @click="onClick"
        @blur="tooltipApi.close"
      />

      <!--
        Скелет ложится на область построения, а не на весь холст: гуттеры под оси
        уже зарезервированы, и данные придут ровно сюда же — без перекладки.

        Мерцание берётся у `GrSkeleton` ядра (оно уже выверено под
        `prefers-reduced-motion`), а поверх идёт призрак графика: сетка и линия.
        Так место занято не «серым прямоугольником», а обещанием конкретной
        картинки.
      -->
      <div v-if="loading" class="absolute" :style="plotStyle" role="status">
        <GrSkeleton variant="rect" width="100%" height="100%" rounded="var(--gr-radius-sm)" />

        <svg
          :class="frameGhostClass"
          :viewBox="`0 0 ${GHOST_VIEW.width} ${GHOST_VIEW.height}`"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          data-gr-chart-ghost
        >
          <line
            v-for="fraction in GHOST_GRID"
            :key="fraction"
            x1="0"
            :x2="GHOST_VIEW.width"
            :y1="fraction * GHOST_VIEW.height"
            :y2="fraction * GHOST_VIEW.height"
            :stroke="gridStroke"
            :stroke-width="gridStrokeWidth"
            vector-effect="non-scaling-stroke"
          />
          <path
            :d="GHOST_PATH"
            fill="none"
            :stroke="ghostStroke"
            :stroke-opacity="GHOST_OPACITY"
            stroke-width="2"
            stroke-linecap="butt"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <span class="sr-only">{{ t('grCharts.chart.loading', 'Loading chart') }}</span>
      </div>

      <div v-else-if="isEmpty" :class="frameStateClass">
        <slot name="empty">
          <GrEmptyState variant="ghost" :title="emptyText ?? t('grCharts.chart.empty', 'No data')" />
        </slot>
      </div>
    </div>

    <slot
      v-if="showLegend && !isEmpty && legendPosition === 'bottom'"
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

    <!--
      Панель тултипа обязана быть в DOM до открытия: позиционирование не
      измеряет то, чего нет в дереве. Отсюда `v-show`, а не `v-if`.

      `pointer-events-none` — на **обёртке**, а не только на самой панели.
      Обёртка позиционируется `fixed` и ложится поверх области построения; без
      этого указатель, дошедший до панели, покидает поверхность, та получает
      `pointerleave` и закрывает тултип — а курсор снова оказывается над
      графиком и открывает его заново. Получается мигание тем чаще, чем ближе
      панель к курсору: у столбцов она садится прямо на верх полосы.
    -->
    <div
      v-show="tooltipApi.open.value && tooltipApi.active.value"
      ref="tooltipEl"
      class="pointer-events-none"
      :style="floatingStyle"
    >
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
