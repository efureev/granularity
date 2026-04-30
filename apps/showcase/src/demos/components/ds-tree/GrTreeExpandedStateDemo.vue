<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrTree } from '@feugene/granularity'

type TreeItem = {
  id: number
  label: string
  children?: TreeItem[]
}

const treeData: TreeItem[] = [
  {
    id: 1,
    label: 'Operations',
    children: [
      { id: 11, label: 'Escalations' },
      { id: 12, label: 'Runbooks' },
    ],
  },
  {
    id: 2,
    label: 'Billing',
    children: [
      { id: 21, label: 'Invoices' },
      { id: 22, label: 'Disputes' },
    ],
  },
  {
    id: 3,
    label: 'Support',
    children: [
      { id: 31, label: 'Priority queue' },
      { id: 32, label: 'Knowledge base' },
    ],
  },
]

const expandedKeys = ref<Array<number | string>>([1, 2])
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" variant="outline" @click="expandedKeys = [1, 2, 3]">
        Expand all groups
      </GrButton>
      <GrButton size="sm" variant="ghost" @click="expandedKeys = [2]">
        Focus billing
      </GrButton>
    </div>

    <GrTree :data="treeData" :default-expanded-keys="expandedKeys" branch-line />

    <div class="flex flex-wrap gap-2">
      <GrBadge v-for="key in expandedKeys" :key="key">
        Expanded: {{ key }}
      </GrBadge>
    </div>
  </div>
</template>