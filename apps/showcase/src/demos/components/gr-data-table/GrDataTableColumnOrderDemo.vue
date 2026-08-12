<script setup lang="ts">
import { ref } from 'vue'

import { GrDataTable } from '@feugene/granularity'

type Deal = { id: number, client: string, stage: string, owner: string, amount: number }

const columns = [
  { key: 'client', label: 'Клиент', sortable: true },
  { key: 'stage', label: 'Этап' },
  { key: 'owner', label: 'Ответственный' },
  { key: 'amount', label: 'Сумма', sortable: true, align: 'right' as const },
]

const rows: Deal[] = [
  { id: 1, client: 'Северный мост', stage: 'Переговоры', owner: 'Иванова', amount: 1_240_000 },
  { id: 2, client: 'Гидропроект', stage: 'Счёт выставлен', owner: 'Петров', amount: 860_000 },
  { id: 3, client: 'Литейный двор', stage: 'Подписание', owner: 'Соколова', amount: 2_105_000 },
]

const order = ref(columns.map(column => column.key))
</script>

<template>
  <div class="grid gap-4">
    <GrDataTable
      v-model:column-order="order"
      reorderable-columns
      :columns="columns"
      :rows="rows"
      row-key="id"
      aria-label="Сделки"
    >
      <template #cell-amount="{ row }">
        {{ row.amount.toLocaleString('ru-RU') }} ₽
      </template>
    </GrDataTable>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Порядок: <code>{{ order.join(', ') }}</code>. Наведите курсор на заголовок и тяните за ручку —
      или дойдите до неё клавишей Tab и нажмите Shift со стрелкой. Клик по заголовку остаётся
      сортировкой.
    </p>
  </div>
</template>
