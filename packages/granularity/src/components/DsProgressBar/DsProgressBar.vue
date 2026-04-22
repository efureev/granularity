<script setup lang="ts">
import { computed } from 'vue'

import { dsProgressBarFillClass, type DsProgressBarTone } from './dsStyle'

/**
 * DsProgressBar — линейный индикатор прогресса.
 *
 * @prop value — текущее значение `0..100`; выходящие за границы значения клампятся, `NaN` → `0`.
 * @prop ariaLabel — метка для скринридера (обязательна, если рядом нет видимого заголовка).
 * @prop tone — цветовая тональность заливки (CSS-переменная из `tokens.css`).
 */
export interface DsProgressBarProps {
  value: number
  ariaLabel?: string
  tone?: DsProgressBarTone
}

const props = withDefaults(defineProps<DsProgressBarProps>(), {
  ariaLabel: undefined,
  tone: 'primary',
})

const safe = computed(() => {
  if (Number.isNaN(props.value))
    return 0
  return Math.min(100, Math.max(0, props.value))
})

const fillClassName = computed(() => dsProgressBarFillClass(props.tone))
</script>

<template>
  <div
    data-ds-progress-bar
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuenow="safe"
    aria-valuemin="0"
    aria-valuemax="100"
    class="h-2 w-full rounded-full bg-[var(--muted)] border border-[var(--brd)] overflow-hidden"
  >
    <div
      data-ds-progress-bar-fill
      class="h-full"
      :class="fillClassName"
      :style="{ width: `${safe}%` }"
    />
  </div>
</template>
