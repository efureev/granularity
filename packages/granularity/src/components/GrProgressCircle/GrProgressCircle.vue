<script setup lang="ts">
import { computed, useSlots } from 'vue'

import IconCheck from '~icons/lucide/check'
import IconError from '~icons/lucide/x'

import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { hasMeaningfulSlotContent } from '../shared/slotNodes'
import { arcGeometry, clampProgress, VIEW_BOX, type GrProgressCircleShape } from './geometry'
import {
  centerClass,
  diameterBySize,
  grProgressCircleArcColor,
  rootClass,
  statusIconSizeBySize,
  svgClass,
  thicknessBySize,
  valueClass,
  valueTextSizeBySize,
  type GrProgressCircleSize,
  type GrProgressCircleTone,
} from './grProgressCircleStyles'

export type { GrProgressCircleShape } from './geometry'
export type { GrProgressCircleSize, GrProgressCircleTone } from './grProgressCircleStyles'

/**
 * Пропы {@link GrProgressCircle}.
 *
 * Круговой индикатор: определённый режим по `value`, неопределённый по
 * `indeterminate`, замкнутое кольцо или дуга-«дашборд».
 */
export interface GrProgressCircleProps {
  /** Текущее значение `0..100`; выходящие за границы клампятся, `NaN` → `0`. */
  value?: number
  /** Прогресс неизвестен: дуга бежит по кругу, значение наружу не объявляется. */
  indeterminate?: boolean
  /** Замкнутое кольцо или дуга с вырезом снизу. */
  shape?: GrProgressCircleShape
  /** Показать значение в центре кольца. Слот по умолчанию сильнее. */
  showValue?: boolean
  /** Свой формат значения. Управляет и подписью, и `aria-valuetext`. */
  formatValue?: (value: number) => string
  /** На завершении — галочка, при `tone="danger"` — крест вместо значения. */
  statusIcon?: boolean
  /** Метка для скринридера (обязательна, если рядом нет видимого заголовка). */
  ariaLabel?: string
  /** Цветовая тональность дуги. */
  tone?: GrProgressCircleTone
  /** Диаметр кольца по шкале пакета. */
  size?: GrProgressCircleSize
  /** Толщина обводки в процентах диаметра. Не задана — по ступени `size`. */
  thickness?: number
  /** Убрать дорожку: поверх картинки пустая часть кольца только шумит. */
  trackless?: boolean
}

const props = withDefaults(defineProps<GrProgressCircleProps>(), {
  value: 0,
  indeterminate: false,
  showValue: false,
  formatValue: undefined,
  statusIcon: false,
  ariaLabel: undefined,
  thickness: undefined,
  // `undefined`, а не готовые значения: иначе `componentDefaults` до них не дошли бы.
  shape: undefined,
  tone: undefined,
  size: undefined,
  trackless: undefined,
})

defineSlots<{
  /** Содержимое центра вместо значения: иконка, две строки, кнопка отмены. */
  default?: (props: { value: number }) => any
}>()

const slots = useSlots()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrProgressCircle' })
const resolvedTone = useGrComponentProp('GrProgressCircle', 'tone', () => props.tone, 'primary')
const resolvedShape = useGrComponentProp('GrProgressCircle', 'shape', () => props.shape, 'circle')
const resolvedTrackless = useGrComponentProp('GrProgressCircle', 'trackless', () => props.trackless, false)

const safe = computed(() => clampProgress(props.value))

const thickness = computed(() => props.thickness ?? thicknessBySize[resolvedSize.value])

const arc = computed(() => arcGeometry(resolvedShape.value, thickness.value, safe.value))

const rootStyle = computed(() => ({
  width: `var(--gr-progress-circle-size, ${diameterBySize[resolvedSize.value]})`,
  height: `var(--gr-progress-circle-size, ${diameterBySize[resolvedSize.value]})`,
}))

const arcStyle = computed(() => ({
  transform: `rotate(${arc.value.rotation}deg)`,
  transformOrigin: '50% 50%',
}))

const arcColor = computed(() => grProgressCircleArcColor(resolvedTone.value))

/**
 * `aria-valuetext` нужен только со своим форматом: «45» при `aria-valuemax="100"`
 * диктор и так читает как проценты.
 */
const valueText = computed(() => (props.formatValue ? props.formatValue(safe.value) : undefined))
const valueLabel = computed(() => valueText.value ?? `${Math.round(safe.value)}%`)

const isComplete = computed(() => !props.indeterminate && safe.value >= 100)
const isFailed = computed(() => resolvedTone.value === 'danger')

