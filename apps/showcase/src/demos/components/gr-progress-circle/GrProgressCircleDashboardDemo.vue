<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { GrCard, GrProgressCircle } from '@feugene/granularity'

import { useTweenedValue } from './useTweenedValue'

const metrics = [
  { label: 'CPU', value: 72, tone: 'primary' as const },
  { label: 'Память', value: 91, tone: 'warning' as const },
  { label: 'Диск', value: 34, tone: 'success' as const },
]

/** Живая метрика: случайный шаг в пределах ±5 %, но не дальше ±10 % от базы. */
const LIVE_BASE = 58
const STEP = 5
const BAND = 10
const TICK = 1000

const { value: live, tweenTo } = useTweenedValue(LIVE_BASE)

let timer: ReturnType<typeof setInterval> | undefined

function nextValue(current: number): number {
  const delta = (Math.random() * 2 - 1) * STEP

  return Math.min(LIVE_BASE + BAND, Math.max(LIVE_BASE - BAND, current + delta))
}

onMounted(() => {
  // Дрожащая цифра — ровно то, чего не хочет «уменьшить движение».
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return

  timer = setInterval(() => tweenTo(nextValue(live.value), TICK), TICK)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <GrCard v-for="metric in metrics" :key="metric.label">
      <div class="grid justify-items-center gap-2 px-4 py-2">
        <GrProgressCircle
          :value="metric.value"
          :tone="metric.tone"
          shape="dashboard"
          size="lg"
          show-value
          :aria-label="metric.label"
        />
        <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">{{ metric.label }}</span>
      </div>
    </GrCard>

    <GrCard>
      <div class="grid justify-items-center gap-2 px-4 py-2">
        <GrProgressCircle
          :value="live"
          tone="info"
          shape="dashboard"
          size="lg"
          show-value
          aria-label="Сеть"
        />
        <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">Сеть · вживую</span>
      </div>
    </GrCard>
  </div>
</template>
