import type { ShowcaseComponentExampleDoc } from '../types'

export const grDataTableExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'data-table-controlled-sort',
    title: 'Controlled / external sort',
    description: 'Управляемая сортировка через `v-model:sortKey` / `v-model:sortDir` + событие `@sortChange`. С `external-sort` таблица не сортирует `rows` сама — данные приходят уже отсортированными (серверная сортировка, синхронизация с URL).',
    status: 'ready',
    previewKey: 'gr-data-table-controlled-sort',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrDataColumn } from '@feugene/granularity'
import { GrBadge, GrDataTable } from '@feugene/granularity'

const rows = [
  { id: 1, service: 'Auth', incidents: 2, updatedAt: 3 },
  { id: 2, service: 'Billing', incidents: 0, updatedAt: 1 },
  { id: 3, service: 'Search', incidents: 7, updatedAt: 2 },
]

const columns: GrDataColumn[] = [
  { key: 'service', label: 'Service', sortable: true },
  { key: 'incidents', label: 'Incidents', sortable: true, align: 'right' },
  { key: 'updatedAt', label: 'Updated', sortable: true, align: 'right' },
]

// Контролируемое состояние сортировки (v-model:sortKey / v-model:sortDir).
const sortKey = ref('incidents')
const sortDir = ref<'asc' | 'desc'>('desc')
const lastChange = ref('')

// \`external-sort\`: таблица сама не сортирует — сортируем «снаружи» (как это делал бы
// сервер). Здесь имитируем это локально, но \`rows\` приходят уже отсортированными.
const sortedRows = computed(() => {
  const key = sortKey.value
  if (!key) return rows
  const dir = sortDir.value
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key]
    const bv = (b as Record<string, unknown>)[key]
    const res = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av ?? '').localeCompare(String(bv ?? ''))
    return dir === 'asc' ? res : -res
  })
})

