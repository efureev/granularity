<script setup lang="ts">
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { computed, ref } from 'vue'

import type { GrChartNumberFormat } from '../../chart/chartFormat'
import { formatShare, formatValue } from '../../chart/chartFormat'
import type { FunnelStage, GrChartFunnelStage } from '../../chart/chartFunnel'
import { funnelPath, funnelStages } from '../../chart/chartFunnel'
import { estimateTextWidth, fitLabel, labelGutters, placeRowLabels, type Rect } from '../../chart/chartLayout'
import { normalizeChartData } from '../../chart/chartModel'
import { seriesStyle } from '../../chart/chartSeriesStyle'
import type { ChartTableModel } from '../../chart/chartTable'
import type { ChartHitContext, GrChartActivePoint } from '../../composables/useChartTooltip'
import ChartFrame from '../GrChartFrame/shared/ChartFrame.vue'
import {
  frameLabelClass,
  frameTooltipClass,
  labelFill,
  labelFontPx,
  labelSizeClass,
  frameTooltipRowClass,
  frameTooltipTitleClass,
  frameTooltipValueClass,
  type GrChartSize,
} from '../GrChartFrame/chartFrameStyles'
import {
  DEFAULT_FUNNEL_GAP,
  funnelDimOpacity,
  funnelLabelFill,
  STAGE_LABEL_MAX,
  STAGE_LABEL_MIN,
  STAGE_LABEL_RATIO,
} from './grChartFunnelStyles'

/**
 * Воронка: сколько дошло до каждой ступени и где теряется больше всего.
 *
 * Ширина ступени пропорциональна **значению**, а не порядку: убывание рисуется
 * потому, что оно есть в данных. Ступень больше предыдущей воронка не
 * выпрямляет — рисует честно и говорит об этом в описании: это либо ошибка
 * данных, либо разные когорты, и решать должен читатель.
 *
 * Внутрь рамы уходит линейный ряд по индексам ступеней: у категориальной оси
 * подписи проходят через дедупликацию, и две одноимённые ступени слиплись бы в
 * одну позицию.
 */

export interface GrChartFunnelActiveStage {
  index: number
  label: string
  value: number
  /** Доля от первой ступени и от предыдущей — разные знаменатели, обе нужны. */
  shareFirst: number | null
  sharePrev: number | null
}

