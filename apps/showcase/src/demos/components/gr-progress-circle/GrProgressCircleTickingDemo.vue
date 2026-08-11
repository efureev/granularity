<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { GrProgressCircle } from '@feugene/granularity'

import { useTweenedValue } from './useTweenedValue'

const STEP = 5
const START = 35

const { value: fast, tweenTo: tweenFast, jumpTo: jumpFast } = useTweenedValue(START)
const { value: slow, tweenTo: tweenSlow, jumpTo: jumpSlow } = useTweenedValue(START)

let fastTimer: ReturnType<typeof setInterval> | undefined
let slowTimer: ReturnType<typeof setInterval> | undefined

/**
 * Шаг занимает весь интервал до следующего — тогда движение читается как
 * непрерывное. На конце шкалы плавный переход был бы перемоткой назад через
 * всё кольцо, поэтому там значение возвращается мгновенно.
 */
function advance(
  current: number,
  tweenTo: (value: number, duration: number) => void,
  jumpTo: (value: number) => void,
  duration: number,
): void {
  const next = current + STEP

  if (next > 100) jumpTo(0)
  else tweenTo(next, duration)
}

/**
 * Само движение здесь и есть предмет демо, поэтому под «уменьшить движение»
 * таймеры не запускаются вовсе: кольца остаются на стартовых значениях.
 * `matchMedia` читается в `onMounted`, а не в теле `setup`.
 */
onMounted(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return

  fastTimer = setInterval(() => advance(fast.value, tweenFast, jumpFast, 1000), 1000)
  slowTimer = setInterval(() => advance(slow.value, tweenSlow, jumpSlow, 5000), 5000)
})

onBeforeUnmount(() => {
  clearInterval(fastTimer)
  clearInterval(slowTimer)
})
</script>

<template>
  <div class="flex flex-wrap items-start gap-10">
    <div class="grid justify-items-center gap-2">
      <GrProgressCircle :value="fast" size="lg" show-value aria-label="Обновление раз в секунду" />
      <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
        +{{ STEP }} % раз в секунду
      </span>
    </div>

    <div class="grid justify-items-center gap-2">
      <GrProgressCircle :value="slow" size="lg" tone="info" show-value aria-label="Обновление раз в пять секунд" />
      <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
        +{{ STEP }} % раз в пять секунд
      </span>
    </div>

    <p class="max-w-xs text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]">
      Оба кольца прибавляют по {{ STEP }} % на шаг, но левое делает это раз в секунду, а правое — раз в пять,
      и каждый шаг растянут на весь интервал до следующего: движение идёт от прежней точки к новой, а не рывком.
    </p>
  </div>
</template>
