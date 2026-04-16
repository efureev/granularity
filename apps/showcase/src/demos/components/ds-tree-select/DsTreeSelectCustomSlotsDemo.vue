<script setup lang="ts">
import { ref } from 'vue'

import { DsTreeSelect } from '@feugene/granularity'

type TreeSelectItem = {
  id: number
  label: string
  owner: string
  children?: TreeSelectItem[]
}

const treeData: TreeSelectItem[] = [
  {
    id: 1,
    label: 'Revenue platform',
    owner: 'Billing',
    children: [
      { id: 11, label: 'Invoice automation', owner: 'Billing' },
      { id: 12, label: 'Risk rules', owner: 'Fraud' },
    ],
  },
  {
    id: 2,
    label: 'Support tools',
    owner: 'Support',
    children: [
      { id: 21, label: 'Macros', owner: 'Support' },
      { id: 22, label: 'Routing', owner: 'Operations' },
    ],
  },
]

const value = ref<number | null>(11)
</script>

<template>
  <div class="grid gap-4">
    <DsTreeSelect
      v-model="value"
      :data="treeData"
      placeholder="Pick workflow"
      aria-label="Pick workflow"
      :default-expanded-keys="[1, 2]"
    >
      <template #value="{ displayValue, labels }">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="font-600">{{ displayValue || 'Nothing selected' }}</span>
          <span v-if="labels.length" class="rounded-full bg-[var(--accent)] px-2 py-1 text-xs text-[var(--accent-fg)]">
            {{ labels.length }} label(s)
          </span>
        </div>
      </template>

      <template #node="{ data, selected }">
        <div class="flex w-full items-center justify-between gap-3">
          <span>{{ data.label }}</span>
          <span class="text-xs text-[var(--muted-fg)]">
            {{ selected ? 'Selected' : data.owner }}
          </span>
        </div>
      </template>
    </DsTreeSelect>
  </div>
</template>