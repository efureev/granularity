<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTree } from '@feugene/granularity'

type Permission = { id: string, label: string, children?: Permission[] }

// Типовой сценарий чекбоксов в дереве — выдача прав по разделам.
const permissions: Permission[] = [
  {
    id: 'billing',
    label: 'Billing',
    children: [
      { id: 'billing.read', label: 'View invoices' },
      { id: 'billing.write', label: 'Issue invoices' },
      { id: 'billing.refund', label: 'Refund payments' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    children: [
      { id: 'team.read', label: 'View members' },
      { id: 'team.invite', label: 'Invite members' },
    ],
  },
]

const checkedKeys = ref<(string | number)[]>(['billing.read'])
</script>

<template>
  <div class="grid gap-3">
    <GrTree
      v-model:checked-keys="checkedKeys"
      :data="permissions"
      node-key="id"
      show-checkbox
      :default-expanded-keys="['billing', 'team']"
    />

    <div class="flex flex-wrap items-center gap-2">
      <GrBadge tone="neutral">
        Отмечено: {{ checkedKeys.length }}
      </GrBadge>
      <GrBadge v-for="key in checkedKeys" :key="key" tone="info">
        {{ key }}
      </GrBadge>
    </div>
  </div>
</template>
