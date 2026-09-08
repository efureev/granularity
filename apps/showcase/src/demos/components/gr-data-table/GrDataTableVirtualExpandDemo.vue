<script setup lang="ts">
import { GrDataTable, type GrDataColumn } from '@feugene/granularity'

type Order = { id: number, customer: string, total: string, status: string }

const columns: GrDataColumn<Order>[] = [
  { key: 'id', label: '#', width: 80, sortable: true },
  { key: 'customer', label: 'Customer', width: '35%', sortable: true },
  { key: 'total', label: 'Total', width: 120 },
  { key: 'status', label: 'Status', width: 140 },
]

const statuses = ['Paid', 'Shipped', 'Refunded', 'Pending']

const rows: Order[] = Array.from({ length: 5000 }, (_, index) => ({
  id: index + 1,
  customer: `Customer ${index + 1}`,
  total: `$${((index % 40) + 1) * 25}.00`,
  status: statuses[index % statuses.length]!,
}))
</script>

<template>
  <GrDataTable
    :rows="rows"
    :columns="columns"
    virtual
    expandable
    sticky-header
    :max-height="420"
    aria-label="Orders"
  >
    <template #detail="{ row }">
      <div class="grid gap-2 sm:grid-cols-3">
        <div class="grid gap-1">
          <span class="text-xs text-[var(--gr-muted-fg)]">Shipping</span>
          <span>{{ row.customer }}, warehouse {{ (row.id % 7) + 1 }}</span>
        </div>
        <div class="grid gap-1">
          <span class="text-xs text-[var(--gr-muted-fg)]">Items</span>
          <span>{{ (row.id % 5) + 1 }} positions, {{ row.total }}</span>
        </div>
        <div class="grid gap-1">
          <span class="text-xs text-[var(--gr-muted-fg)]">Status</span>
          <span>{{ row.status }} since day {{ (row.id % 28) + 1 }}</span>
        </div>
      </div>
    </template>
  </GrDataTable>
</template>