export interface GrChartFunnelProps {
  /**
   * Ступени по порядку: `{ label, value, color? }`. Ширина ступени пропорциональна значению, а не
   * порядку.
   */
  stages: readonly GrChartFunnelStage[]
  /**
   * Число у ступени: значение (по умолчанию), доля от первой или от предыдущей
   * ступени. Не помещается внутри — стоит рядом. `'none'` убирает числа, имена
   * ступеней остаются.
   */
  labels?: 'value' | 'share-first' | 'share-prev' | 'none'
  /**
   * Направление: `vertical` (по умолчанию) — ступени сверху вниз, имена слева; `horizontal` — слева
   * направо, имена под ступенями.
   */
  orientation?: 'vertical' | 'horizontal'
  /** Сужающаяся лента или прямоугольники одной ширины. */
  shape?: 'trapezoid' | 'bar'
  /** Зазор между ступенями в пикселях. */
  gap?: number
  /**
   * Высота холста в пикселях; по умолчанию 256. Данные, загрузка и пустое состояние занимают её
   * одинаково.
   */
  height?: number
  /** Объявленная ширина: от неё идёт первый рендер, дальше ширина замеряется. */
  width?: number
  /**
   * Формат значений в тултипе, скрытой таблице и объявлениях: знаки после запятой и разделители.
   */
  valueFormat?: GrChartNumberFormat
  /**
   * Панель со значениями под курсором; по умолчанию `true`. `false` прячет только
   * панель: курсор, активные марки, `update:activeIndex` и `pointHover` работают,
   * пока график интерактивен.
   */
  tooltip?: boolean
  /** Курсор — `v-model:activeIndex`. */
  activeIndex?: number | null
  /**
   * Загрузка: на месте области построения — скелет той же высоты, место под оси уже
   * зарезервировано.
   */
  loading?: boolean
  /** Пустое состояние явно. Не задано — график пуст, когда рисовать нечего. */
  empty?: boolean
  /** Текст заглушки пустого графика. Не задан — «Нет данных» из переводов пакета. */
  emptyText?: string
  /**
   * Таблица данных: `hidden` (по умолчанию) — только для скринридера, `visible` — под графиком,
   * `off` — без неё.
   */
  dataTable?: 'hidden' | 'visible' | 'off'
  /** `false` — график становится картинкой: без фокуса, тултипа и клавиатуры. */
  interactive?: boolean
  /**
   * Кегль имён ступеней и подписей снаружи по контрольной шкале ядра; по умолчанию — размер из
   * `GrConfigProvider`.
   */
  size?: GrChartSize
  /** BCP-47 локаль чисел и дат. Не задана — язык переводов приложения, иначе `en`. */
  locale?: string
  /**
   * Доступное имя графика. Не задано — сводка, которую собирает компонент: тип графика и объём
   * данных.
   */
  ariaLabel?: string
  /**
   * Описание для скринридера — вывод, ради которого график показан; дополняет сводку, а не заменяет
   * её.
   */
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

export interface GrChartFunnelEmits {
  /** Курсор сдвинулся: индекс ступени или `null` — для `v-model:activeIndex`. */
  (e: 'update:activeIndex', value: number | null): void
  /** Щелчок или Enter по ступени — с её значением и обеими долями. */
  (e: 'stageClick', value: GrChartFunnelActiveStage): void
  /** Курсор пришёл на ступень или ушёл с графика (`null`). */
  (e: 'stageHover', value: GrChartFunnelActiveStage | null): void
}

const props = withDefaults(defineProps<GrChartFunnelProps>(), {
  // Дефолты живут в резолверах: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  labels: undefined,
  orientation: undefined,
  shape: undefined,
  gap: undefined,
  height: undefined,
  width: 640,
  valueFormat: undefined,
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
  dataTableMaxRows: undefined,
})

const emit = defineEmits<GrChartFunnelEmits>()

defineSlots<{
  /**
   * Своё содержимое панели тултипа вместо стандартного; данные активной позиции — в параметрах
   * слота.
   */
  tooltip?: (props: { active: GrChartActivePoint, stage: GrChartFunnelActiveStage | null }) => unknown
  /** Своя заглушка пустого графика вместо «Нет данных»; занимает ту же `height`. */
  empty?: () => unknown
  /** Заголовок над графиком, внутри его корня — выше легенды, стоящей сверху. */
  header?: () => unknown
}>()

const { t, locale: i18nLocale } = useGranularityTranslations()

const resolvedSize = useGrComponentSize<GrChartSize>(() => props.size, { component: 'GrChartFunnel' })
const resolvedHeight = useGrComponentProp('GrChartFunnel', 'height', () => props.height, 256)
const resolvedOrientation = useGrComponentProp('GrChartFunnel', 'orientation', () => props.orientation, 'vertical' as const)
const resolvedShape = useGrComponentProp('GrChartFunnel', 'shape', () => props.shape, 'trapezoid' as const)
const resolvedLabels = useGrComponentProp('GrChartFunnel', 'labels', () => props.labels, 'value' as const)
const resolvedGap = useGrComponentProp('GrChartFunnel', 'gap', () => props.gap, DEFAULT_FUNNEL_GAP)
const resolvedTooltip = useGrComponentProp('GrChartFunnel', 'tooltip', () => props.tooltip, true)
const resolvedDataTable = useGrComponentProp('GrChartFunnel', 'dataTable', () => props.dataTable, 'hidden' as const)
const resolvedTableMaxRows = useGrComponentProp('GrChartFunnel', 'dataTableMaxRows', () => props.dataTableMaxRows, 'auto' as number | 'auto')

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value ?? 'en')
const isHorizontal = computed(() => resolvedOrientation.value === 'horizontal')

const data = computed(() => normalizeChartData(
  [{
    id: 'funnel',
    label: t('grCharts.funnel.roleDescription', 'funnel chart'),
    data: props.stages.map((stage, index) => ({ x: index, y: stage.value, label: stage.label })),
  }],
  { kind: 'linear', sort: false },
))

const numberFormat = computed<GrChartNumberFormat>(() => ({ locale: resolvedLocale.value, ...props.valueFormat }))

function formatStageValue(value: number | null): string {
  return formatValue(value, numberFormat.value, t('grCharts.chart.noValue', 'no value'))
}

