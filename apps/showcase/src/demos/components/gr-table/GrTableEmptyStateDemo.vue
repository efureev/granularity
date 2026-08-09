<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrTable } from '@feugene/granularity'

const empty = ref(true)

const rows = [
  { name: 'Risk alerts', owner: 'Ops team', value: 'Enabled' },
  { name: 'Approval SLA', owner: 'Finance', value: '24 hours' },
]
</script>

<template>
  <div class="grid gap-3">
    <div>
      <GrButton size="sm" variant="outline" @click="empty = !empty">
        {{ empty ? 'Show table rows' : 'Show empty state' }}
      </GrButton>
    </div>

    <!-- Ни `v-if` вокруг строк, ни ручного `colspan`: пустоту таблица видит по слоту сама. -->
    <GrTable :column-count="3" striped hoverable>
      <template #head>
        <tr>
          <th class="px-4 py-3 text-left font-600">Preset</th>
          <th class="px-4 py-3 text-left font-600">Owner</th>
          <th class="px-4 py-3 text-left font-600">Value</th>
        </tr>
      </template>

      <tr v-for="row in (empty ? [] : rows)" :key="row.name" class="border-t border-[var(--gr-brd)]">
        <td class="px-4 py-3">{{ row.name }}</td>
        <td class="px-4 py-3 text-[var(--gr-muted-fg)]">{{ row.owner }}</td>
        <td class="px-4 py-3">{{ row.value }}</td>
      </tr>

      <template #empty>
        <div class="grid justify-items-center gap-2">
          <span>No preset rows</span>
          <GrButton size="sm" @click="empty = false">
            Load sample data
          </GrButton>
        </div>
      </template>
    </GrTable>
  </div>
</template>
