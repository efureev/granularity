<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrEmptyState, GrInput, GrTree } from '@feugene/granularity'

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

/**
 * Результат фильтрации приходит от дерева, а не считается вторым проходом по
 * данным. Разница видна в пустом экране: «ничего не нашлось» и «данных нет» —
 * разные сообщения, и первое пользователь может исправить сам.
 */
const matched = ref(treeData.length)
const visible = ref(treeData.length)
</script>

<template>
  <div class="grid gap-4">
    <GrInput v-model="query" placeholder="Filter tree nodes by label or team" aria-label="Filter tree nodes" />

    <GrTree
      :data="treeData"
      :filter-value="query"
      :filter-node-method="(value, data) => `${data.label} ${data.team}`.toLowerCase().includes(String(value).toLowerCase())"
      branch-line
      @filter="({ matchedCount, visibleCount }) => { matched = matchedCount; visible = visibleCount }"
    />

    <GrEmptyState
      v-if="visible === 0"
      title="Nothing matches the query"
      description="Try a shorter word — the filter looks at both the label and the team."
    />

    <GrBadge>
      Matches: {{ matched }}
    </GrBadge>
  </div>
</template>
