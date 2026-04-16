<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { DsBadge, DsInput, DsTree } from '@feugene/granularity'

type TreeItem = {
  id: number
  label: string
  team: string
  children?: TreeItem[]
}

const treeData: TreeItem[] = [
  {
    id: 1,
    label: 'Incident management',
    team: 'Operations',
    children: [
      { id: 11, label: 'Pager duty', team: 'Operations' },
      { id: 12, label: 'Postmortems', team: 'Operations' },
    ],
  },
  {
    id: 2,
    label: 'Revenue ops',
    team: 'Billing',
    children: [
      { id: 21, label: 'Chargebacks', team: 'Billing' },
      { id: 22, label: 'Usage reports', team: 'Billing' },
    ],
  },
  {
    id: 3,
    label: 'Customer support',
    team: 'Support',
    children: [
      { id: 31, label: 'Macros', team: 'Support' },
      { id: 32, label: 'SLA queues', team: 'Support' },
    ],
  },
]

const query = ref('')
const treeRef = ref<{
  filter: (value: string) => void
} | null>(null)

const matchedCount = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  if (!normalizedQuery)
    return treeData.length

  const walk = (items: TreeItem[]): number => {
    return items.reduce((total, item) => {
      const selfMatched = `${item.label} ${item.team}`.toLowerCase().includes(normalizedQuery)
      const childMatches = item.children ? walk(item.children) : 0
      return total + (selfMatched ? 1 : 0) + childMatches
    }, 0)
  }

  return walk(treeData)
})

watch(
  query,
  (value) => {
    treeRef.value?.filter(value)
  },
  { immediate: true },
)
</script>

<template>
  <div class="grid gap-4">
    <DsInput v-model="query" placeholder="Filter tree nodes by label or team" aria-label="Filter tree nodes" />

    <DsTree
      ref="treeRef"
      :data="treeData"
      :filter-node-method="(value, data) => `${data.label} ${data.team}`.toLowerCase().includes(String(value).toLowerCase())"
      branch-line
    />

    <DsBadge>
      Matches: {{ matchedCount }}
    </DsBadge>
  </div>
</template>