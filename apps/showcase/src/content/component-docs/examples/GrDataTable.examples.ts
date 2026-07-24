import type { ShowcaseComponentExampleDoc } from '../types'

export const grDataTableExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'data-table-controlled-sort',
    title: 'Controlled / external sort',
    description: 'Управляемая сортировка через `v-model:sortKey` / `v-model:sortDir` + событие `@sort-change`. С `external-sort` таблица не сортирует `rows` сама — данные приходят уже отсортированными (серверная сортировка, синхронизация с URL).',
    status: 'ready',
    previewKey: 'gr-data-table-controlled-sort',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'
import { GrDataTable } from '@feugene/granularity'
import type { GrDataColumn } from '@feugene/granularity'

const rows = [
  { id: 1, service: 'Auth', incidents: 2 },
  { id: 2, service: 'Billing', incidents: 0 },
  { id: 3, service: 'Search', incidents: 7 },
]
const columns: GrDataColumn[] = [
  { key: 'service', label: 'Service', sortable: true },
  { key: 'incidents', label: 'Incidents', sortable: true, align: 'right' },
]

const sortKey = ref('incidents')
const sortDir = ref<'asc' | 'desc'>('desc')

// external-sort: сортируем «снаружи» (например на сервере).
const sortedRows = computed(() => {
  const key = sortKey.value
  const dir = sortDir.value
  return [...rows].sort((a, b) => {
    const res = Number(a[key as 'incidents']) - Number(b[key as 'incidents'])
    return dir === 'asc' ? res : -res
  })
})
</script>

<template>
  <GrDataTable
    v-model:sort-key="sortKey"
    v-model:sort-dir="sortDir"
    :rows="sortedRows"
    :columns="columns"
    row-key="id"
    external-sort
    @sort-change="(e) => console.log(e.key, e.dir)"
  />
</template>`,
    note: 'Контролируемый режим нужен для серверной сортировки и синхронизации состояния с URL; без пропов `sortKey`/`sortDir` таблица работает в uncontrolled-режиме как прежде.',
  },
  {
    id: 'data-table-sortable-columns',
    title: 'Sortable rows with initial state',
    description: 'Базовый сценарий для `GrDataTable`: передаём `rows`, `columns`, стартовую сортировку и сразу проверяем built-in sorting.',
    status: 'ready',
    previewKey: 'gr-data-table-sortable-columns',
    code: `<script setup lang="ts">
import { GrDataTable } from '@feugene/granularity'

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
  <GrDataTable
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
    description: 'Ключевой composition-scenario: стандартный data pipeline остаётся у `GrDataTable`, а конкретные ячейки переопределяются слотами.',
    status: 'ready',
    previewKey: 'gr-data-table-custom-cells',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDataTable } from '@feugene/granularity'

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
    <GrDataTable :rows="rows" :columns="columns" row-key="id">
      <template #cell-status="{ row }">
        <GrBadge :tone="actionLabel(String(row.status)) as 'success' | 'warning' | 'danger'">
          {{ row.status }}
        </GrBadge>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex justify-end gap-2">
          <GrButton size="sm" variant="ghost" @click="lastAction = 'Viewed ' + row.service">View</GrButton>
          <GrButton size="sm" variant="outline" @click="lastAction = 'Escalated ' + row.service">Escalate</GrButton>
        </div>
      </template>
    </GrDataTable>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      {{ lastAction }}
    </div>
  </div>
</template>`,
    note: 'Именно slots превращают компонент из «таблицы по данным» в реальный admin/reporting building block.',
  },
  {
    id: 'data-table-filtered-view',
    title: 'Filtered datasets outside the component',
    description: 'Показываем границу ответственности: фильтрация остаётся снаружи, а `GrDataTable` честно рендерит уже подготовленный набор строк.',
    status: 'ready',
    previewKey: 'gr-data-table-filtered-view',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrDataTable } from '@feugene/granularity'

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
      <GrButton size="sm" :variant="activeFilter === 'all' ? 'primary' : 'outline'" @click="activeFilter = 'all'">
        All rows
      </GrButton>
      <GrButton size="sm" :variant="activeFilter === 'critical' ? 'primary' : 'outline'" @click="activeFilter = 'critical'">
        Critical only
      </GrButton>
    </div>

    <GrDataTable
      :rows="visibleRows"
      :columns="columns"
      row-key="id"
      initial-sort-key="updatedAt"
      initial-sort-dir="desc"
    />
  </div>
</template>`,
  },
  {
    id: 'data-table-selection-sticky',
    title: 'Row selection, sticky header and loading',
    description: '`selectable` добавляет ведущую колонку с чекбоксами и «выбрать все» в шапке (модель — `v-model:selected` по ключам строк). `sticky-header` + `max-height` держат заголовок видимым при вертикальном скролле. `loading` заменяет тело строкой-индикатором.',
    status: 'ready',
    previewKey: 'gr-data-table-selection-sticky',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import type { GrDataColumn } from '@feugene/granularity'
import { GrBadge, GrButton, GrDataTable } from '@feugene/granularity'

const columns: GrDataColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'city', label: 'City' },
]

const rows = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: 'Person ' + (i + 1),
  role: ['Engineer', 'Designer', 'PM'][i % 3],
  city: ['Berlin', 'Lisbon', 'Warsaw'][i % 3],
}))

const selected = ref<Array<string | number>>([2, 5])
const loading = ref(false)

function simulateReload() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1400)
}
</script>

<template>
  <GrButton size="sm" variant="outline" @click="simulateReload">Simulate reload</GrButton>
  <GrBadge>{{ selected.length }} selected</GrBadge>

  <GrDataTable
    v-model:selected="selected"
    :rows="rows"
    :columns="columns"
    row-key="id"
    selectable
    sticky-header
    :max-height="280"
    :loading="loading"
  />
</template>`,
    note: '«Выбрать все» оперирует только видимыми строками и сохраняет внешние ключи; при клиентской сортировке выбор остаётся по ключам, а не по позициям.',
  },
]
