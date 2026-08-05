<script setup lang="ts">
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
</template>
