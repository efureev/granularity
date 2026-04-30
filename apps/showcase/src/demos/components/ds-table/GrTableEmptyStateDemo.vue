<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrEmptyState, GrTable } from '@feugene/granularity'

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

    <GrTable>
      <template #head>
        <tr>
          <th class="px-4 py-3 text-left font-600">Preset</th>
          <th class="px-4 py-3 text-left font-600">Owner</th>
          <th class="px-4 py-3 text-left font-600">Value</th>
        </tr>
      </template>

      <tr v-if="empty" class="border-t border-[var(--brd)]">
        <td colspan="3" class="px-4 py-6">
          <GrEmptyState
            title="No preset rows"
            description="Для data-display сценариев `GrTable` может хостить empty state прямо внутри tbody без дополнительного shell-компонента."
          >
            <GrButton size="sm" @click="empty = false">
              Load sample data
            </GrButton>
          </GrEmptyState>
        </td>
      </tr>

      <template v-else>
        <tr
          v-for="row in rows"
          :key="row.name"
          class="border-t border-[var(--brd)]"
        >
          <td class="px-4 py-3">{{ row.name }}</td>
          <td class="px-4 py-3 text-[var(--muted-fg)]">{{ row.owner }}</td>
          <td class="px-4 py-3">{{ row.value }}</td>
        </tr>
      </template>
    </GrTable>
  </div>
</template>