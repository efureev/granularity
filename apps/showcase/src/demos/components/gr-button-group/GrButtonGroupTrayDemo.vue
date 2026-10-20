<script setup lang="ts">
import { ref } from 'vue'

const range = ref('week')

const ranges = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]
</script>

<template>
  <GrButtonGroup appearance="tray" size="sm" aria-label="Period">
    <GrButton
      v-for="item in ranges"
      :key="item.value"
      :aria-pressed="range === item.value ? 'true' : 'false'"
      @click="range = item.value"
    >
      {{ item.label }}
    </GrButton>
  </GrButtonGroup>
</template>
