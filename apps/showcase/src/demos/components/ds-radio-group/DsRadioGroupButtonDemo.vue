<script setup lang="ts">
import { ref } from 'vue'

import { DsRadioGroup, DsSelect } from '@feugene/granularity'

const view = ref('board')
const size = ref<'sm' | 'md' | 'lg'>('md')

const sizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const viewOptions = [
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'table', label: 'Table' },
]
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-3 md:max-w-[220px]">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Button size
      </div>
      <DsSelect v-model="size" :options="sizeOptions" />
    </div>

    <DsRadioGroup v-model="view" :options="viewOptions" variant="button" :size="size" />
  </div>
</template>