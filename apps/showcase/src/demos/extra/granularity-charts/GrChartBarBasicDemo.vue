<script setup lang="ts">
// `GrChartBar` подставляется авто-импортом (`unplugin-vue-components`).

/**
 * Столбцы отвечают на вопрос «сколько», а не «куда движется»: величину
 * читают высотой полосы, и потому ось у них **всегда** от нуля. Обрежь её —
 * и разница в три процента нарисуется разницей в три раза.
 */
const categories = ['Q1', 'Q2', 'Q3', 'Q4']

const series = [
  { id: 'plan', label: 'План', x: categories, y: [4.2, 4.8, 5.1, 6.0] },
  { id: 'fact', label: 'Факт', x: categories, y: [3.9, 5.2, 4.7, 6.6] },
]
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      План и факт, млн ₽
    </span>

    <GrChartBar
      :series="series"
      :height="240"
      show-legend
      aria-label="План и факт по кварталам"
    />
  </div>
</template>
