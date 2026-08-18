<script setup lang="ts">
import { ref } from 'vue'

import type { GrSegmentedOption, GrSelectOption, GrSegmentedSize } from '@feugene/granularity'
import { GrFormField, GrSegmented, GrSelect } from '@feugene/granularity'

const view = ref<'board' | 'calendar' | 'table'>('board')
const size = ref<GrSegmentedSize>('md')
const indicatorDuration = ref('400')

const sizeOptions: GrSelectOption[] = [
  { value: 'xs', label: 'Extra small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const durationOptions: GrSelectOption[] = [
  { value: '200', label: 'Fast · 200 ms' },
  { value: '400', label: 'Balanced · 400 ms' },
  { value: '800', label: 'Smooth · 800 ms' },
]

const viewOptions: GrSegmentedOption[] = [
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'table', label: 'Table' },
]
</script>

<template>
  <div class="grid gap-4">
    <!-- Подписи через GrFormField, а не отдельным div: он выдаёт контролу id и
         связывает с ним `<label for>`. Нарисованный рядом текст доступным именем
         не становится — селект остаётся безымянным для скринридера. -->
    <div class="grid gap-4 md:grid-cols-2 md:max-w-[520px]">
      <GrFormField label="Segmented size">
        <GrSelect v-model="size" :options="sizeOptions" />
      </GrFormField>

      <GrFormField label="Indicator speed">
        <GrSelect v-model="indicatorDuration" :options="durationOptions" />
      </GrFormField>
    </div>

    <GrSegmented
      v-model="view"
      :options="viewOptions"
      variant="button"
      :size="size"
      :indicator-duration="Number(indicatorDuration)"
      aria-label="View"
    />
  </div>
</template>