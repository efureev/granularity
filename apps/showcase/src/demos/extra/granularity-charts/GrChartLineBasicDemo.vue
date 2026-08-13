<script setup lang="ts">
import { ref } from 'vue'

// `GrChartLine` подставляется авто-импортом (`unplugin-vue-components`).

// Ось времени выводится из данных: первый `x` — `Date`, значит шкала `time`.
const series = [
  {
    id: 'revenue',
    label: 'Revenue',
    data: Array.from({ length: 14 }, (_, day) => ({
      x: new Date(2026, 6, day + 1),
      y: Math.round(120 + Math.sin(day / 2) * 40 + day * 6),
    })),
  },
]

const active = ref<number | null>(null)
</script>

<template>
  <div class="grid gap-4">
    <GrChartLine
      v-model:active-index="active"
      :series="series"
      :height="220"
      curve="smooth"
      include-zero
      aria-label="Revenue for two weeks"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">activeIndex=</span>
      <code>{{ active ?? '—' }}</code>
      <span class="opacity-70"> · стрелки двигают точку, Esc снимает выбор</span>
    </p>
  </div>
</template>
