<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  GrBadge,
  GrButton,
  GrDataTable,
  GrPagination,
} from '@feugene/granularity'

const page = ref(1)
const pageSize = ref(5)
const pageSizes = [5, 10, 20]
const lastAction = ref('No row action yet')

const rows = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  customer: `Customer ${index + 1}`,
  plan: index % 2 === 0 ? 'Scale' : 'Starter',
  status: index % 3 === 0 ? 'attention' : 'healthy',
}))

const columns = [
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right' as const },
]

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return rows.slice(start, start + pageSize.value)
})

const pageCount = computed(() => Math.max(1, Math.ceil(rows.length / pageSize.value)))

function clampPage() {
  page.value = Math.min(page.value, pageCount.value)
}
</script>

<template>
  <div class="grid gap-4">
    <GrDataTable :rows="pagedRows" :columns="columns" row-key="id">
      <template #cell-status="{ row }">
        <GrBadge :tone="row.status === 'healthy' ? 'success' : 'warning'">
          {{ row.status }}
        </GrBadge>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex justify-end">
          <GrButton size="sm" variant="ghost" @click="lastAction = `Opened ${row.customer}`">
            Open
          </GrButton>
        </div>
      </template>
    </GrDataTable>

    <GrPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="rows.length"
      @update:page-size="clampPage"
    />

    <GrBadge>
      {{ lastAction }}
    </GrBadge>
  </div>
</template>