function formatStageShare(share: number | null): string {
  return share === null ? '—' : formatShare(share, resolvedLocale.value)
}

const nameFont = computed(() => labelFontPx[resolvedSize.value])

/**
 * Место под имена ступеней.
 *
 * Без имён воронку не прочитать: какая полоса что значит, знали только тултип и
 * скрытая таблица. Вертикаль ставит имена колонкой слева — до 40% ширины, как
 * категории горизонтальных столбцов, — горизонталь пишет их строкой под
 * ступенями. Ширина оценивается, а не измеряется: причина в `chartLayout`.
 */
function namesOf(plot: Rect) {
  return labelGutters({
    leftLabels: isHorizontal.value ? [] : props.stages.map(stage => stage.label),
    bottomLabels: isHorizontal.value ? props.stages.map(stage => stage.label) : [],
    fontSizePx: nameFont.value,
    availableWidth: plot.width,
  })
}

/** Область ступеней — область построения без места под имена. */
function areaOf(plot: Rect): Rect {
  const names = namesOf(plot)

  return {
    x: plot.x + names.left,
    y: plot.y,
    width: Math.max(0, plot.width - names.left),
    height: Math.max(0, plot.height - names.bottom),
  }
}

/** Геометрия ступеней считается от области построения — она приходит из слота. */
function stagesOf(plot: Rect): FunnelStage[] {
  return funnelStages(props.stages, {
    plot: areaOf(plot),
    orientation: resolvedOrientation.value,
    shape: resolvedShape.value,
    gap: resolvedGap.value,
  })
}

interface StageName {
  index: number
  x: number
  y: number
  text: string
  full?: string
  anchor: 'end' | 'middle'
}

const NAME_GAP = 6

function stageNames(plot: Rect): StageName[] {
  const stages = stagesOf(plot)
  const area = areaOf(plot)

  if (isHorizontal.value) {
    const step = stages.length > 0 ? area.width / stages.length : 0

    return placeRowLabels({
      labels: props.stages.map(stage => stage.label),
      start: area.x,
      step,
      bounds: [plot.x, plot.x + plot.width],
      fontSizePx: nameFont.value,
    }).map(label => ({
      index: label.index,
      x: label.x,
      y: area.y + area.height + NAME_GAP + nameFont.value,
      text: label.text,
      full: label.full,
      anchor: 'middle' as const,
    }))
  }

  const { labelWidth } = namesOf(plot)

  return stages.map((stage) => {
    const text = fitLabel(stage.label, nameFont.value, labelWidth)

    return {
      index: stage.index,
      x: area.x - NAME_GAP,
      y: stage.rect.y + stage.rect.height / 2,
      text,
      full: text === stage.label ? undefined : stage.label,
      anchor: 'end' as const,
    }
  })
}

/**
 * Доли считаются и вне рисунка: они нужны таблице, тултипу и описанию, а те
 * области построения не видят.
 */
const shares = computed(() => funnelStages(props.stages, { plot: { x: 0, y: 0, width: 1, height: 1 } }))

function colorOf(index: number): string {
  return seriesStyle(index, { color: props.stages[index]?.color }).color
}

function labelTextOf(stage: FunnelStage): string {
  if (resolvedLabels.value === 'value')
    return formatStageValue(stage.value)
  if (resolvedLabels.value === 'share-first')
    return formatStageShare(stage.shareFirst)

  return formatStageShare(stage.sharePrev)
}

function labelFontOf(stage: FunnelStage): number {
  const across = isHorizontal.value ? stage.rect.width : stage.rect.height

  return Math.min(STAGE_LABEL_MAX, Math.max(STAGE_LABEL_MIN, across * STAGE_LABEL_RATIO))
}

interface StageLabel {
  index: number
  x: number
  y: number
  text: string
  font: number
  fill: string
  anchor: 'start' | 'middle'
  baseline: 'central' | 'auto'
  inside: boolean
}

const OUTSIDE_GAP = 4

