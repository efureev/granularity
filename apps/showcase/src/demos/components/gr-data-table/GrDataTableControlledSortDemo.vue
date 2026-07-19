<script setup lang="ts">
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

// `external-sort`: таблица сама не сортирует — сортируем «снаружи» (как это делал бы
// сервер). Здесь имитируем это локально, но `rows` приходят уже отсортированными.
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
  lastChange.value = `${event.key} · ${event.dir}`
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2 text-sm">
      <span class="showcase-demo-text opacity-70">Controlled sort:</span>
      <GrBadge tone="primary">{{ sortKey }} · {{ sortDir }}</GrBadge>
      <span v-if="lastChange" class="showcase-demo-text opacity-70">@sort-change: {{ lastChange }}</span>
    </div>

    <GrDataTable
      v-model:sort-key="sortKey"
      v-model:sort-dir="sortDir"
      :rows="sortedRows"
      :columns="columns"
      row-key="id"
      external-sort
      @sort-change="onSortChange"
    />
  </div>
</template>
