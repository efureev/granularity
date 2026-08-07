import type { ShowcaseComponentExampleDoc } from '../types'

export const grBottomNavExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'bottom-nav-basic-flow',
    title: 'Basic section switcher',
    description: 'Базовый сценарий: иконки, счётчик на разделе и активный пункт, который отличается не только цветом.',
    status: 'ready',
    previewKey: 'gr-bottom-nav-basic-flow',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBottomNav, GrCard } from '@feugene/granularity'

const currentSection = ref('overview')
const items = [
  { label: 'Overview', value: 'overview', icon: 'i-lucide-layout-dashboard' },
  { label: 'Invoices', value: 'invoices', icon: 'i-lucide-receipt', badge: 3 },
  { label: 'Team', value: 'team', icon: 'i-lucide-users' },
]

const activeLabel = computed(() => {
  return items.find(item => item.value === currentSection.value)?.label ?? 'Overview'
})
</script>

<template>
  <div class="grid gap-4">
    <GrCard class="p-4">
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Active section
      </div>
      <div class="text-base font-semibold">
        {{ activeLabel }}
      </div>
    </GrCard>

    <GrBottomNav
      v-model="currentSection"
      :items="items"
      position="static"
      hide-above="none"
    />
  </div>
</template>`,
  },
  {
    id: 'bottom-nav-external-state',
    title: 'External state sync',
    description: '`v-model` меняется и снаружи компонента — из кнопок страницы; недоступный раздел остаётся виден, но не кликается.',
    status: 'ready',
    previewKey: 'gr-bottom-nav-external-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBottomNav, GrButton, GrCard } from '@feugene/granularity'

const currentSection = ref('feed')
const items = [
  { label: 'Feed', value: 'feed', icon: 'i-lucide-newspaper' },
  { label: 'Tasks', value: 'tasks', icon: 'i-lucide-check-square', badge: 12 },
  { label: 'Billing', value: 'billing', icon: 'i-lucide-credit-card', disabled: true },
  { label: 'Profile', value: 'profile', icon: 'i-lucide-user' },
]
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" variant="outline" @click="currentSection = 'feed'">
        Open feed
      </GrButton>
      <GrButton size="sm" variant="outline" @click="currentSection = 'tasks'">
        Jump to tasks
      </GrButton>
      <GrButton size="sm" variant="outline" @click="currentSection = 'profile'">
        Focus profile
      </GrButton>
    </div>

    <GrCard class="p-4">
      <div class="text-sm text-[var(--gr-muted-fg)]">
        \`v-model\` keeps the bottom navigation in sync with external actions, and a disabled
        destination stays visible without being reachable.
      </div>
      <div class="mt-2 text-base font-semibold capitalize">
        Current section: {{ currentSection }}
      </div>
    </GrCard>

    <GrBottomNav
      v-model="currentSection"
      :items="items"
      position="static"
      hide-above="none"
    />
  </div>
</template>`,
  },
  {
    id: 'bottom-nav-mobile-shell',
    title: 'Mobile shell composition',
    description: 'Пункты-ссылки внутри мобильного макета: правый клик и «открыть в новой вкладке» работают как везде. В приложении панель обычно `fixed` и скрыта на широких экранах.',
    status: 'ready',
    previewKey: 'gr-bottom-nav-mobile-shell',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBottomNav, GrCard } from '@feugene/granularity'

const currentSection = ref('approvals')
const items = [
  { label: 'Approvals', value: 'approvals', icon: 'i-lucide-check-check', href: '#approvals' },
  { label: 'Calendar', value: 'calendar', icon: 'i-lucide-calendar', href: '#calendar' },
  { label: 'Settings', value: 'settings', icon: 'i-lucide-settings', href: '#settings' },
]

const sectionDescriptions: Record<string, string> = {
  approvals: 'Items become real links, so a right click or “open in new tab” works as anywhere else.',
  calendar: 'The bar keeps the current destination announced as the current page, not just coloured.',
  settings: 'In a real app the bar is fixed to the bottom edge and hidden on wide screens by default.',
}

const sectionDescription = computed(() => {
  return sectionDescriptions[currentSection.value] ?? sectionDescriptions.approvals
})
</script>

<template>
  <div class="mx-auto grid max-w-80 gap-0 overflow-hidden rounded-3xl border border-[var(--gr-brd)]">
    <GrCard class="rounded-none border-0 p-4">
      <div class="text-base font-semibold capitalize">
        {{ currentSection }}
      </div>
      <div class="mt-1 text-sm text-[var(--gr-muted-fg)]">
        {{ sectionDescription }}
      </div>
    </GrCard>

    <GrBottomNav
      v-model="currentSection"
      :items="items"
      position="static"
      hide-above="none"
      aria-label="Mobile shell sections"
    />
  </div>
</template>`,
  },
]
