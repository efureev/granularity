<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import { bulletLayout } from '../../chart/chartBullet'
import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatValue } from '../../chart/chartFormat'
import type { Rect } from '../../chart/chartLayout'
import { normalizeChartData } from '../../chart/chartModel'
import { type GrChartScale, linearScale } from '../../chart/chartScale'
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
  BULLET_OVERFLOW_SIZE,
  BULLET_TARGET_RATIO,
  BULLET_TARGET_WIDTH,
  BULLET_TRACK_RATIO,
  bulletBandFill,
  bulletOverflowFill,
  bulletTargetStroke,
  bulletTrackFill,
  bulletValueFill,
  bulletValueWidth,
} from './grChartBulletStyles'

/**
 * Bullet Стивена Фью: величина, цель и качественные диапазоны в одну строку.
 *
 * Три разных визуальных веса, чтобы они не спорили: диапазоны — фон, значение —
 * узкая полоса поверх, цель — засечка поперёк. Циферблата в пакете нет
 * намеренно: он тратит много места на мало данных и плохо читается
 * количественно.
 *
 * Роль оверлея здесь `meter`, а не `application`: это не приложение со своей
 * картой клавиш, а величина на шкале. Роль исчезает вместе со значением —
 * `meter` без `aria-valuenow` невалиден.
 */

