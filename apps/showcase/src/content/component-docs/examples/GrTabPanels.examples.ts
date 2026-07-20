import type { ShowcaseComponentExampleDoc } from '../types'

export const grTabPanelsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tab-panels-basic',
    title: 'Accessible tabs with linked panels',
    description: 'Companion к `GrTabs`: одинаковый `id-base` связывает вкладки и панели по ARIA (`aria-controls` ↔ `aria-labelledby`). Показывается панель активной вкладки; `keep-alive` оставляет неактивные в DOM.',
    status: 'ready',
    previewKey: 'gr-tab-panels-basic',
    code: `<script setup lang="ts">
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
  <GrTabs v-model="active" :tabs="tabs" id-base="tabs" />

  <GrTabPanels v-model="active" id-base="tabs">
    <GrTabPanel value="overview">Overview panel.</GrTabPanel>
    <GrTabPanel value="activity">Activity panel.</GrTabPanel>
    <GrTabPanel value="settings">Settings panel.</GrTabPanel>
  </GrTabPanels>
</template>`,
  },
]
