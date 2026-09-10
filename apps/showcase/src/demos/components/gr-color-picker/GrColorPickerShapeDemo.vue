<script setup lang="ts">
import { ref } from 'vue'

import type { GrComponentSize, GrControlShape } from '@feugene/granularity'
import { GrColorPicker, GrSegmented } from '@feugene/granularity'

const shape = ref<GrControlShape>('pill')
const sizes: GrComponentSize[] = ['xs', 'sm', 'md', 'lg']

const colors = ref<Record<string, string>>({
  xs: '#3b82f6',
  sm: '#10b981',
  md: '#f59e0b',
  lg: '#ef4444',
})
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="shape"
      :options="[{ value: 'box', label: 'box' }, { value: 'pill', label: 'pill' }]"
      size="sm"
      aria-label="Border shape"
    />

    <!--
      Образец цвета стоит первым в триггере, и отступ пилюли отодвигает его от
      дуги — у коробки он мельче, чем у полей ввода, именно ради этого образца.
    -->
    <div class="grid gap-3 sm:grid-cols-2">
      <GrColorPicker
        v-for="size in sizes"
        :key="size"
        v-model="colors[size]"
        :size="size"
        :shape="shape"
        :aria-label="`Brand colour, size ${size}`"
      />
    </div>
  </div>
</template>
