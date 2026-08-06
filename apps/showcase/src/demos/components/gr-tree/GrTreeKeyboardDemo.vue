<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrSwitch, GrTree } from '@feugene/granularity'

type Node = {
  id: string
  label: string
  children?: Node[]
}

const data: Node[] = [
  {
    id: 'billing',
    label: 'Billing',
    children: [
      { id: 'invoices', label: 'Invoices' },
      { id: 'payouts', label: 'Payouts' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    children: [
      { id: 'categories', label: 'Categories' },
      { id: 'currencies', label: 'Currencies' },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    children: [
      { id: 'couriers', label: 'Couriers' },
      { id: 'warehouses', label: 'Warehouses' },
    ],
  },
]

const accordion = ref(true)
const expandOnClickNode = ref(true)
const lastSelected = ref('—')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
    <div class="grid gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
          <GrSwitch v-model="accordion" size="sm" />
          accordion
        </label>
        <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
          <GrSwitch v-model="expandOnClickNode" size="sm" />
          expandOnClickNode
        </label>
      </div>

      <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-3">
        <GrTree
          :data="data"
          node-key="id"
          :accordion="accordion"
          :expand-on-click-node="expandOnClickNode"
          default-expand-all
          @node-click="(item: Node) => (lastSelected = item.label)"
        />
      </div>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      <div>
        Выбрано:
        <GrBadge class="ml-1">
          {{ lastSelected }}
        </GrBadge>
      </div>

      <ul class="mt-3 grid gap-1">
        <li>Наберите «cur» — фокус уедет на Currencies.</li>
        <li>Повторное нажатие одной буквы идёт по кругу.</li>
        <li><code>*</code> раскрывает все узлы уровня разом.</li>
      </ul>
    </div>
  </div>
</template>
