import type { ShowcaseComponentExampleDoc } from '../types'

export const dsDataTableExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'data-table-sortable-columns',
    title: 'Sortable rows with initial state',
    description: 'Базовый сценарий для `DsDataTable`: передаём `rows`, `columns`, стартовую сортировку и сразу проверяем built-in sorting.',
    status: 'ready',
    previewKey: 'ds-data-table-sortable-columns',
    code: `<script setup lang="ts">
import { DsDataTable } from '@feugene/granularity'

const rows = [
  { id: 1, name: 'Alpha', incidents: 2, owner: 'Platform' },
  { id: 2, name: 'Beta', incidents: 0, owner: 'Billing' },
  { id: 3, name: 'Gamma', incidents: 7, owner: 'Support' },
]

const columns = [
  { key: 'name', label: 'Workspace', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'incidents', label: 'Incidents', sortable: true, align: 'right' },
]
</script>

<template>
  <DsDataTable
    :rows="rows"
    :columns="columns"
    row-key="id"
    initial-sort-key="name"
  />
</template>`,
  },
  {
    id: 'data-table-custom-cells',
    title: 'Custom status and actions cells',
    description: 'Ключевой composition-scenario: стандартный data pipeline остаётся у `DsDataTable`, а конкретные ячейки переопределяются слотами.',
    status: 'ready',
    previewKey: 'ds-data-table-custom-cells',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsDataTable } from '@feugene/granularity'

const lastAction = ref('No actions yet')

const rows = [
  { id: 1, service: 'Gateway', status: 'ok', owner: 'Core' },
  { id: 2, service: 'Importer', status: 'warning', owner: 'Ops' },
  { id: 3, service: 'Notifier', status: 'danger', owner: 'Growth' },
]

const columns = [
  { key: 'service', label: 'Service', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

function actionLabel(status: string) {
  return status === 'ok' ? 'success' : status === 'warning' ? 'warning' : 'danger'
}
</script>

<template>
  <div class="grid gap-3">
    <DsDataTable :rows="rows" :columns="columns" row-key="id">
      <template #cell-status="{ row }">
        <DsBadge :tone="actionLabel(String(row.status)) as 'success' | 'warning' | 'danger'">
          {{ row.status }}
        </DsBadge>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex justify-end gap-2">
          <DsButton size="sm" variant="ghost" @click="lastAction = 'Viewed ' + row.service">View</DsButton>
          <DsButton size="sm" variant="outline" @click="lastAction = 'Escalated ' + row.service">Escalate</DsButton>
        </div>
      </template>
    </DsDataTable>

    <div class="text-sm text-[var(--muted-fg)]">
      {{ lastAction }}
    </div>
  </div>
</template>`,
    note: 'Именно slots превращают компонент из «таблицы по данным» в реальный admin/reporting building block.',
  },
  {
    id: 'data-table-filtered-view',
    title: 'Filtered datasets outside the component',
    description: 'Показываем границу ответственности: фильтрация остаётся снаружи, а `DsDataTable` честно рендерит уже подготовленный набор строк.',
    status: 'ready',
    previewKey: 'ds-data-table-filtered-view',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsButton, DsDataTable } from '@feugene/granularity'

const activeFilter = ref<'all' | 'critical'>('all')

const rows = [
  { id: 1, name: 'Checkout latency', severity: 'critical', updatedAt: '10:24' },
  { id: 2, name: 'Profile sync', severity: 'normal', updatedAt: '10:18' },
  { id: 3, name: 'Webhook retries', severity: 'critical', updatedAt: '09:57' },
]

const columns = [
  { key: 'name', label: 'Signal', sortable: true },
  { key: 'severity', label: 'Severity', sortable: true },
  { key: 'updatedAt', label: 'Updated', align: 'right', sortable: true },
]

const visibleRows = computed(() => {
  return activeFilter.value === 'critical'
    ? rows.filter(row => row.severity === 'critical')
    : rows
})
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-2">
      <DsButton size="sm" :variant="activeFilter === 'all' ? 'primary' : 'outline'" @click="activeFilter = 'all'">
        All rows
      </DsButton>
      <DsButton size="sm" :variant="activeFilter === 'critical' ? 'primary' : 'outline'" @click="activeFilter = 'critical'">
        Critical only
      </DsButton>
    </div>

    <DsDataTable
      :rows="visibleRows"
      :columns="columns"
      row-key="id"
      initial-sort-key="updatedAt"
      initial-sort-dir="desc"
    />
  </div>
</template>`,
  },
]
