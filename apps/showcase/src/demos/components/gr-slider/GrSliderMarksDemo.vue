<script setup lang="ts">
import { ref } from 'vue'

import { GrSlider } from '@feugene/granularity'

const quality = ref(50)

const marks = {
  0: 'Low',
  25: 'Fair',
  50: 'Good',
  75: 'High',
  100: 'Max',
}
</script>

<template>
  <div class="grid gap-8">
    <GrSlider
      v-model="quality"
      :min="0"
      :max="100"
      :step="25"
      :marks="marks"
      aria-label="Quality"
    />

    <div class="grid gap-6">
      <GrSlider :model-value="30" size="sm" aria-label="Small" />
      <GrSlider :model-value="60" size="lg" disabled aria-label="Large disabled" />
    </div>
  </div>
</template>
