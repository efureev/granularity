<script setup lang="ts">
import { computed } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { grProgressBarFillClass, type GrProgressBarSize, type GrProgressBarTone, trackSizes } from './grStyle'

/**
 * GrProgressBar — линейный индикатор прогресса.
 *
 * @prop value — текущее значение `0..100`; выходящие за границы значения клампятся, `NaN` → `0`.
 * @prop ariaLabel — метка для скринридера (обязательна, если рядом нет видимого заголовка).
 * @prop tone — цветовая тональность заливки (CSS-переменная из `tokens.css`).
 * @prop size — толщина трека.
 */
export interface GrProgressBarProps {
  value: number
  ariaLabel?: string
  tone?: GrProgressBarTone
  size?: GrProgressBarSize
}

const props = withDefaults(defineProps<GrProgressBarProps>(), {
  ariaLabel: undefined,
  tone: 'primary',
  size: undefined,
})

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrProgressBar' })
const trackClassName = computed(() => trackSizes[resolvedSize.value])

const safe = computed(() => {
  if (Number.isNaN(props.value))
    return 0
  return Math.min(100, Math.max(0, props.value))
})

const fillClassName = computed(() => grProgressBarFillClass(props.tone))
</script>

<template>
  <div
    data-gr-progress-bar
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuenow="safe"
    aria-valuemin="0"
    aria-valuemax="100"
    class="w-full rounded-[var(--gr-radius-full)] bg-[var(--gr-muted)] border border-[var(--gr-brd)] overflow-hidden"
    :class="trackClassName"
  >
    <div
      data-gr-progress-bar-fill
      class="h-full"
      :class="fillClassName"
      :style="{ width: `${safe}%` }"
    />
  </div>
</template>
