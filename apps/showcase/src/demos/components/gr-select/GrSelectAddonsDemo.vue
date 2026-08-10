<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const currencies = [
  { value: 'eur', label: 'Euro' },
  { value: 'usd', label: 'US Dollar' },
  { value: 'gbp', label: 'Pound Sterling' },
]

const currency = ref('eur')
</script>

<template>
  <GrSelect
    v-model="currency"
    :options="currencies"
    options-view="panel"
    clearable
    aria-label="Settlement currency"
  >
    <template #prefix>
      <span class="i-lucide-banknote block h-4 w-4" />
    </template>
    <template #suffix>
      per month
    </template>
  </GrSelect>
</template>