/**
 * Подпись значения — внутри ступени, если помещается, иначе рядом с ней.
 *
 * Ступень воронки узкая по построению — последняя тем более, — и подпись, шире
 * неё, вылезла бы на фон и читалась как чужая. Но и пропасть она не может:
 * узкая ступень — это и есть то место, где воронка теряет больше всего, а
 * нулевая обещана с подписью. Поэтому снаружи: справа от середины ступени у
 * вертикали, над ней у горизонтали, цветом подписи рамы, а не цветом поверх
 * заливки.
 *
 * К оценке добавляется поллитеры с каждой стороны: подпись, влезшая «впритык»,
 * по факту задевает край.
 */
function stageLabels(plot: Rect): StageLabel[] {
  if (resolvedLabels.value === 'none')
    return []

  return stagesOf(plot).map((stage) => {
    // Подпись стоит в середине ступени, значит и мерить надо ширину там: у
    // трапеции она среднее между входом и выходом, а не узкий конец.
    const middle = (stage.from + stage.to) / 2
    const available = isHorizontal.value ? stage.rect.width : middle
    const text = labelTextOf(stage)
    const font = labelFontOf(stage)
    const centerX = stage.rect.x + stage.rect.width / 2
    const centerY = stage.rect.y + stage.rect.height / 2
    const thick = isHorizontal.value ? middle : stage.rect.height

    if (estimateTextWidth(text, font) + font <= available && font <= thick) {
      return { index: stage.index, x: centerX, y: centerY, text, font, fill: funnelLabelFill, anchor: 'middle', baseline: 'central', inside: true }
    }

    return isHorizontal.value
      ? { index: stage.index, x: centerX, y: centerY - middle / 2 - OUTSIDE_GAP, text, font: nameFont.value, fill: labelFill, anchor: 'middle', baseline: 'auto', inside: false }
      : { index: stage.index, x: centerX + middle / 2 + OUTSIDE_GAP, y: centerY, text, font: nameFont.value, fill: labelFill, anchor: 'start', baseline: 'central', inside: false }
  })
}

/** Попадание вдоль оси ступеней: у воронки они идут одной колонкой. */
function hitTest(point: { x: number, y: number }, context: ChartHitContext): number {
  const { plot } = context
  const along = isHorizontal.value ? point.x - plot.x : point.y - plot.y
  const size = isHorizontal.value ? plot.width : plot.height
  const total = props.stages.length

  if (total === 0 || along < 0 || along > size)
    return -1

  return Math.min(total - 1, Math.max(0, Math.floor((along / size) * total)))
}

function anchorPoint(index: number, context: ChartHitContext): { x: number, y: number } | null {
  const stage = stagesOf(context.plot)[index]

  if (!stage)
    return null

  return { x: stage.rect.x + stage.rect.width / 2, y: stage.rect.y }
}

function stageAt(index: number | null): GrChartFunnelActiveStage | null {
  const stage = index === null ? undefined : shares.value[index]

  if (!stage)
    return null

  return {
    index: stage.index,
    label: stage.label,
    value: stage.value,
    shareFirst: stage.shareFirst,
    sharePrev: stage.sharePrev,
  }
}

function describePoint(index: number): string {
  const stage = shares.value[index]

  if (!stage)
    return ''

  return t('grCharts.funnel.stage', '{label}: {value}, {shareFirst} of the first step, {sharePrev} of the previous', {
    label: stage.label,
    value: formatStageValue(stage.value),
    shareFirst: formatStageShare(stage.shareFirst),
    sharePrev: formatStageShare(stage.sharePrev),
  })
}

/**
 * Таблица воронки — обе доли отдельными колонками.
 *
 * Смешать их в одной значило бы соврать: «сорок процентов» от первой ступени и
 * от предыдущей — разные числа, и по одному из них воронку не восстановить.
 */
const tableModel = computed<ChartTableModel>(() => ({
  caption: t('grCharts.funnel.tableCaption', 'Chart data'),
  columns: [
    { key: 'stage', label: t('grCharts.funnel.columnStage', 'Step') },
    { key: 'value', label: t('grCharts.funnel.columnValue', 'Value') },
    { key: 'first', label: t('grCharts.funnel.columnShareFirst', 'Share of first') },
    { key: 'prev', label: t('grCharts.funnel.columnSharePrev', 'Share of previous') },
  ],
  rows: shares.value.map(stage => ({
    header: stage.label,
    cells: [
      formatStageValue(stage.value),
      formatStageShare(stage.shareFirst),
      formatStageShare(stage.sharePrev),
    ],
  })),
}))

