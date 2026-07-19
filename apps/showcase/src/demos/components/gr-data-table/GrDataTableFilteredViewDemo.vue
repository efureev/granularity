<script setup lang="ts">
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
</template>