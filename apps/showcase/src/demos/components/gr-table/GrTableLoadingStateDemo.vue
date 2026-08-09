<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrTable } from '@feugene/granularity'

const loading = ref(true)

const rows = [
  { title: 'Ledger export', state: 'Completed', updated: '2 min ago' },
  { title: 'Reconciliation', state: 'Processing', updated: '5 min ago' },
  { title: 'Fraud review', state: 'Queued', updated: '12 min ago' },
]
</script>

<template>
  <div class="grid gap-3">
    <div>
      <GrButton size="sm" variant="outline" @click="loading = !loading">
        {{ loading ? 'Show resolved rows' : 'Show loading state' }}
      </GrButton>
    </div>

    <!-- Скелетоны рисует сама таблица, контейнер при этом помечен `aria-busy`. -->
    <GrTable :loading="loading" :loading-rows="3" :column-count="3">
      <template #head>
        <tr>
          <th class="px-4 py-3 text-left font-600">Task</th>
          <th class="px-4 py-3 text-left font-600">State</th>
          <th class="px-4 py-3 text-left font-600">Updated</th>
        </tr>
      </template>

      <tr v-for="row in rows" :key="row.title" class="border-t border-[var(--gr-brd)]">
        <td class="px-4 py-3">{{ row.title }}</td>
        <td class="px-4 py-3">{{ row.state }}</td>
        <td class="px-4 py-3 text-[var(--gr-muted-fg)]">{{ row.updated }}</td>
      </tr>
    </GrTable>
  </div>
</template>
