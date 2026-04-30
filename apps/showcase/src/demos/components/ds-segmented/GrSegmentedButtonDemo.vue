<script setup lang="ts">
import { ref } from 'vue'

import type { GrSegmentedOption, GrSelectOption } from '@feugene/granularity'
import { GrSegmented, GrSelect, type GrSegmentedSize } from '@feugene/granularity'

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
    <div class="grid gap-4 md:grid-cols-2 md:max-w-[520px]">
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--fg)]">
          Segmented size
        </div>
        <GrSelect v-model="size" :options="sizeOptions" />
      </div>

      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--fg)]">
          Indicator speed
        </div>
        <GrSelect v-model="indicatorDuration" :options="durationOptions" />
      </div>
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