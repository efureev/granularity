<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrDataColumn, GrDataTableSize } from '@feugene/granularity'
import { GrDataTable, GrSegmented } from '@feugene/granularity'

const rows = [
  { id: 1, channel: 'Direct', gross: 12400, refunds: 320 },
  { id: 2, channel: 'Partners', gross: 8600, refunds: 145 },
  { id: 3, channel: 'Marketplace', gross: 5100, refunds: 890 },
]

const columns: GrDataColumn[] = [
  { key: 'channel', label: 'Channel' },
  { key: 'gross', label: 'Gross', align: 'right' },
  { key: 'refunds', label: 'Refunds', align: 'right' },
]

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

// Считает приложение: что именно итожить — страницу, фильтр или весь журнал —
// таблица знать не может.
const summaryRow = computed(() => ({
  channel: 'Total',
  gross: money.format(rows.reduce((sum, row) => sum + row.gross, 0)),
  refunds: rows.reduce((sum, row) => sum + row.refunds, 0),
}))

// Переключатель здесь не для красоты: он и есть предмет примера — паддинги
// итога едут вместе с телом, а не остаются от той ступени, на которой их
// однажды прописали руками.
const size = ref<GrDataTableSize>('md')
</script>

<template>
  <div class="grid gap-3">
    <GrSegmented
      v-model="size"
      :options="[
        { value: 'xs', label: 'xs' },
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ]"
      size="sm"
    />

    <GrDataTable :rows="rows" :columns="columns" row-key="id" :size="size" :summary-row="summaryRow">
      <template #cell-gross="{ row }">
        {{ money.format(row.gross as number) }}
      </template>

      <template #cell-refunds="{ row }">
        {{ money.format(row.refunds as number) }}
      </template>

      <!-- Тона у итога нет по умолчанию: «возвраты» и «прибыль» — разные
           сообщения, и выбрать за приложение компонент не может. -->
      <template #summary-refunds="{ value }">
        <span class="text-[var(--gr-danger-text)]">{{ money.format(value as number) }}</span>
      </template>
    </GrDataTable>
  </div>
</template>
