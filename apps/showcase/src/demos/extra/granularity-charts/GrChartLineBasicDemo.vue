<script setup lang="ts">
import { computed, ref } from 'vue'

import { GR_TONES, GrButton, type GrTone } from '@feugene/granularity'

// `GrChartLine` подставляется авто-импортом (`unplugin-vue-components`).

// Ось времени выводится из данных: первый `x` — `Date`, значит шкала `time`.
const points = Array.from({ length: 14 }, (_, day) => ({
  x: new Date(2026, 6, day + 1),
  y: Math.round(120 + Math.sin(day / 2) * 40 + day * 6),
}))

/**
 * Линия красится **ролью темы**, а не готовым цветом: при переключении
 * light/dark ничего не пересоздаётся — значение роли меняет себя само. Отсюда
 * `var(--gr-…)`, а не hex.
 */
const toneColor: Record<GrTone, string> = {
  primary: 'var(--gr-primary)',
  neutral: 'var(--gr-secondary)',
  success: 'var(--gr-success)',
  warning: 'var(--gr-warning)',
  danger: 'var(--gr-danger)',
  info: 'var(--gr-info)',
  slate: 'var(--gr-slate)',
  azure: 'var(--gr-azure)',
}

const lineTone = ref<GrTone>('primary')

const series = computed(() => [{
  id: 'revenue',
  label: 'Выручка',
  data: points,
  color: toneColor[lineTone.value],
}])

/**
 * Курсор поднят в `v-model`, поэтому его можно показать рядом — и так же
 * прокинуть во второй график, чтобы пара двигалась синхронно.
 */
const active = ref<number | null>(null)

const readout = computed(() => {
  const point = active.value === null ? null : points[active.value]

  if (!point)
    return null

  return {
    date: point.x.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
    value: point.y.toLocaleString('ru-RU'),
  }
})
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">Выручка, две недели</span>

      <!-- Место под показания зарезервировано всегда: иначе строка прыгает на каждом наведении. -->
      <span class="min-h-6 text-[length:var(--gr-control-text-sm)]">
        <template v-if="readout">
          <span class="text-[var(--gr-muted-fg)]">{{ readout.date }}</span>
          <strong class="ml-2 [font-variant-numeric:tabular-nums]">{{ readout.value }} ₽</strong>
        </template>
        <span v-else class="text-[var(--gr-muted-fg)]">Наведите курсор или нажмите стрелку</span>
      </span>
    </div>

    <GrChartLine
      v-model:active-index="active"
      :series="series"
      :height="220"
      curve="smooth"
      include-zero
      aria-label="Выручка за две недели"
    />

    <div class="flex flex-wrap items-center gap-2">
      <span class="w-16 shrink-0 text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Линия
      </span>
      <GrButton
        v-for="tone in GR_TONES"
        :key="tone"
        size="sm"
        :variant="lineTone === tone ? 'primary' : 'outline'"
        :tone="tone"
        @click="lineTone = tone"
      >
        {{ tone }}
      </GrButton>
    </div>
  </div>
</template>
