<script setup lang="ts">
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
          <GrButton size="sm" square variant="outline" tone="danger" @click="lastAction = 'Escalated ' + row.service">
            <IconTrash />
          </GrButton>
        </div>
      </template>
    </GrDataTable>

    <div class="text-sm text-[var(--muted-fg)]">
      {{ lastAction }}
    </div>
  </div>
</template>