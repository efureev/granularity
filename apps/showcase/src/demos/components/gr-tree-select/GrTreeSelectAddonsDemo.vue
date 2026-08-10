<script setup lang="ts">
import { ref } from 'vue'

import { GrTreeSelect } from '@feugene/granularity'

interface CostCentre {
  id: number
  label: string
  children?: CostCentre[]
}

const costCentres: CostCentre[] = [
  {
    id: 1,
    label: 'Marketing',
    children: [
      { id: 11, label: 'Paid acquisition' },
      { id: 12, label: 'Events' },
    ],
  },
  {
    id: 2,
    label: 'Engineering',
    children: [
      { id: 21, label: 'Platform' },
      { id: 22, label: 'Mobile' },
    ],
  },
]

const centre = ref<number | null>(11)
</script>

<template>
  <GrTreeSelect
    v-model="centre"
    :data="costCentres"
    clearable
    :default-expanded-keys="[1]"
    placeholder="Cost centre"
    aria-label="Cost centre"
    prefix-fixed
  >
    <template #prefix>
      <span class="i-lucide-wallet block h-4 w-4" />
    </template>
    <template #suffix>
      EUR
    </template>
  </GrTreeSelect>
</template>
