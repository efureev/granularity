<script setup lang="ts">
import { GrJsonViewer } from '@feugene/granularity'

// Ровно та форма, в которой ответ приходит из БД: `unknown` со всеми типами
// JSON, включая `null` и вложенный массив.
const response = {
  id: 'run_01HXQZ8K3M7N2P4R6T8V0W1Y3Z',
  model: 'gpt-4o-mini',
  cached: false,
  finished_at: null,
  usage: { prompt_tokens: 1284, completion_tokens: 96, total_tokens: 1380 },
  store: { name: 'Пятёрочка', inn: '7728029110', address: 'Москва, Ленинский проспект, 12' },
  items: [
    { name: 'Молоко 3.2%', qty: 2, price: 89.9, sum: 179.8 },
    { name: 'Хлеб бородинский', qty: 1, price: 54.5, sum: 54.5 },
    { name: 'Кофе зерновой 1 кг', qty: 1, price: 1249, sum: 1249 },
  ],
  totals: { subtotal: 1483.3, discount: 74.15, total: 1409.15 },
}
</script>

<template>
  <GrJsonViewer :value="response" max-height="22rem" aria-label="Ответ модели" />
</template>
