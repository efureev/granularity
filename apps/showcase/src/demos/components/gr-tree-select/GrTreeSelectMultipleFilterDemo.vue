<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrTreeSelect } from '@feugene/granularity'

type TreeSelectItem = {
  id: number
  label: string
  children?: TreeSelectItem[]
}

const treeData: TreeSelectItem[] = [
  {
    id: 1,
    label: 'Platform',
    children: [
      { id: 11, label: 'API gateway' },
      { id: 12, label: 'Observability' },
    ],
  },
  {
    id: 2,
    label: 'Customer success',
    children: [
      { id: 21, label: 'Escalations' },
      { id: 22, label: 'Renewals' },
    ],
  },
  {
    id: 3,
    label: 'Growth',
    children: [
      { id: 31, label: 'Experiments' },
      { id: 32, label: 'Attribution' },
    ],
  },
]

const selectedValues = ref<Array<number | string>>([12, 21])

const selectionLabel = computed(() => {
  if (selectedValues.value.length === 0)
    return 'Nothing selected yet'

  return `Selected ${selectedValues.value.length} nodes`
})
</script>

<template>
  <div class="grid gap-4">
    <GrTreeSelect
      v-model="selectedValues"
      :data="treeData"
      multiple
      filterable
      clearable
      :close-on-select="false"
      placeholder="Filter and pick several areas"
      aria-label="Filter and pick several areas"
      :default-expanded-keys="[1, 2, 3]"
    />

    <div class="flex flex-wrap gap-2">
      <GrBadge v-for="value in selectedValues" :key="value">
        {{ value }}
      </GrBadge>
      <GrBadge tone="neutral">
        {{ selectionLabel }}
      </GrBadge>
    </div>
  </div>
</template>