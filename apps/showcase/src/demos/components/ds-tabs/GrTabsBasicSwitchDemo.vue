<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrTabs } from '@feugene/granularity'

const currentTab = ref('overview')
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'billing', label: 'Billing' },
]

const panelContent = computed(() => {
  if (currentTab.value === 'activity')
    return 'Activity tab usually hosts timelines, audits and operator actions.'

  if (currentTab.value === 'billing')
    return 'Billing tab is a natural place for invoices, payment status and limits.'

  return 'Overview tab is the default landing surface for a compact summary.'
})
</script>

<template>
  <div class="grid gap-3">
    <GrTabs v-model="currentTab" :tabs="tabs" />

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--fg)] shadow-[var(--ds-shadow-1)]">
      {{ panelContent }}
    </div>

    <GrBadge>
      Active tab: {{ currentTab }}
    </GrBadge>
  </div>
</template>