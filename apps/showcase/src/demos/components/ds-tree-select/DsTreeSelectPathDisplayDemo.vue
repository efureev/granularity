<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsTreeSelect } from '@feugene/granularity'

type TreeSelectItem = {
  id: number
  label: string
  children?: TreeSelectItem[]
}

const treeData: TreeSelectItem[] = [
  {
    id: 1,
    label: 'Finance',
    children: [
      { id: 11, label: 'Invoices' },
      {
        id: 12,
        label: 'Reconciliation',
        children: [
          { id: 121, label: 'Daily close' },
          { id: 122, label: 'Payout matching' },
        ],
      },
    ],
  },
  {
    id: 2,
    label: 'Operations',
    children: [
      { id: 21, label: 'Escalations' },
      { id: 22, label: 'Runbooks' },
    ],
  },
]

const value = ref<number | null>(122)
</script>

<template>
  <div class="grid gap-4">
    <DsTreeSelect
      v-model="value"
      :data="treeData"
      clearable
      value-display="path"
      placeholder="Pick knowledge area"
      aria-label="Pick knowledge area"
      :default-expanded-keys="[1]"
    />

    <DsBadge>
      Current value: {{ value ?? 'nothing selected' }}
    </DsBadge>
  </div>
</template>