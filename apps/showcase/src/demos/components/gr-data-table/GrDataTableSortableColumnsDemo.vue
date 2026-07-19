<script setup lang="ts">
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
</template>