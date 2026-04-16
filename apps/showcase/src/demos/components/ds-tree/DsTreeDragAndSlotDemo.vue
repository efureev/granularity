<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsTree } from '@feugene/granularity'

type TreeItem = {
  id: number
  label: string
  status: 'healthy' | 'warning' | 'critical'
  children?: TreeItem[]
}

const treeData = ref<TreeItem[]>([
  {
    id: 1,
    label: 'Payments',
    status: 'critical',
    children: [
      { id: 11, label: 'Retries', status: 'warning' },
      { id: 12, label: 'Settlement', status: 'healthy' },
    ],
  },
  {
    id: 2,
    label: 'Identity',
    status: 'warning',
    children: [
      { id: 21, label: 'Sessions', status: 'healthy' },
      { id: 22, label: 'Recovery', status: 'warning' },
    ],
  },
])

const lastDrop = ref('Drag a row handle to reorder or nest nodes')

function resolveTone(status: TreeItem['status']) {
  if (status === 'critical')
    return 'bg-[color-mix(in_srgb,var(--destructive)_14%,transparent)] text-[var(--destructive)]'

  if (status === 'warning')
    return 'bg-[var(--ds-warning-light)] text-[var(--ds-warning)]'

  return 'bg-[var(--ds-success-light)] text-[var(--ds-success)]'
}
</script>

<template>
  <div class="grid gap-4">
    <DsTree
      :data="treeData"
      :default-expanded-keys="[1, 2]"
      draggable
      branch-line
      @node-drop="(draggingNode, dropNode, dropType) => lastDrop = `${draggingNode.label} → ${dropNode.label} (${dropType})`"
    >
      <template #default="{ data }">
        <div class="flex flex-wrap items-center gap-2">
          <span>{{ data.label }}</span>
          <span class="rounded-full px-2 py-1 text-xs font-600" :class="resolveTone(data.status)">
            {{ data.status }}
          </span>
        </div>
      </template>
    </DsTree>

    <DsBadge>
      {{ lastDrop }}
    </DsBadge>
  </div>
</template>