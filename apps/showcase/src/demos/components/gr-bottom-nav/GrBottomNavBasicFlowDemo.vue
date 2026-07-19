<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrBottomNav, GrCard } from '@feugene/granularity'

const currentSection = ref('overview')
const items = [
  { label: 'Overview', value: 'overview' },
  { label: 'Invoices', value: 'invoices' },
  { label: 'Team', value: 'team' },
]

const activeLabel = computed(() => {
  return items.find(item => item.value === currentSection.value)?.label ?? 'Overview'
})
</script>

<template>
  <div class="grid gap-4 pb-16 sm:pb-4">
    <GrCard class="p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm text-[var(--muted-fg)]">
            Active section
          </div>
          <div class="text-base font-semibold">
            {{ activeLabel }}
          </div>
        </div>

        <GrBadge tone="info">
          {{ currentSection }}
        </GrBadge>
      </div>
    </GrCard>

    <GrBottomNav v-model="currentSection" :items="items" />
  </div>
</template>