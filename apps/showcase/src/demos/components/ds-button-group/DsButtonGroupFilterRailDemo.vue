<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsButtonGroup, DsCard } from '@feugene/granularity'

const currentFilter = ref('all')

const filters = [
  { label: 'All', value: 'all', count: 24 },
  { label: 'Drafts', value: 'drafts', count: 6 },
  { label: 'Scheduled', value: 'scheduled', count: 8 },
  { label: 'Failed', value: 'failed', count: 2 },
]
</script>

<template>
  <div class="grid gap-4">
    <DsButtonGroup aria-label="Content filters">
      <DsButton
        v-for="filter in filters"
        :key="filter.value"
        size="sm"
        :variant="currentFilter === filter.value ? 'primary' : 'outline'"
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
      </DsButton>
    </DsButtonGroup>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <DsCard
        v-for="filter in filters"
        :key="filter.value"
        class="flex items-center justify-between gap-3 p-4"
      >
        <div>
          <div class="text-sm font-600 text-[var(--fg)]">
            {{ filter.label }}
          </div>
          <div class="text-xs text-[var(--muted-fg)]">
            Queue segment
          </div>
        </div>

        <DsBadge :tone="currentFilter === filter.value ? 'primary' : 'neutral'">
          {{ filter.count }}
        </DsBadge>
      </DsCard>
    </div>
  </div>
</template>