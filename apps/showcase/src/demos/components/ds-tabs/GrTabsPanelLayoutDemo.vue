<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrTabs } from '@feugene/granularity'

type ViewKey = 'summary' | 'incidents' | 'contacts'

const currentTab = ref<ViewKey>('summary')
const tabs = [
  { value: 'summary', label: 'Summary' },
  { value: 'incidents', label: 'Incidents', badge: '3' },
  { value: 'contacts', label: 'Contacts' },
] satisfies Array<{ value: ViewKey, label: string, badge?: string }>

const sectionTitle = computed(() => {
  if (currentTab.value === 'incidents')
    return 'Escalation queue'

  if (currentTab.value === 'contacts')
    return 'On-call contacts'

  return 'Service health summary'
})
</script>

<template>
  <div class="grid gap-4">
    <GrTabs v-model="currentTab" :tabs="tabs" />

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 shadow-[var(--ds-shadow-1)]">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-sm font-600 text-[var(--fg)]">
            {{ sectionTitle }}
          </div>
          <div class="text-sm text-[var(--muted-fg)]">
            Tabs stay presentation-focused while the page decides which panel to render.
          </div>
        </div>

        <GrButton size="sm" variant="outline">
          Refresh panel
        </GrButton>
      </div>

      <div class="flex flex-wrap gap-2">
        <GrBadge v-if="currentTab === 'summary'">
          Uptime 99.96%
        </GrBadge>
        <GrBadge v-else-if="currentTab === 'incidents'" tone="warning">
          3 incidents require follow-up
        </GrBadge>
        <GrBadge v-else>
          5 contacts in rotation
        </GrBadge>
      </div>
    </div>
  </div>
</template>