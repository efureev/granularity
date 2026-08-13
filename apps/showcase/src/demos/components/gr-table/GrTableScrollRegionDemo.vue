<script setup lang="ts">
import { GrTable } from '@feugene/granularity'

interface LedgerRow {
  date: string
  document: string
  counterparty: string
  account: string
  debit: string
  credit: string
  balance: string
}

const rows: LedgerRow[] = Array.from({ length: 14 }, (_, index) => ({
  date: `0${(index % 9) + 1}.03.2026`,
  document: `INV-2026-${String(index + 1).padStart(4, '0')}`,
  counterparty: ['Northwind', 'Contoso', 'Fabrikam', 'Tailspin'][index % 4],
  account: `62.0${(index % 3) + 1}`,
  debit: index % 2 === 0 ? `${(index + 1) * 1200} ₽` : '—',
  credit: index % 2 === 0 ? '—' : `${(index + 1) * 900} ₽`,
  balance: `${(index + 1) * 300} ₽`,
}))
</script>

<template>
  <GrTable
    region-label="Оборотная ведомость за март"
    max-height="260px"
    sticky-header
  >
    <template #header>
      <tr>
        <th class="px-4 py-3 text-left font-600">Дата</th>
        <th class="px-4 py-3 text-left font-600">Документ</th>
        <th class="px-4 py-3 text-left font-600">Контрагент</th>
        <th class="px-4 py-3 text-left font-600">Счёт</th>
        <th class="px-4 py-3 text-right font-600">Дебет</th>
        <th class="px-4 py-3 text-right font-600">Кредит</th>
        <th class="px-4 py-3 text-right font-600">Сальдо</th>
      </tr>
    </template>

    <tr
      v-for="row in rows"
      :key="row.document"
      class="border-t border-[var(--gr-brd)]"
    >
      <td class="px-4 py-3 whitespace-nowrap">{{ row.date }}</td>
      <td class="px-4 py-3 whitespace-nowrap">{{ row.document }}</td>
      <td class="px-4 py-3 whitespace-nowrap text-[var(--gr-muted-fg)]">{{ row.counterparty }}</td>
      <td class="px-4 py-3 whitespace-nowrap">{{ row.account }}</td>
      <td class="px-4 py-3 text-right whitespace-nowrap">{{ row.debit }}</td>
      <td class="px-4 py-3 text-right whitespace-nowrap">{{ row.credit }}</td>
      <td class="px-4 py-3 text-right font-600 whitespace-nowrap">{{ row.balance }}</td>
    </tr>
  </GrTable>
</template>
