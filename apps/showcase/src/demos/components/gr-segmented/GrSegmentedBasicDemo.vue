<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrSegmentedOption } from '@feugene/granularity'
import { GrBadge, GrSegmented } from '@feugene/granularity'

const period = ref<'day' | 'week' | 'month'>('week')

const options: GrSegmentedOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

const selectionLabel = computed(() => options.find(option => option.value === period.value)?.label ?? period.value)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-4 rounded-[24px] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-[var(--gr-fg)]">
            Revenue snapshot
          </div>
          <div class="mt-1 text-sm text-[var(--gr-muted-fg)]">
            A switcher with a soft pills backing and an animated selected track.
          </div>
        </div>
        <GrBadge tone="success" size="sm">
          +12.4%
        </GrBadge>
      </div>

      <GrSegmented v-model="period" :options="options" :indicator-duration="360" aria-label="Period" />
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      Active segment:
      <div class="mt-2 text-base font-semibold text-[var(--gr-fg)]">
        {{ selectionLabel }}
      </div>
    </div>
  </div>
</template>