<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import { barBandwidth, barHitIndex, barPath, barRect, barToward, groupSlots } from '../../chart/chartBars'
import type { ChartOrientation } from '../../chart/chartOrientation'
import { orientedGrid, orientedPoint } from '../../chart/chartOrientation'
import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatShare } from '../../chart/chartFormat'
import type { Rect } from '../../chart/chartLayout'
import { estimateTextWidth, labelGutters } from '../../chart/chartLayout'
import type { GrChartSeries, NormalizedSeries } from '../../chart/chartModel'
import { normalizeChartData, resolveScaleKind } from '../../chart/chartModel'
import type { GrChartReference, NormalizedReference } from '../../chart/chartReference'
import { normalizeReferences, referenceDomainValues } from '../../chart/chartReference'
import { bandScale, createScale, type GrChartScale, type GrChartScaleKind, linearScale, scaleForAxis } from '../../chart/chartScale'
import type { ChartTick, ChartTickFormat } from '../../composables/useChartTicks'
import type { ChartHitContext, GrChartActivePoint } from '../../composables/useChartTooltip'
import { bandTicks, linearTicks } from '../../chart/chartTicks'
import ChartAxis from '../GrChartFrame/shared/ChartAxis.vue'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import ChartGrid from '../GrChartFrame/shared/ChartGrid.vue'
import ChartReferences from '../GrChartFrame/shared/ChartReferences.vue'
import { labelFontPx, labelSizeClass } from '../GrChartFrame/chartFrameStyles'
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
  /**
   * Раскладка столбцов.
   *
   * `'horizontal'` — категории идут сверху вниз, значения вправо. Берут её ради
   * подписей: длинное название категории в вертикальной раскладке либо наезжает
   * на соседнее, либо встаёт наискось.
   *
   * Оси и после поворота называются **по данным**: `yDomain`, `yTickFormat` и
   * `showGrid: 'y'` относятся к оси значений, где бы она ни лежала. Алиасов нет
   * намеренно — два пропа с одним смыслом хуже одного неточного имени.
   */
  orientation?: ChartOrientation
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
  orientation: undefined,
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
const resolvedOrientation = useGrComponentProp('GrChartBar', 'orientation', () => props.orientation, 'vertical' as ChartOrientation)
const isHorizontal = computed(() => resolvedOrientation.value === 'horizontal')
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
  // Вторая ось значений при горизонтали стала бы верхней, а верхнего гуттера
  // нет ни у `chartLayout`, ни у `labelGutters`. Гасим здесь, а не в шаблоне:
  // тогда и таблица не припишет «(правая ось)», и тултип возьмёт один формат.
  dualAxis: props.dualAxis && !isHorizontal.value,
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

/** Подписи категорий: у полосной шкалы это имена, у непрерывной — форматированные числа. */
const categoryLabels = computed(() => data.value.positions.map((position, index) => categoryTickLabel(position, index)))

function categoryTickLabel(position: number, index?: number): string {
  const categories = data.value.categories

  if (categories.length > 0)
    return categories[index ?? position] ?? String(position)

  return props.xTickFormat ? String(props.xTickFormat(position, data.value.kind)) : String(position)
}

/**
 * Место под собственные подписи при горизонтали.
 *
 * Рама идёт с `axes: false`: её ось значений вертикальна по построению, а здесь
 * она внизу. Содержимое нижних подписей на высоту гуттера не влияет — важно
 * лишь то, что строка текста под областью есть.
 */
const gutters = computed(() => (isHorizontal.value
  ? labelGutters({
      leftLabels: categoryLabels.value,
      bottomLabels: ['0'],
      fontSizePx: labelFontPx[resolvedSize.value],
    })
  : { left: 0, bottom: 0, labelWidth: 0, truncated: false }))

