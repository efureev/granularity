<script setup lang="ts">
import { ref } from 'vue'

// Шесть серий на палитре из пяти ролей: шестая повторяет цвет первой, но
// отличается формой точки — цвет никогда не единственный различитель.
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const series = ['North', 'South', 'East', 'West', 'Online', 'Partners'].map((label, index) => ({
  id: label.toLowerCase(),
  label,
  data: months.map((month, position) => ({
    x: month,
    y: Math.round(40 + index * 12 + Math.cos(position + index) * 15),
  })),
}))

const hidden = ref<string[]>(['partners'])
</script>

<template>
  <div class="grid gap-4">
    <GrChartLine
      v-model:hidden-series="hidden"
      :series="series"
      :height="240"
      show-legend
      legend-position="bottom"
      show-points="always"
      show-grid="both"
    />

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">hiddenSeries=</span>
      <code>{{ hidden.length ? hidden.join(', ') : '—' }}</code>
    </p>
  </div>
</template>
