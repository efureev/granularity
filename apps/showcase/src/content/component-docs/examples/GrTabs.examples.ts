import type { ShowcaseComponentExampleDoc } from '../types'

export const grTabsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tabs-activation',
    title: 'Режим активации и вертикальные вкладки',
    description: '`activationMode="manual"` двигает стрелками только фокус, `orientation="vertical"` разворачивает список в колонку.',
    status: 'ready',
    previewKey: 'gr-tabs-activation',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import type { GrTabsOrientation } from '@feugene/granularity'
import { GrSegmented, GrTabPanel, GrTabPanels, GrTabs } from '@feugene/granularity'

const tab = ref('overview')
const orientation = ref<GrTabsOrientation>('horizontal')
const manual = ref(true)

const tabs = [
  { value: 'overview', label: 'Обзор' },
  { value: 'activity', label: 'Активность', badge: '12' },
  { value: 'archive', label: 'Архив', disabled: true },
  { value: 'billing', label: 'Счета' },
]
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrSegmented
        v-model="orientation"
        size="sm"
        :options="[
          { value: 'horizontal', label: 'horizontal' },
          { value: 'vertical', label: 'vertical' },
        ]"
      />
      <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
        <input v-model="manual" type="checkbox">
        activationMode="manual"
      </label>
    </div>

    <div class="flex flex-wrap items-start gap-4">
      <GrTabs
        v-model="tab"
        :tabs="tabs"
        :orientation="orientation"
        :activation-mode="manual ? 'manual' : 'automatic'"
        id-base="activation-demo"
      />

      <GrTabPanels v-model="tab" id-base="activation-demo" class="min-w-[16rem] flex-1">
        <GrTabPanel v-for="item in tabs" :key="item.value" :value="item.value">
          Панель «{{ item.label }}»
        </GrTabPanel>
      </GrTabPanels>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      В ручном режиме стрелки двигают только фокус — выбор подтверждает \`Enter\` или \`Space\`.
      Отключённая вкладка остаётся объявленной, но пропускается при переборе.
    </div>
  </div>
</template>`,
  },
  {
    id: 'tabs-basic-switch',
    title: 'Basic switching with controlled state',
    description: 'Базовый controlled-pattern: `GrTabs` хранит только выбранное значение, а содержимое панели принадлежит странице.',
    status: 'ready',
    previewKey: 'gr-tabs-basic-switch',
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
    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm">
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
    previewKey: 'gr-tabs-badge-navigation',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTabs } from '@feugene/granularity'

const currentTab = ref('queue')
const tabs = [
  { value: 'queue', label: 'Queue', badge: '12', icon: 'i-lucide-inbox' },
  { value: 'reviews', label: 'Reviews', badge: '4', icon: 'i-lucide-eye' },
  { value: 'blocked', label: 'Blocked', badge: '2', icon: 'i-lucide-ban' },
]
</script>

<template>
  <div class="grid gap-3">
    <GrTabs v-model="currentTab" :tabs="tabs" />

    <GrTabs v-model="currentTab" :tabs="tabs" variant="line" />

    <div class="flex flex-wrap gap-2">
      <GrBadge v-for="tab in tabs" :key="tab.value" :tone="tab.value === currentTab ? 'primary' : 'neutral'">
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
    previewKey: 'gr-tabs-panel-layout',
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

    <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 shadow-[var(--gr-shadow-1)]">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-sm font-600">{{ sectionTitle }}</div>
          <div class="text-sm text-[var(--gr-muted-fg)]">
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
  {
    id: 'tabs-sizes',
    title: 'Шкала размеров',
    description: 'Высота вкладки повторяет шкалу `GrButton` — вкладки часто стоят с кнопкой в один ряд. Счётчик у вкладки масштабируется вместе с подписью.',
    status: 'ready',
    previewKey: 'gr-tabs-sizes',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrTabs } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const active = ref('overview')

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity', badge: '12' },
  { value: 'settings', label: 'Settings' },
]
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrTabs v-model="active" :tabs="tabs" :size="size" />
    </div>
  </div>
</template>`,
  },
]
