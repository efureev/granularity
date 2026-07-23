<script setup lang="ts">
import { ref } from 'vue'

import { GrTabPanel, GrTabPanels, GrTabs, type GrTab } from '@feugene/granularity'

const active = ref('overview')
const tabs: GrTab[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity', badge: '3' },
  { value: 'settings', label: 'Settings' },
]
</script>

<template>
  <!-- Одинаковый `id-base` связывает вкладки и панели по ARIA (aria-controls ↔ aria-labelledby). -->
  <div class="grid max-w-lg gap-3">
    <GrTabs v-model="active" :tabs="tabs" id-base="demo-tabs" />

    <GrTabPanels
      v-model="active"
      id-base="demo-tabs"
      class="rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-fg)]"
    >
      <GrTabPanel value="overview">Overview: a summary of the workspace.</GrTabPanel>
      <GrTabPanel value="activity">Activity: 3 new items since your last visit.</GrTabPanel>
      <GrTabPanel value="settings">Settings: manage members and preferences.</GrTabPanel>
    </GrTabPanels>
  </div>
</template>
