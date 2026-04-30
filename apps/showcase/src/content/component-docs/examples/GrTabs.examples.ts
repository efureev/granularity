import type { ShowcaseComponentExampleDoc } from '../types'

export const grTabsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tabs-basic-switch',
    title: 'Basic switching with controlled state',
    description: 'Базовый controlled-pattern: `GrTabs` хранит только выбранное значение, а содержимое панели принадлежит странице.',
    status: 'ready',
    previewKey: 'ds-tabs-basic-switch',
    code: `<script setup lang="ts">
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
    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm">
      {{ panelContent }}
    </div>
    <GrBadge>Active tab: {{ currentTab }}</GrBadge>
  </div>
</template>`,
  },
  {
    id: 'tabs-badge-navigation',
    title: 'Tabs with badges for queue-like navigation',
    description: 'Показываем `badge` не как украшение, а как часть операционного UI — очереди, ревью, blocked items и другие counters.',
    status: 'ready',
    previewKey: 'ds-tabs-badge-navigation',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTabs } from '@feugene/granularity'

const currentTab = ref('queue')
const tabs = [
  { value: 'queue', label: 'Queue', badge: '12' },
  { value: 'reviews', label: 'Reviews', badge: '4' },
  { value: 'blocked', label: 'Blocked', badge: '2' },
]
</script>

<template>
  <div class="grid gap-3">
    <GrTabs v-model="currentTab" :tabs="tabs" />

    <div class="flex flex-wrap gap-2">
      <GrBadge v-for="tab in tabs" :key="tab.value" :tone="tab.value === currentTab ? 'primary' : 'secondary'">
        {{ tab.label }}: {{ tab.badge }}
      </GrBadge>
    </div>
  </div>
</template>`,
  },
  {
    id: 'tabs-panel-layout',
    title: 'Tabs as page-level panel switcher',
    description: 'Документируем ключевую идею: `GrTabs` — это navigation primitive, а не готовая система вкладочных панелей с собственной разметкой.',
    status: 'ready',
    previewKey: 'ds-tabs-panel-layout',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrTabs } from '@feugene/granularity'

const currentTab = ref('summary')
const tabs = [
  { value: 'summary', label: 'Summary' },
  { value: 'incidents', label: 'Incidents', badge: '3' },
  { value: 'contacts', label: 'Contacts' },
]

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
          <div class="text-sm font-600">{{ sectionTitle }}</div>
          <div class="text-sm text-[var(--muted-fg)]">
            Tabs stay presentation-focused while the page decides which panel to render.
          </div>
        </div>

        <GrButton size="sm" variant="outline">Refresh panel</GrButton>
      </div>

      <div class="flex flex-wrap gap-2">
        <GrBadge v-if="currentTab === 'summary'">Uptime 99.96%</GrBadge>
        <GrBadge v-else-if="currentTab === 'incidents'" tone="warning">3 incidents require follow-up</GrBadge>
        <GrBadge v-else>5 contacts in rotation</GrBadge>
      </div>
    </div>
  </div>
</template>`,
    note: 'Этот сценарий помогает не ожидать от компонента скрытой магии с panels/portals: orchestration остаётся снаружи.',
  },
]
