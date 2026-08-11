<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrSegmentedOption, GrSegmentedOrientation } from '@feugene/granularity'
import { GrSegmented } from '@feugene/granularity'

const scope = ref('all')
const orientation = ref<GrSegmentedOrientation>('vertical')

const filters: GrSegmentedOption[] = [
  { value: 'all', label: 'All issues' },
  { value: 'mine', label: 'Assigned to me' },
  { value: 'review', label: 'In review' },
  { value: 'archived', label: 'Archived', disabled: true },
]

const orientations: GrSegmentedOption[] = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
]

const activeLabel = computed(() => filters.find(f => f.value === scope.value)?.label ?? scope.value)
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="orientation"
      :options="orientations"
      size="sm"
      aria-label="Orientation"
    />

    <div
      class="grid gap-4 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4"
      :class="orientation === 'vertical' ? 'md:grid-cols-[220px_minmax(0,1fr)]' : ''"
    >
      <GrSegmented
        v-model="scope"
        :options="filters"
        :orientation="orientation"
        :block="orientation === 'vertical'"
        aria-label="Issue filter"
      />

      <div class="text-sm text-[var(--gr-muted-fg)]">
        Sidebar filters are the reason vertical exists. The indicator needed nothing new — it is measured in two
        dimensions, so it slides down the column exactly as it slides across the row.
        <div class="mt-2 text-base font-semibold text-[var(--gr-fg)]">
          {{ activeLabel }}
        </div>
      </div>
    </div>
  </div>
</template>