/**
 * Приоритет центра: слот сильнее иконки итога, иконка итога — значения.
 *
 * Считается по содержимому слота, а не по факту его передачи: слот с `v-if`
 * (кнопка отмены, живущая только на время загрузки) приходит комментарием, и
 * центр остался бы пустым вместо значения.
 */
const hasSlotContent = computed(() => hasMeaningfulSlotContent(slots.default?.({ value: safe.value }) ?? []))
const showStatusIcon = computed(() => !hasSlotContent.value && props.statusIcon && (isComplete.value || isFailed.value))
const showValueLabel = computed(() => !hasSlotContent.value && props.showValue && !props.indeterminate && !showStatusIcon.value)
const hasCenter = computed(() => hasSlotContent.value || showStatusIcon.value || showValueLabel.value)
</script>

<template>
  <div
    data-gr-progress-circle
    :data-tone="resolvedTone"
    :data-shape="resolvedShape"
    :class="rootClass"
    :style="rootStyle"
  >
    <div
      data-gr-progress-circle-widget
      :data-gr-progress-circle-indeterminate="indeterminate ? '' : undefined"
      role="progressbar"
      class="h-full w-full"
      :aria-label="ariaLabel"
      :aria-valuenow="indeterminate ? undefined : safe"
      :aria-valuetext="indeterminate ? undefined : valueText"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <svg
        :class="svgClass"
        :viewBox="`0 0 ${VIEW_BOX} ${VIEW_BOX}`"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          v-if="!resolvedTrackless"
          data-gr-progress-circle-track
          :cx="VIEW_BOX / 2"
          :cy="VIEW_BOX / 2"
          :r="arc.radius"
          fill="none"
          :stroke-width="thickness"
          :stroke-dasharray="arc.trackDashArray"
          :style="arcStyle"
        />

        <!-- Нулевая дуга при круглом торце нарисовалась бы точкой — «начали». -->
        <circle
          v-if="indeterminate || safe > 0"
          data-gr-progress-circle-arc
          :cx="VIEW_BOX / 2"
          :cy="VIEW_BOX / 2"
          :r="arc.radius"
          fill="none"
          :stroke="arcColor"
          :stroke-width="thickness"
          :stroke-dasharray="indeterminate ? `${arc.circumference * 0.25} ${arc.circumference}` : arc.valueDashArray"
          :style="arcStyle"
        />
      </svg>
    </div>

    <!--
      Центр — сосед виджета, а не его потомок: `role="progressbar"` объявляет
      потомков презентационными, и кнопка «Отменить» внутри кольца стала бы
      `nested-interactive`.
    -->
    <div
      v-if="hasCenter"
      data-gr-progress-circle-center
      :class="centerClass"
      :style="{ fontSize: `var(--gr-progress-circle-value-size, ${valueTextSizeBySize[resolvedSize]})` }"
    >
      <slot v-if="hasSlotContent" :value="safe" />

      <component
        :is="isComplete ? IconCheck : IconError"
        v-else-if="showStatusIcon"
        data-gr-progress-circle-status
        aria-hidden="true"
        :class="statusIconSizeBySize[resolvedSize]"
        :style="{ color: arcColor }"
      />

      <span
        v-else-if="showValueLabel"
        data-gr-progress-circle-value
        :class="valueClass"
      >{{ valueLabel }}</span>
    </div>
  </div>
</template>

<style>
[data-gr-progress-circle-track] {
  stroke: var(--gr-progress-circle-track, var(--gr-muted));
}

[data-gr-progress-circle-arc] {
  stroke-linecap: var(--gr-progress-circle-cap, round);
  transition: stroke-dasharray var(--gr-duration-base) var(--gr-ease-out);
}

/* Оба кадра заданы явно: иначе стартом становится инлайновый поворот дуги, и
   каждый оборот заканчивался бы скачком. */
@keyframes gr-progress-circle-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

[data-gr-progress-circle-indeterminate] [data-gr-progress-circle-arc] {
  animation-name: gr-progress-circle-spin;
  animation-duration: var(--gr-progress-indeterminate-duration, 1.4s);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  transition: none;
}

/*
 * Замерев в исходном кадре, четверть кольца читалась бы как «прогресс 25 %».
 * Замкнутая нейтральная дорожка не притворяется ни нулём, ни завершением: она
 * говорит «работа идёт, значение неизвестно» — тот же приём, что у полосы.
 */
@media (prefers-reduced-motion: reduce) {
  [data-gr-progress-circle-indeterminate] [data-gr-progress-circle-arc] {
    animation: none;
    stroke: var(--gr-progress-indeterminate-bg, var(--gr-muted-fg));
    stroke-dasharray: none;
  }
}
</style>
