<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete } from '@feugene/granularity'

const airports = [
  { value: 'LED', label: 'Saint Petersburg — LED' },
  { value: 'AER', label: 'Sochi — AER' },
  { value: 'KZN', label: 'Kazan — KZN' },
  { value: 'SVO', label: 'Moscow — SVO' },
]

const from = ref('LED')
</script>

<template>
  <GrAutocomplete
    v-model="from"
    :options="airports"
    clearable
    placeholder="Where from?"
    aria-label="Departure airport"
  >
    <template #prefix>
      <span class="i-lucide-plane-takeoff block h-4 w-4" />
    </template>
    <template #suffix>
      IATA
    </template>
  </GrAutocomplete>
</template>