const surfaceLabel = computed(() => {
  if (props.ariaLabel)
    return props.ariaLabel

  const label = t('grCharts.funnel.summary', 'Funnel chart, {stages} steps', { stages: props.stages.length })

  return `${label}. ${t('grCharts.funnel.keyboardHint', 'Use arrow keys to browse steps')}`
})

/**
 * Рост между ступенями объявляется словами.
 *
 * Он бывает законным (разные когорты) и бывает ошибкой данных; молча выпрямить
 * его нельзя, а увидеть на рисунке читающий без зрения не может.
 */
const surfaceDescription = computed(() => {
  const rising = shares.value.filter(stage => stage.rising).map(stage => stage.label)
  const parts = [props.ariaDescription]

  if (rising.length > 0)
    parts.push(t('grCharts.funnel.rising', 'Steps larger than the previous one: {steps}', { steps: rising.join(', ') }))

  const text = parts.filter(Boolean).join('. ')

  return text.length > 0 ? text : undefined
})

function onPointClick(point: GrChartActivePoint): void {
  const stage = stageAt(point.index)

  if (stage)
    emit('stageClick', stage)
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
    :empty="empty"
    :empty-text="emptyText"
    :data-table="resolvedDataTable"
    :data-table-max-rows="resolvedTableMaxRows"
    :interactive="interactive"
    :active-index="activeIndex"
    :locale="locale"
    :aria-label="surfaceLabel"
    :aria-description="surfaceDescription"
    :role-description="t('grCharts.funnel.roleDescription', 'funnel chart')"
    :value-format="valueFormat"
    :hit-test="hitTest"
    :anchor-point="anchorPoint"
    :table-model="tableModel"
    :describe-point="describePoint"
    :keyboard="{ axes: 'positions' }"
    data-gr-chart-funnel
    @update:active-index="value => emit('update:activeIndex', value)"
    @point-click="onPointClick"
    @point-hover="value => emit('stageHover', stageAt(value?.index ?? null))"
  >
    <template #header>
      <slot name="header" />
    </template>

    <template #plot="{ plot, activeIndex: cursor }">
      <g data-gr-chart-funnel-body>
        <path
          v-for="stage in stagesOf(plot)"
          :key="stage.index"
          :data-gr-chart-funnel-stage="stage.index"
          :d="funnelPath(stage, isHorizontal)"
          :fill="colorOf(stage.index)"
          :fill-opacity="cursor !== null && cursor !== stage.index ? funnelDimOpacity : undefined"
          stroke="none"
        />

        <text
          v-for="label in stageLabels(plot)"
          :key="`label-${label.index}`"
          :class="frameLabelClass"
          :data-gr-chart-funnel-label="label.index"
          :data-outside="label.inside ? undefined : ''"
          :x="label.x"
          :y="label.y"
          :fill="label.fill"
          :font-size="label.font"
          :text-anchor="label.anchor"
          :dominant-baseline="label.baseline"
        >
{{ label.text }}
</text>
      </g>

      <!-- Имена — вне группы ступеней: это подписи оси, а не марки. -->
      <g data-gr-chart-funnel-names>
        <text
          v-for="name in stageNames(plot)"
          :key="`name-${name.index}`"
          :class="[frameLabelClass, labelSizeClass[resolvedSize]]"
          :data-gr-chart-funnel-name="name.index"
          :x="name.x"
          :y="name.y"
          :fill="labelFill"
          :text-anchor="name.anchor"
          :dominant-baseline="name.anchor === 'end' ? 'middle' : 'auto'"
        >
{{ name.text }}
          <title v-if="name.full">
{{ name.full }}
</title>
</text>
      </g>
    </template>

    <template #tooltip="scope">
      <slot name="tooltip" v-bind="scope" :stage="stageAt(scope.active.index)">
        <div :class="frameTooltipClass">
          <template v-for="stage in [stageAt(scope.active.index)]" :key="stage?.index ?? -1">
            <div v-if="stage" :class="frameTooltipTitleClass">
              {{ stage.label }}
            </div>
            <div v-if="stage" :class="frameTooltipRowClass">
              <span>{{ formatStageValue(stage.value) }}</span>
              <span :class="frameTooltipValueClass">
                {{ formatStageShare(stage.shareFirst) }} · {{ formatStageShare(stage.sharePrev) }}
              </span>
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