function onSortChange(event: { key: string, dir: 'asc' | 'desc' }) {
  lastChange.value = \`\${event.key} · \${event.dir}\`
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2 text-sm">
      <span class="showcase-demo-text opacity-70">Controlled sort:</span>
      <GrBadge tone="primary">{{ sortKey }} · {{ sortDir }}</GrBadge>
      <span v-if="lastChange" class="showcase-demo-text opacity-70">@sortChange: {{ lastChange }}</span>
    </div>

    <GrDataTable
      v-model:sort-key="sortKey"
      v-model:sort-dir="sortDir"
      :rows="sortedRows"
      :columns="columns"
      row-key="id"
      external-sort
      @sortChange="onSortChange"
    />
  </div>
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
import type { GrDataColumn } from '@feugene/granularity'
import { GrDataTable } from '@feugene/granularity'

const rows = [
  { id: 1, name: 'Alpha', incidents: 2, owner: 'Platform' },
  { id: 2, name: 'Beta', incidents: 0, owner: 'Billing' },
  { id: 3, name: 'Gamma', incidents: 7, owner: 'Support' },
]

const columns: GrDataColumn[] = [
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

import type { GrDataColumn } from '@feugene/granularity'
import { GrBadge, GrButton, GrDataTable } from '@feugene/granularity'
import IconTrash from '~icons/lucide/trash2'

const lastAction = ref('No actions yet')

const rows = [
  { id: 1, service: 'Gateway', status: 'ok', owner: 'Core' },
  { id: 2, service: 'Importer', status: 'warning', owner: 'Ops' },
  { id: 3, service: 'Notifier', status: 'danger', owner: 'Growth' },
]

const columns: GrDataColumn[] = [
  { key: 'service', label: 'Service', sortable: true },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

function statusVariant(status: unknown): 'success' | 'warning' | 'danger' {
  if (status === 'ok')
    return 'success'

  if (status === 'warning')
    return 'warning'

  return 'danger'
}
</script>

<template>
  <div class="grid gap-3">
    <GrDataTable :rows="rows" :columns="columns" row-key="id">
      <template #cell-status="{ row }">
        <GrBadge size="lg" :tone="statusVariant(row.status)">
          {{ row.status }}
        </GrBadge>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex justify-end gap-2">
          <GrButton size="sm" variant="ghost" @click="lastAction = 'Viewed ' + row.service">
            View
          </GrButton>
          <!-- Icon-only: иконка декоративна, имя кнопки задаётся явно. -->
          <GrButton
            size="sm"
            square
            variant="outline"
            tone="danger"
            :aria-label="'Escalate ' + row.service"
            @click="lastAction = 'Escalated ' + row.service"
          >
            <IconTrash />
          </GrButton>
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

import type { GrDataColumn } from '@feugene/granularity'
import { GrButton, GrDataTable } from '@feugene/granularity'

const activeFilter = ref<'all' | 'critical'>('all')

const rows = [
  { id: 1, name: 'Checkout latency', severity: 'critical', updatedAt: '10:24' },
  { id: 2, name: 'Profile sync', severity: 'normal', updatedAt: '10:18' },
  { id: 3, name: 'Webhook retries', severity: 'critical', updatedAt: '09:57' },
]

const columns: GrDataColumn[] = [
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

const roles = ['Engineer', 'Designer', 'PM', 'Analyst', 'Support']
const cities = ['Berlin', 'Lisbon', 'Warsaw', 'Madrid', 'Milan', 'Amsterdam']

const rows = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: \`Person \${i + 1}\`,
  role: roles[i % roles.length],
  city: cities[i % cities.length],
}))

// Row selection via v-model:selected
const selected = ref<Array<string | number>>([2, 5])

// Loading toggle
const loading = ref(false)
function simulateReload() {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 1400)
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <GrButton size="sm" variant="outline" @click="simulateReload">
        Simulate reload (loading)
      </GrButton>
      <GrButton size="sm" variant="ghost" @click="selected = []">
        Clear selection
      </GrButton>
      <GrBadge>{{ selected.length }} selected</GrBadge>
    </div>

    <GrDataTable
      v-model:selected="selected"
      :rows="rows"
      :columns="columns"
      row-key="id"
      selectable
      sticky-header
      :max-height="280"
      :loading="loading"
    >
      <template #cell-role="{ row }">
        <GrBadge tone="slate">
          {{ row.role }}
        </GrBadge>
      </template>
    </GrDataTable>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Selected ids: {{ selected.length ? selected.join(', ') : 'none' }}
    </div>
  </div>
</template>`,
    note: '«Выбрать все» оперирует только видимыми строками и сохраняет внешние ключи; при клиентской сортировке выбор остаётся по ключам, а не по позициям.',
  },
  {
    id: 'data-table-sizes',
    title: 'Шкала размеров',
    description: 'В отличие от `GrTable`, здесь размер ведёт ещё и паддинги ячеек, стрелки сортировки и чекбоксы — таблицу видно плотнее целиком.',
    status: 'ready',
    previewKey: 'gr-data-table-sizes',
    code: `<script setup lang="ts">
import { GrDataTable } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'seats', label: 'Seats', align: 'right' as const, sortable: true },
]

const rows = [
  { id: 1, name: 'Ada Lovelace', role: 'Owner', seats: 12 },
  { id: 2, name: 'Grace Hopper', role: 'Admin', seats: 4 },
]
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrDataTable
        :rows="rows"
        :columns="columns"
        :size="size"
        selectable
        aria-label="Members"
      />
    </div>
  </div>
</template>`,
  },
  {
    id: 'data-table-row-guards',
    title: 'Row guards, tri-state sorting and row click',
    description: 'Строка может быть невыбираемой (`selectableRow`), подсвеченной (`rowClass`) и кликабельной (`@row-click`), а третий клик по заголовку снимает сортировку — `sortCycle="asc-desc-none"`.',
    status: 'ready',
    previewKey: 'gr-data-table-row-guards',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import type { GrDataColumn } from '@feugene/granularity'
import { GrBadge, GrDataTable } from '@feugene/granularity'

type Invoice = {
  id: number
  number: string
  client: string
  total: number
  status: 'draft' | 'sent' | 'paid'
}

const columns: GrDataColumn<Invoice>[] = [
  { key: 'number', label: 'Invoice', sortable: true },
  { key: 'client', label: 'Client', sortable: true },
  { key: 'total', label: 'Total', sortable: true, align: 'right' },
  { key: 'status', label: 'Status' },
]

const rows: Invoice[] = [
  { id: 1, number: 'INV-1043', client: 'Northwind', total: 1280, status: 'sent' },
  { id: 2, number: 'INV-1044', client: 'Contoso', total: 640, status: 'paid' },
  { id: 3, number: 'INV-1045', client: 'Fabrikam', total: 2190, status: 'draft' },
  { id: 4, number: 'INV-1046', client: 'Adventure Works', total: 310, status: 'sent' },
]

const selected = ref<Array<string | number>>([])
const lastClicked = ref('—')

// Оплаченный счёт нельзя ни выбрать, ни отправить в массовое действие.
function canSelect(row: Invoice): boolean {
  return row.status !== 'paid'
}

function rowClass(row: Invoice): string | undefined {
  return row.status === 'paid' ? 'text-[var(--gr-muted-fg)]' : undefined
}
</script>

<template>
  <div class="grid gap-3">
    <GrDataTable
      v-model:selected="selected"
      :rows="rows"
      :columns="columns"
      row-key="id"
      selectable
      sort-cycle="asc-desc-none"
      :selectable-row="canSelect"
      :row-class="rowClass"
      empty-text="No invoices for this period"
      @row-click="lastClicked = $event.row.number"
    >
      <template #cell-total="{ row }">
        {{ row.total.toLocaleString('en-US', { style: 'currency', currency: 'EUR' }) }}
      </template>

      <template #cell-status="{ row }">
        <GrBadge :tone="row.status === 'paid' ? 'success' : row.status === 'draft' ? 'slate' : 'primary'" size="sm">
          {{ row.status }}
        </GrBadge>
      </template>
    </GrDataTable>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Third click on a header clears sorting · last clicked row:
      <span class="font-semibold text-[var(--gr-fg)]">{{ lastClicked }}</span> ·
      selected: <span class="font-semibold text-[var(--gr-fg)]">{{ selected.length ? selected.join(', ') : 'none' }}</span>
    </div>
  </div>
</template>`,
  },
]
