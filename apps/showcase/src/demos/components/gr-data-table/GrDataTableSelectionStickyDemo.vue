<script setup lang="ts">
import { ref } from 'vue'

import type { GrDataColumn } from '@feugene/granularity'
import { GrBadge, GrButton, GrDataTable } from '@feugene/granularity'

const columns: GrDataColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'city', label: 'City' },
]

const roles = ['Engineer', 'Designer', 'PM', 'Analyst', 'Support']
const cities = ['Berlin', 'Lisbon', 'Warsaw', 'Madrid', 'Milan', 'Amsterdam']

const rows = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: roles[i % roles.length],
  city: cities[i % cities.length],
}))

// Row selection via v-model:selected
const selected = ref<Array<string | number>>([2, 5])

// Loading toggle
const loading = ref(false)
function simulateReload() {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 1400)
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <GrButton size="sm" variant="outline" @click="simulateReload">
        Simulate reload (loading)
      </GrButton>
      <GrButton size="sm" variant="ghost" @click="selected = []">
        Clear selection
      </GrButton>
      <GrBadge>{{ selected.length }} selected</GrBadge>
    </div>

    <GrDataTable
      v-model:selected="selected"
      :rows="rows"
      :columns="columns"
      row-key="id"
      selectable
      sticky-header
      :max-height="280"
      :loading="loading"
    >
      <template #cell-role="{ row }">
        <GrBadge tone="slate">
          {{ row.role }}
        </GrBadge>
      </template>
    </GrDataTable>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Selected ids: {{ selected.length ? selected.join(', ') : 'none' }}
    </div>
  </div>
</template>
