<script setup lang="ts">
import { ref } from 'vue'

import { DsSegmented, DsSelect, type DsSegmentedSize } from '@feugene/granularity'

const view = ref<'board' | 'calendar' | 'table'>('board')
const size = ref<DsSegmentedSize>('md')
const indicatorDuration = ref(400)

const sizeOptions = [
  { value: 'xs', label: 'Extra small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
] as const

const durationOptions = [
  { value: 200, label: 'Fast · 200 ms' },
  { value: 400, label: 'Balanced · 400 ms' },
  { value: 800, label: 'Smooth · 800 ms' },
] as const

const viewOptions = [
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'table', label: 'Table' },
] as const
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-4 md:grid-cols-2 md:max-w-[520px]">
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--fg)]">
          Segmented size
        </div>
        <DsSelect v-model="size" :options="sizeOptions" />
      </div>

      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--fg)]">
          Indicator speed
        </div>
        <DsSelect v-model="indicatorDuration" :options="durationOptions" />
      </div>
    </div>

    <DsSegmented
      v-model="view"
      :options="viewOptions"
      variant="button"
      :size="size"
      :indicator-duration="indicatorDuration"
      aria-label="View"
    />
  </div>
</template>