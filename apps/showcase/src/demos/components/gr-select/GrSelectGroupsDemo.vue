<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const groupedOptions = [
  {
    label: 'Popular cities',
    options: [
      { value: 'Shanghai', label: 'Shanghai' },
      { value: 'Beijing', label: 'Beijing' },
    ],
  },
  {
    label: 'City name',
    options: [
      { value: 'Chengdu', label: 'Chengdu' },
      { value: 'Shenzhen', label: 'Shenzhen' },
      { value: 'Guangzhou', label: 'Guangzhou' },
      { value: 'Dalian', label: 'Dalian' },
    ],
  },
]

const nativeCity = ref('Beijing')
const panelCity = ref('Chengdu')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid gap-2">
      <span class="text-sm text-[var(--gr-muted-fg)]">Native (optgroup)</span>
      <GrSelect
        v-model="nativeCity"
        :options="groupedOptions"
        placeholder="Pick a city"
        aria-label="Pick a city (native)"
      />
    </div>

    <div class="grid gap-2">
      <span class="text-sm text-[var(--gr-muted-fg)]">Panel (group headers)</span>
      <GrSelect
        v-model="panelCity"
        optionsView="panel"
        :options="groupedOptions"
        placeholder="Pick a city"
        aria-label="Pick a city (panel)"
      />
    </div>
  </div>
</template>
