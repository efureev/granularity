<script setup lang="ts">
import { computed, ref } from 'vue'

import type { DsDataColumn } from '@feugene/granularity'
import { DsButton, DsDataTable } from '@feugene/granularity'

const activeFilter = ref<'all' | 'critical'>('all')

const rows = [
  { id: 1, name: 'Checkout latency', severity: 'critical', updatedAt: '10:24' },
  { id: 2, name: 'Profile sync', severity: 'normal', updatedAt: '10:18' },
  { id: 3, name: 'Webhook retries', severity: 'critical', updatedAt: '09:57' },
]

const columns: DsDataColumn[] = [
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
</template>