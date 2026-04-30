<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrSkeleton, GrTable } from '@feugene/granularity'

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

    <GrTable>
      <template #head>
        <tr>
          <th class="px-4 py-3 text-left font-600">Task</th>
          <th class="px-4 py-3 text-left font-600">State</th>
          <th class="px-4 py-3 text-left font-600">Updated</th>
        </tr>
      </template>

      <template v-if="loading">
        <tr
          v-for="row in 3"
          :key="row"
          class="border-t border-[var(--brd)]"
        >
          <td class="px-4 py-3"><GrSkeleton class="h-4 w-32" /></td>
          <td class="px-4 py-3"><GrSkeleton class="h-4 w-24" /></td>
          <td class="px-4 py-3"><GrSkeleton class="h-4 w-20" /></td>
        </tr>
      </template>

      <template v-else>
        <tr
          v-for="row in rows"
          :key="row.title"
          class="border-t border-[var(--brd)]"
        >
          <td class="px-4 py-3">{{ row.title }}</td>
          <td class="px-4 py-3">{{ row.state }}</td>
          <td class="px-4 py-3 text-[var(--muted-fg)]">{{ row.updated }}</td>
        </tr>
      </template>
    </GrTable>
  </div>
</template>