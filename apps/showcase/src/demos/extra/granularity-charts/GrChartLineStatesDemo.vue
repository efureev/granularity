<script setup lang="ts">
import { ref } from 'vue'

// Пропуск в ряду — не ноль: линия рвётся, а в таблице данных на его месте «—».
const series = [{ id: 'load', label: 'Load', y: [12, 18, null, 24, 30, 27] }]

const state = ref<'data' | 'loading' | 'empty'>('data')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrButton
        v-for="option in (['data', 'loading', 'empty'] as const)"
        :key="option"
        size="sm"
        :variant="state === option ? 'solid' : 'outlined'"
        @click="state = option"
      >
        {{ option }}
      </GrButton>
    </div>

    <GrChartLine
      :series="state === 'empty' ? [] : series"
      :loading="state === 'loading'"
      :height="200"
      data-table="visible"
      aria-label="Load with a gap in the series"
    />
  </div>
</template>
