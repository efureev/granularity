<script setup lang="ts">
import { computed } from 'vue'

import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import {
  bufferClass,
  grProgressBarFillClass,
  type GrProgressBarSize,
  type GrProgressBarTone,
  rowGaps,
  trackSizes,
  valueTextSizes,
} from './grStyle'

/**
 * Пропы {@link GrProgressBar}.
 *
 * Линейный индикатор прогресса: определённый режим по `value` и неопределённый
 * по `indeterminate`, необязательный слой буфера и подпись значения.
 */
export interface GrProgressBarProps {
  /** Текущее значение `0..100`; выходящие за границы клампятся, `NaN` → `0`. */
  value: number
  /** Загружено с запасом: слой позади заливки, `0..100`. Не задан — слоя нет. */
  buffer?: number
  /** Прогресс неизвестен: полоса бежит, значение наружу не объявляется. */
  indeterminate?: boolean
  /** Показать значение подписью справа от трека. */
  showValue?: boolean
  /** Свой формат значения. Управляет и подписью, и `aria-valuetext`. */
  formatValue?: (value: number) => string
  /** Метка для скринридера (обязательна, если рядом нет видимого заголовка). */
  ariaLabel?: string
  /** Цветовая тональность заливки. */
  tone?: GrProgressBarTone
  /** Толщина трека. */
  size?: GrProgressBarSize
  /** Убрать рамку трека: внутри карточки вторая рамка только шумит. */
  borderless?: boolean
}

const props = withDefaults(defineProps<GrProgressBarProps>(), {
  buffer: undefined,
  indeterminate: false,
  showValue: false,
  formatValue: undefined,
  ariaLabel: undefined,
  tone: 'primary',
  size: undefined,
  // `undefined`, а не `false`: иначе значение из `componentDefaults` не дошло бы.
  borderless: undefined,
})

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrProgressBar' })
const resolvedBorderless = useGrComponentProp('GrProgressBar', 'borderless', () => props.borderless, false)
const trackClassName = computed(() => trackSizes[resolvedSize.value])
const rowGapClassName = computed(() => rowGaps[resolvedSize.value])
const valueClassName = computed(() => valueTextSizes[resolvedSize.value])

function clampValue(value: number): number {
  if (Number.isNaN(value))
    return 0
  return Math.min(100, Math.max(0, value))
}

const safe = computed(() => clampValue(props.value))
const safeBuffer = computed(() => (props.buffer === undefined ? undefined : clampValue(props.buffer)))

const fillClassName = computed(() => grProgressBarFillClass(props.tone))

/**
 * `aria-valuetext` нужен только со своим форматом: «45» при `aria-valuemax="100"`
 * диктор и так читает как проценты, дублировать это текстом незачем.
 */
const valueText = computed(() => (props.formatValue ? props.formatValue(safe.value) : undefined))
const valueLabel = computed(() => valueText.value ?? `${Math.round(safe.value)}%`)
</script>

<template>
  <div
    data-gr-progress-bar
    class="w-full flex items-center"
    :class="rowGapClassName"
  >
    <div
      data-gr-progress-bar-track
      :data-gr-progress-bar-indeterminate="indeterminate ? '' : undefined"
      role="progressbar"
      :aria-label="ariaLabel"
      :aria-valuenow="indeterminate ? undefined : safe"
      :aria-valuetext="indeterminate ? undefined : valueText"
      aria-valuemin="0"
      aria-valuemax="100"
      class="relative min-w-0 flex-1 rounded-[var(--gr-radius-full)] bg-[var(--gr-muted)] overflow-hidden"
      :class="[trackClassName, resolvedBorderless ? '' : 'border border-[var(--gr-brd)]']"
    >
      <div
        v-if="safeBuffer !== undefined && !indeterminate"
        data-gr-progress-bar-buffer
        class="absolute inset-y-0 left-0"
        :class="bufferClass"
        :style="{ width: `${safeBuffer}%` }"
      />
      <div
        data-gr-progress-bar-fill
        class="absolute inset-y-0 left-0"
        :class="fillClassName"
        :style="indeterminate ? undefined : { width: `${safe}%` }"
      />
    </div>
    <span
      v-if="showValue && !indeterminate"
      data-gr-progress-bar-value
      class="text-[var(--gr-muted-fg)] tabular-nums min-w-[4ch] text-right"
      :class="valueClassName"
    >{{ valueLabel }}</span>
  </div>
</template>

<style>
@keyframes gr-progress-indeterminate {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}

/* Ширина бегущей полосы задаётся здесь, а не инлайном: инлайн-стиль перебил бы
   раскладку под `reduce` ниже. */
[data-gr-progress-bar-indeterminate] [data-gr-progress-bar-fill] {
  width: 40%;
  animation-name: gr-progress-indeterminate;
  animation-duration: var(--gr-progress-indeterminate-duration, 1.4s);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* Замерев в исходном кадре, полоса легла бы у левого края и читалась как
   «прогресс 40%». Нейтральная заливка на всю ширину не притворяется ни нулём,
   ни завершением: она говорит «работа идёт, значение неизвестно». */
@media (prefers-reduced-motion: reduce) {
  [data-gr-progress-bar-indeterminate] [data-gr-progress-bar-fill] {
    width: 100%;
    animation: none;
    background-color: var(--gr-progress-indeterminate-bg, var(--gr-muted-fg));
  }
}
</style>