interface BarGeometry {
  /** Шкала значений: у вертикали это ось рамы, у горизонтали — своя. */
  value: GrChartScale
  /** Шкала категорий. */
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
/**
 * Половина крайней подписи оси значений.
 *
 * Подпись центрируется под своим делением, и последняя ровно половиной ширины
 * вылезла бы за холст. Рама это место резервирует сама, но при горизонтали она
 * идёт с `axes: false` — считаем здесь. Деления зависят только от домена, так
 * что круга «область → деления → область» не возникает.
 */
function valueLabelOverhang(domain: readonly [number, number]): number {
  const values = linearTicks(domain, props.yTickCount).values
  const last = values.at(-1)

  if (last === undefined)
    return 0

  const label = yTickFormat.value ? String(yTickFormat.value(last)) : String(last)

  return estimateTextWidth(label, labelFontPx[resolvedSize.value]) / 2
}

function geometryOf(plot: Rect, xScale: GrChartScale, yScale: GrChartScale): BarGeometry {
  if (!isHorizontal.value)
    return { value: yScale, category: xScale, area: plot }

  const area = {
    x: plot.x + gutters.value.left,
    y: plot.y,
    width: Math.max(0, plot.width - gutters.value.left - valueLabelOverhang(yScale.domain)),
    height: Math.max(0, plot.height - gutters.value.bottom),
  }

  return {
    value: linearScale(yScale.domain, [area.x, area.x + area.width]),
    category: data.value.kind === 'band'
      ? bandScale(data.value.positions.length, [area.y, area.y + area.height])
      : createScale(data.value.kind, data.value.xDomain, [area.y, area.y + area.height]),
    area,
  }
}

function valueTicks(geometry: BarGeometry): ChartTick[] {
  return linearTicks(geometry.value.domain, props.yTickCount).values.map(value => ({
    value,
    position: geometry.value.scale(value),
    label: yTickFormat.value ? String(yTickFormat.value(value)) : String(value),
  }))
}

function categoryTicks(geometry: BarGeometry): ChartTick[] {
  return bandTicks(data.value.positions.length, 12).map(index => ({
    value: index,
    position: geometry.category.scale(data.value.positions[index] ?? index),
    label: categoryTickLabel(data.value.positions[index] ?? index, index),
  }))
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
  const orientation = resolvedOrientation.value
  const geometry = geometryOf(plot, xScale, yScale)
  const bandwidth = barBandwidth(geometry.category, geometry.area, data.value.positions.length, orientation)
  const slots = groupSlots(stacked ? 1 : series.length, bandwidth, { groupPadding: resolvedGroupPadding.value })
  const outermost = outermostAt(series)
  const [valueLow, valueHigh] = isHorizontal.value
    ? [geometry.area.x, geometry.area.x + geometry.area.width]
    : [geometry.area.y, geometry.area.y + geometry.area.height]
  const marks: BarMark[] = []

  series.forEach((item, seriesIndex) => {
    const slot = slots[stacked ? 0 : seriesIndex]

    if (!slot)
      return

    // Шкала и её ноль берутся у одной оси: иначе столбец правой серии встал бы
    // на чужую базовую линию и показал бы величину, которой нет.
    const scale = isHorizontal.value ? geometry.value : scaleForAxis(item.axis, yScale, yScaleRight)
    const baseline = Math.min(Math.max(scale.scale(0), valueLow), valueHigh)

    for (const point of item.points) {
      if (point.y === null)
        continue
      if (stacked && point.stackTop === undefined)
        continue

      const from = stacked ? scale.scale(point.stackBase!) : baseline
      const to = stacked ? scale.scale(point.stackTop!) : scale.scale(point.y)
      // Имя не `rounded`: гейт `styleTokens` ищет утилиту с тем же написанием.
      const withRadius = !stacked || outermost.get(point.x) === item.id

      marks.push({
        key: `${item.id}-${point.sourceIndex}`,
        d: barPath(
          barRect(geometry.category.scale(point.x), slot, from, to, orientation),
          withRadius ? resolvedRadius.value : 0,
          barToward(from, to, orientation),
        ),
        color: item.style.color,
        seriesId: item.id,
        dimmed: resolvedDimInactive.value && activeX !== undefined && point.x !== activeX,
      })
    }
  })

  return marks
}

/**
 * Кто в каждой категории лежит дальше всех от базовой линии: только его сегмент
 * получает скругление. При горизонтали «дальний» — правый, а не верхний.
 */
function outermostAt(series: readonly NormalizedSeries[]): Map<number, string> {
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
/**
 * Опоры в горизонтальной системе координат.
 *
 * Рама рисует их своими шкалами и своим `axis`, где `'y'` — это ось значений,
 * идущая вниз. При горизонтали значения идут вправо, поэтому опора приезжает
 * сюда со свопнутой осью: `'y'` становится `'x'`, и `referenceMarks` внутри
 * `ChartReferences` строит ровно ту вертикальную черту, которая и нужна.
 *
 * Текст опоры при этом остаётся за рамой — `aria-description` и строка
 * `<tfoot>` собираются там же, где и раньше, поэтому читатель без зрения порог
 * не теряет.
 */
function horizontalReferences(plot: Rect, xScale: GrChartScale, yScale: GrChartScale): NormalizedReference[] {
  if (!isHorizontal.value)
    return []

  const geometry = geometryOf(plot, xScale, yScale)

  return normalizeReferences(props.references ?? [], {
    kind: data.value.kind,
    categories: data.value.categories,
    xDomain: data.value.xDomain,
    yDomain: geometry.value.domain,
  }).map(reference => ({ ...reference, axis: reference.axis === 'y' ? 'x' as const : 'y' as const }))
}

function hitTest(point: { x: number, y: number }, context: ChartHitContext): number {
  const geometry = geometryOf(context.plot, context.xScale, context.yScale)
  const positions = data.value.positions

  return barHitIndex({
    point,
    area: geometry.area,
    positions,
    scale: geometry.category,
    bandwidth: barBandwidth(geometry.category, geometry.area, positions.length, resolvedOrientation.value),
    orientation: resolvedOrientation.value,
  })
}

/**
 * Якорь панели — дальний конец самой длинной полосы категории.
 *
 * Функция стабильная и ветвится внутри: рама забирает `anchorPoint` по значению
 * один раз на setup, и условный проп (`isHorizontal ? fn : undefined`) протух бы
 * при переключении раскладки на живом компоненте — панель осталась бы у старой
 * оси.
 */
function anchorPoint(index: number, context: ChartHitContext): { x: number, y: number } | null {
  const position = data.value.positions[index]

  if (position === undefined)
    return null

  const geometry = geometryOf(context.plot, context.xScale, context.yScale)
  const center = geometry.category.scale(position)
  const stacked = props.stacked !== false
  let tip: number | null = null

  for (const item of data.value.series) {
    if (item.hidden)
      continue

    const point = item.byX.get(position)

    if (!point || point.y === null)
      continue

    const scale = isHorizontal.value
      ? geometry.value
      : scaleForAxis(item.axis, context.yScale, context.yScaleRight)
    const value = scale.scale(stacked ? (point.stackTop ?? point.y) : point.y)

    // Дальний конец — самый правый при горизонтали и самый верхний при
    // вертикали: у перевёрнутой оси значений «больше» это меньший пиксель.
    tip = tip === null ? value : (isHorizontal.value ? Math.max(tip, value) : Math.min(tip, value))
  }

  if (tip === null)
    return null

  return orientedPoint(center, tip, resolvedOrientation.value)
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
    :axes="!isHorizontal"
    :keyboard="isHorizontal ? { axes: 'transposed' } : undefined"
    :show-grid="isHorizontal ? 'none' : resolvedGrid"
    :reference-layer="!isHorizontal"
    :show-legend="showLegend"
    :legend-position="resolvedLegendPosition"
    :tooltip="resolvedTooltip"
    :crosshair="false"
    :hit-test="hitTest"
    :anchor-point="anchorPoint"
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
      <!--
        При горизонтали рама уступает свои слои: её оси, сетка и опоры считаются
        в вертикальной системе координат и легли бы поперёк. Порядок обязателен —
        сетка, опоры, марки: опора под полосой читается как порог, поверх неё —
        как перечёркивание. Порядка элементов не стережёт ни один гейт.
      -->
      <template v-if="isHorizontal">
        <ChartGrid
          :plot="geometryOf(plot, sx, sy).area"
          :x-ticks="valueTicks(geometryOf(plot, sx, sy))"
          :y-ticks="[]"
          :show="orientedGrid(resolvedGrid, 'horizontal')"
        />
        <ChartReferences
          v-if="horizontalReferences(plot, sx, sy).length > 0"
          :references="horizontalReferences(plot, sx, sy)"
          :plot="geometryOf(plot, sx, sy).area"
          :x-scale="geometryOf(plot, sx, sy).value"
          :y-scale="geometryOf(plot, sx, sy).category"
          :size-class="labelSizeClass[resolvedSize]"
          :font-size-px="labelFontPx[resolvedSize]"
        />
      </template>

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

      <template v-if="isHorizontal">
        <ChartAxis
          :plot="geometryOf(plot, sx, sy).area"
          :ticks="categoryTicks(geometryOf(plot, sx, sy))"
          orientation="y"
          :font-size-px="labelFontPx[resolvedSize]"
          :size-class="labelSizeClass[resolvedSize]"
          :truncated="gutters.truncated"
          :max-label-width="gutters.labelWidth"
          :label="t('grCharts.chart.axisY', 'Y axis')"
        />
        <ChartAxis
          :plot="geometryOf(plot, sx, sy).area"
          :ticks="valueTicks(geometryOf(plot, sx, sy))"
          orientation="x"
          :font-size-px="labelFontPx[resolvedSize]"
          :size-class="labelSizeClass[resolvedSize]"
          :truncated="false"
          :label="t('grCharts.chart.axisX', 'X axis')"
        />
      </template>
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
