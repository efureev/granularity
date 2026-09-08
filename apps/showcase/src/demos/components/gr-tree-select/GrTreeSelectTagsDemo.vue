<script setup lang="ts">
import { ref } from 'vue'

import { GrTreeSelect } from '@feugene/granularity'

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
      { id: 13, label: 'Billing' },
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
]

const all = ref<Array<number | string>>([11, 12, 21])
const limited = ref<Array<number | string>>([11, 12, 13, 21, 22])
</script>

<template>
  <div class="grid gap-4">
    <GrTreeSelect
      v-model="all"
      :data="treeData"
      multiple
      tags
      clearable
      :close-on-select="false"
      placeholder="Pick several areas"
      aria-label="Areas as chips"
      :default-expanded-keys="[1, 2]"
    />

    <GrTreeSelect
      v-model="limited"
      :data="treeData"
      multiple
      tags
      :max-tag-count="2"
      tag-tone="primary"
      :close-on-select="false"
      placeholder="Pick several areas"
      aria-label="Areas as chips with a limit"
      :default-expanded-keys="[1, 2]"
    />

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Крестик на чипе снимает свой узел, не открывая панель. Со вторым полем
      `max-tag-count` держит ряд в одну строку: остаток сворачивается в «+N».
    </div>
  </div>
</template>
