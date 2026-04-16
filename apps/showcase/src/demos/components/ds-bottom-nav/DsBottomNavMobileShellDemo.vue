<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsBadge, DsBottomNav, DsCard } from '@feugene/granularity'

const currentSection = ref('approvals')
const items = [
  { label: 'Approvals', value: 'approvals' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Settings', value: 'settings' },
]

const sectionDescriptions: Record<string, string> = {
  approvals: 'Useful when the bottom navigation is the primary switcher between top-level mobile sections.',
  calendar: 'Keeps the current page visible while navigation remains fixed at the bottom edge.',
  settings: 'A separate settings destination can stay reachable without rebuilding the surrounding layout.',
}

const sectionDescription = computed(() => {
  return sectionDescriptions[currentSection.value] ?? sectionDescriptions.approvals
})
</script>

<template>
  <div class="grid gap-4 pb-16 sm:pb-4">
    <DsCard class="p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-base font-semibold capitalize">
            {{ currentSection }}
          </div>
          <div class="mt-1 text-sm text-[var(--muted-fg)]">
            {{ sectionDescription }}
          </div>
        </div>

        <DsBadge size="sm" tone="info">
          Safe area ready
        </DsBadge>
      </div>
    </DsCard>

    <DsBottomNav v-model="currentSection" :items="items" />
  </div>
</template>