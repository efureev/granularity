<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrRadioGroup } from '@feugene/granularity'

const status = ref('review')

const options = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'published', label: 'Published' },
]

const selectedOption = computed(() => options.find(option => option.value === status.value)?.label ?? status.value)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <GrRadioGroup v-model="status" :options="options" />

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Selected state:
      <div class="mt-2 text-base font-semibold text-[var(--fg)]">
        {{ selectedOption }}
      </div>
    </div>
  </div>
</template>