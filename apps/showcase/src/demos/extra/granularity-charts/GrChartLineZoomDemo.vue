<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Приближение к участку длинного ряда.
 *
 * Ряд тот же, что у демонстрации прореживания, и это существенно: на полном
 * ряде мелкая рябь ложится сплошной штриховкой — бюджет даёт одну вершину на
 * семь точек. В суженном окне те же данные рисуются целиком, и рябь становится
 * различимой формой.
 */
const POINTS = 10_000

const series = [{
  id: 'cpu',
  label: 'Загрузка CPU',
  x: Array.from({ length: POINTS }, (_, index) => index),
  y: Array.from({ length: POINTS }, (_, index) => {
    const wave = Math.sin(index / 420) * 18 + Math.sin(index / 37) * 4
    const ripple = Math.sin(index / 3) * 1.6
    return Number((46 + wave + ripple).toFixed(2))
  }),
}]

const xWindow = ref<readonly [number, number] | null>(null)

const hours = (value: number) => `${Math.round(value / 60)} ч`

const bounds = computed(() => (
  xWindow.value === null
    ? 'весь ряд'
    : `${hours(xWindow.value[0])} — ${hours(xWindow.value[1])}`
))

const points = computed(() => (
  xWindow.value === null
    ? POINTS
    : Math.round(xWindow.value[1]) - Math.round(xWindow.value[0]) + 1
))
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Показано: <strong>{{ bounds }}</strong>, точек: <strong>{{ points.toLocaleString('ru') }}</strong>
      </span>

      <GrButton size="sm" variant="outline" :disabled="xWindow === null" @click="xWindow = null">
        Весь ряд
      </GrButton>
    </div>

    <GrChartLine
      v-model:x-window="xWindow"
      :series="series"
      zoom="both"
      :height="260"
      :x-tick-format="hours"
      aria-label="Загрузка CPU за неделю"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Протяните по холсту или покрутите колесо — окно сузится, и мелкая рябь из
      сплошной штриховки станет различимой формой: бюджет прореживания считается
      от ширины области, а точек в окне меньше, и на каждую приходится больше
      вершин. Окно выбирает <strong>данные</strong>,
      а не обрезает рисунок: <kbd>End</kbd> ведёт к последней видимой точке, а
      скрытая таблица печатает строки окна. Клавиатурой график не приближается —
      поэтому окно и выведено наружу как <code>v-model:x-window</code>, а кнопка
      сброса выше достижима табом.
    </p>
  </div>
</template>