export interface GrChartBulletProps {
  /** Измеряемая величина. `null` — величины нет; это не ноль. */
  value: number | null
  /** Целевое значение — засечка поперёк дорожки. */
  target?: number
  /**
   * Границы качественных диапазонов: `[0.9, 1.0]` при `max: 1.2` даёт три
   * полосы — до 0.9, 0.9…1.0 и свыше 1.0. Порядок не важен.
   */
  ranges?: readonly number[]
  /** Верх шкалы. Не задан — максимум из величины, цели и границ с запасом. */
  max?: number
  min?: number
  /** Цвета полос от «хорошо» к «плохо». Длина на единицу больше `ranges`. */
  rangeColors?: readonly string[]
  /** Тон самой полосы значения. */
  color?: string
  orientation?: 'horizontal' | 'vertical'
  /** Имя метрики: заголовок строки в таблице и в тултипе. */
  label?: string
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  valueFormat?: GrChartNumberFormat
  tooltip?: boolean
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

export interface GrChartBulletEmits {
  (e: 'valueClick', value: number | null): void
}

const props = withDefaults(defineProps<GrChartBulletProps>(), {
  target: undefined,
  ranges: undefined,
  max: undefined,
  min: undefined,
  rangeColors: undefined,
  color: undefined,
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  orientation: undefined,
  label: undefined,
  height: undefined,
  width: 640,
  valueFormat: undefined,
  tooltip: undefined,
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

const emit = defineEmits<GrChartBulletEmits>()

defineSlots<{
  tooltip?: (props: { active: GrChartActivePoint, formatValue: (value: number | null) => string }) => unknown
  empty?: () => unknown
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartBullet' })
const resolvedHeight = useGrComponentProp('GrChartBullet', 'height', () => props.height, 48)
const resolvedOrientation = useGrComponentProp('GrChartBullet', 'orientation', () => props.orientation, 'horizontal' as const)
const resolvedTooltip = useGrComponentProp('GrChartBullet', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartBullet', 'dataTable', () => props.dataTable, 'hidden' as const)

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const isHorizontal = computed(() => resolvedOrientation.value === 'horizontal')

const metricLabel = computed(() => props.label ?? props.ariaLabel ?? t('grCharts.bullet.label', 'Value'))

const model = computed(() => bulletLayout({
  value: props.value,
  target: props.target,
  ranges: props.ranges,
  min: props.min,
  max: props.max,
}))

/**
 * Внутрь рамы уходит одна точка.
 *
 * Не ради рисунка — его целиком делает слот, — а ради машинерии рамы: курсор,
 * тултип и одна остановка `Tab` работают по `positions`, и без точки их бы не
 * было вовсе.
 */
const data = computed(() => normalizeChartData(
  [{ id: 'bullet', label: metricLabel.value, data: [{ x: 0, y: props.value }] }],
  { kind: 'linear', sort: false },
))

const numberFormat = computed<GrChartNumberFormat>(() => ({ locale: resolvedLocale.value, ...props.valueFormat }))

function formatPointValue(value: number | null): string {
  return formatValue(value, numberFormat.value, t('grCharts.chart.noValue', 'no value'))
}

/** Пусто — когда нечего показать вовсе: ни величины, ни цели, ни диапазонов. */
const isEmpty = computed(() => props.empty ?? (
  props.value === null && props.target === undefined && (props.ranges?.length ?? 0) === 0
))

interface BulletGeometry {
  /** Шкала значений вдоль дорожки. */
  scale: GrChartScale
  /** Середина дорожки поперёк. */
  center: number
  /** Толщина дорожки диапазонов. */
  track: number
  /** Длина засечки цели: выше дорожки, иначе её край сливается с краем полос. */
  tick: number
}

function geometryOf(plot: Rect): BulletGeometry {
  const across = isHorizontal.value ? plot.height : plot.width
  const track = Math.max(0, across * BULLET_TRACK_RATIO)

  return {
    scale: isHorizontal.value
      ? linearScale(model.value.domain, [plot.x, plot.x + plot.width])
      // Ось значений вертикальной дорожки растёт вверх, как у декартовых графиков.
      : linearScale(model.value.domain, [plot.y + plot.height, plot.y]),
    center: isHorizontal.value ? plot.y + plot.height / 2 : plot.x + plot.width / 2,
    track,
    tick: track * BULLET_TARGET_RATIO,
  }
}

interface BandMark {
  index: number
  x: number
  y: number
  width: number
  height: number
  fill: string
}

function bandMarks(plot: Rect): BandMark[] {
  const geometry = geometryOf(plot)
  const bands = model.value.bands
  const half = geometry.track / 2

  return bands.flatMap((band) => {
    const from = geometry.scale.scale(band.from)
    const to = geometry.scale.scale(band.to)
    const size = Math.abs(to - from)

    // Полоса нулевой ширины — это зажатая по краю шкалы граница: индекс за ней
    // сохранён ради цветов, но рисовать нечего.
    if (size === 0)
      return []

    return [{
      index: band.index,
      x: isHorizontal.value ? Math.min(from, to) : geometry.center - half,
      y: isHorizontal.value ? geometry.center - half : Math.min(from, to),
      width: isHorizontal.value ? size : geometry.track,
      height: isHorizontal.value ? geometry.track : size,
      fill: props.rangeColors?.[band.index] ?? bulletBandFill(band.index, bands.length),
    }]
  })
}

interface LineMark {
  x1: number
  y1: number
  x2: number
  y2: number
}

/** Полоса значения — `<line>`, а не прямоугольник: толщина тогда идёт токеном. */
function valueMarks(plot: Rect): LineMark[] {
  if (model.value.value === null)
    return []

  const geometry = geometryOf(plot)
  const from = geometry.scale.scale(model.value.domain[0])
  const to = geometry.scale.scale(model.value.value)

  return [isHorizontal.value
    ? { x1: from, y1: geometry.center, x2: to, y2: geometry.center }
    : { x1: geometry.center, y1: from, x2: geometry.center, y2: to }]
}

function targetMarks(plot: Rect): LineMark[] {
  if (model.value.target === null || model.value.targetOutside)
    return []

  const geometry = geometryOf(plot)
  const at = geometry.scale.scale(model.value.target)
  const half = geometry.tick / 2

  return [isHorizontal.value
    ? { x1: at, y1: geometry.center - half, x2: at, y2: geometry.center + half }
    : { x1: geometry.center - half, y1: at, x2: geometry.center + half, y2: at }]
}

/**
 * Маркер переполнения — треугольник у края шкалы.
 *
 * Полоса упирается в край, а настоящее значение уходит в тултип, таблицу и
 * объявление: обрезать величину молча значило бы показать другое число.
 */
function overflowMarks(plot: Rect): { d: string }[] {
  if (!model.value.overflow && !model.value.underflow)
    return []

  const geometry = geometryOf(plot)
  const at = geometry.scale.scale(model.value.overflow ? model.value.domain[1] : model.value.domain[0])
  const size = BULLET_OVERFLOW_SIZE
  const forward = model.value.overflow
  const tip = isHorizontal.value
    ? at + (forward ? size : -size)
    : at + (forward ? -size : size)

  return [{
    d: isHorizontal.value
      ? `M ${at} ${geometry.center - size} L ${tip} ${geometry.center} L ${at} ${geometry.center + size} Z`
      : `M ${geometry.center - size} ${at} L ${geometry.center} ${tip} L ${geometry.center + size} ${at} Z`,
  }]
}

/** Попадание у bullet одно: точка ровно одна, и мимо неё внутри области не промахнуться. */
function hitTest(point: { x: number, y: number }, context: ChartHitContext): number {
  const { plot } = context
  const inside = point.x >= plot.x && point.x <= plot.x + plot.width
    && point.y >= plot.y && point.y <= plot.y + plot.height

  return inside ? 0 : -1
}

function anchorPoint(_index: number, context: ChartHitContext): { x: number, y: number } | null {
  const geometry = geometryOf(context.plot)
  const at = geometry.scale.scale(model.value.value ?? model.value.domain[0])

  return isHorizontal.value ? { x: at, y: geometry.center } : { x: geometry.center, y: at }
}

const bandDescriptions = computed(() => model.value.bands
  .filter(band => band.to > band.from)
  .map(band => t('grCharts.bullet.range', '{from} to {to}', {
    from: formatPointValue(band.from),
    to: formatPointValue(band.to),
  })))

/**
 * Человеческая формулировка величины: «0,031 из 0,04, цель 0,04».
 *
 * `aria-valuenow` сам по себе прочитается числом без единиц и без цели, то есть
 * скажет меньше, чем видит зрячий.
 */
const valueText = computed(() => {
  const value = formatPointValue(model.value.rawValue)
  const max = formatPointValue(model.value.domain[1])

  return model.value.target === null
    ? t('grCharts.bullet.valueText', '{value} of {max}', { value, max })
    : t('grCharts.bullet.valueTextWithTarget', '{value} of {max}, target {target}', {
        value,
        max,
        target: formatPointValue(model.value.target),
      })
})

/**
 * Роль исчезает вместе со значением.
 *
 * `meter` требует `aria-valuenow`, а при `value: null` его нет; оставленная
 * роль дала бы нарушение `aria-required-attr`. Без значения оверлей остаётся
 * обычной поверхностью графика.
 */
const surfaceRole = computed(() => (model.value.rawValue === null ? undefined : 'meter'))

const surfaceAttrs = computed<Record<string, string | number | undefined> | undefined>(() => (
  model.value.rawValue === null
    ? undefined
    : {
        'aria-valuenow': model.value.rawValue,
        'aria-valuemin': model.value.domain[0],
        'aria-valuemax': model.value.domain[1],
        'aria-valuetext': valueText.value,
      }
))

const surfaceLabel = computed(() => props.ariaLabel ?? metricLabel.value)

/** Диапазоны объявляются словами: цветные зоны иначе существуют только для зрячих. */
const surfaceDescription = computed(() => {
  const parts = [props.ariaDescription]

  if (bandDescriptions.value.length > 1)
    parts.push(t('grCharts.bullet.ranges', 'Ranges: {ranges}', { ranges: bandDescriptions.value.join('; ') }))

  if (model.value.overflow || model.value.underflow)
    parts.push(t('grCharts.bullet.overflow', 'Value is outside the scale'))

  const text = parts.filter(Boolean).join('. ')

  return text.length > 0 ? text : undefined
})

const tableModel = computed<ChartTableModel>(() => ({
  caption: t('grCharts.bullet.tableCaption', 'Chart data'),
  columns: [
    { key: 'metric', label: t('grCharts.bullet.columnMetric', 'Metric') },
    { key: 'value', label: t('grCharts.bullet.columnValue', 'Value') },
    { key: 'target', label: t('grCharts.bullet.columnTarget', 'Target') },
  ],
  rows: [{
    header: metricLabel.value,
    // Настоящее значение, а не зажатое по шкале: полоса упёрлась в край, но
    // величина от этого не изменилась.
    cells: [formatPointValue(model.value.rawValue), formatPointValue(model.value.target)],
  }],
  notes: bandDescriptions.value.length > 1
    ? [t('grCharts.bullet.ranges', 'Ranges: {ranges}', { ranges: bandDescriptions.value.join('; ') })]
    : undefined,
}))

function describePoint(): string {
  return valueText.value
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
    :tooltip="resolvedTooltip"
    :loading="loading"
    :empty="isEmpty"
    :empty-text="emptyText"
    :data-table="resolvedDataTable"
    :interactive="interactive"
    :locale="locale"
    :aria-label="surfaceLabel"
    :aria-description="surfaceDescription"
    :role-description="t('grCharts.bullet.roleDescription', 'bullet chart')"
    :surface-role="surfaceRole"
    :surface-attrs="surfaceAttrs"
    :value-format="valueFormat"
    :hit-test="hitTest"
    :anchor-point="anchorPoint"
    :table-model="tableModel"
    :describe-point="describePoint"
    data-gr-chart-bullet
    @point-click="() => emit('valueClick', model.rawValue)"
  >
    <template #header>
      <slot name="header" />
    </template>

    <template #plot="{ plot }">
      <g data-gr-chart-bullet-body>
        <!-- Дорожка под диапазонами: она видна там, где диапазонов не задали. -->
        <rect
          v-for="mark in [geometryOf(plot)]"
          :key="mark.track"
          data-gr-chart-bullet-track
          :x="isHorizontal ? plot.x : mark.center - mark.track / 2"
          :y="isHorizontal ? mark.center - mark.track / 2 : plot.y"
          :width="isHorizontal ? plot.width : mark.track"
          :height="isHorizontal ? mark.track : plot.height"
          :fill="bulletTrackFill"
          stroke="none"
        />

        <rect
          v-for="mark in bandMarks(plot)"
          :key="`band-${mark.index}`"
          :data-gr-chart-bullet-band="mark.index"
          :x="mark.x"
          :y="mark.y"
          :width="mark.width"
          :height="mark.height"
          :fill="mark.fill"
          stroke="none"
        />

        <line
          v-for="(mark, index) in valueMarks(plot)"
          :key="`value-${index}`"
          data-gr-chart-bullet-value
          :x1="mark.x1"
          :y1="mark.y1"
          :x2="mark.x2"
          :y2="mark.y2"
          fill="none"
          :stroke="color ?? bulletValueFill"
          :stroke-width="bulletValueWidth"
          stroke-linecap="butt"
        />

        <path
          v-for="(mark, index) in overflowMarks(plot)"
          :key="`overflow-${index}`"
          data-gr-chart-bullet-overflow
          :d="mark.d"
          :fill="bulletOverflowFill"
          stroke="none"
        />

        <line
          v-for="(mark, index) in targetMarks(plot)"
          :key="`target-${index}`"
          data-gr-chart-bullet-target
          :x1="mark.x1"
          :y1="mark.y1"
          :x2="mark.x2"
          :y2="mark.y2"
          fill="none"
          :stroke="bulletTargetStroke"
          :stroke-width="BULLET_TARGET_WIDTH"
          stroke-linecap="butt"
        />
      </g>
    </template>

    <template #tooltip="scope">
      <slot name="tooltip" v-bind="scope">
        <div :class="frameTooltipClass">
          <div :class="frameTooltipTitleClass">
            {{ metricLabel }}
          </div>
          <div :class="frameTooltipRowClass">
            <span>{{ formatPointValue(model.rawValue) }}</span>
            <span v-if="model.target !== null" :class="frameTooltipValueClass">
              {{ formatPointValue(model.target) }}
            </span>
          </div>
        </div>
      </slot>
    </template>

    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
  </ChartFrame>
</template>
