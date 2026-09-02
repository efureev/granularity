<script setup lang="ts">
import { ref } from 'vue'

import { GrTransfer } from '@feugene/granularity'

const columns = ref<string[]>(['date', 'amount', 'status'])

const available = [
  { id: 'date', label: 'Дата' },
  { id: 'number', label: 'Номер' },
  { id: 'counterparty', label: 'Контрагент' },
  { id: 'amount', label: 'Сумма' },
  { id: 'status', label: 'Статус' },
  { id: 'manager', label: 'Менеджер' },
]
</script>

<template>
  <div class="w-full">
    <GrTransfer
      v-model="columns"
      :items="available"
      source-title="Доступные поля"
      target-title="Колонки отчёта"
      aria-label="Колонки отчёта"
    />

    <p class="mt-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      Значение — <code>{{ JSON.stringify(columns) }}</code>. Порядок правой панели и есть порядок
      колонок: отметьте строку и двигайте её кнопками в шапке панели, перетаскиванием
      или <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd>.
    </p>
  </div>
</template>
