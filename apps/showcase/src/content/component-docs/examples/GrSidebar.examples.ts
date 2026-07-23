import type { ShowcaseComponentExampleDoc } from '../types'

export const grSidebarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'sidebar-basic-sections',
    title: 'Basic section rail',
    description: 'Базовый desktop-shell: `GrSidebar` с `v-model:collapsed` и `show-toggle-button`, а навигация собрана из `GrSidebarItem` (иконка, badge, active-состояние). В свёрнутом виде пункты сохраняют иконку, а «Billing» без иконки показывает первую букву.',
    status: 'ready',
    previewKey: 'gr-sidebar-basic-sections',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrSidebar, GrSidebarItem } from '@feugene/granularity'

const currentSection = ref('overview')
const collapsed = ref(false)

// icon — класс UnoCSS-иконки; у «Billing» иконки нет — в свёрнутом виде покажется буква «B».
const sections = [
  { label: 'Overview', value: 'overview', icon: 'i-lucide-layout-dashboard', badge: undefined as number | undefined },
  { label: 'Team', value: 'team', icon: 'i-lucide-users', badge: 4 },
  { label: 'Billing', value: 'billing', icon: undefined, badge: undefined },
  { label: 'Settings', value: 'settings', icon: 'i-lucide-settings', badge: undefined },
]
</script>

<template>
  <div class="flex min-h-[240px] gap-3">
    <GrSidebar
      v-model:collapsed="collapsed"
      title="Workspace"
      subtitle="Navigation"
      show-toggle-button
      class="rounded-xl"
    >
      <div class="grid gap-1">
        <GrSidebarItem
          v-for="section in sections"
          :key="section.value"
          :label="section.label"
          :icon="section.icon"
          :badge="section.badge"
          :active="section.value === currentSection"
          @click="currentSection = section.value"
        />
      </div>
    </GrSidebar>

    <div class="flex-1 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="text-base font-semibold capitalize">
          {{ currentSection }}
        </div>
        <GrBadge tone="neutral">
          {{ collapsed ? 'Collapsed' : 'Expanded' }}
        </GrBadge>
      </div>
      <p class="mt-2 text-sm text-[var(--gr-muted-fg)]">
        Toggle the sidebar: collapsed items keep their icon, and «Billing» (no icon) falls back to its first letter.
      </p>
    </div>
  </div>
</template>`,
  },
  {
    id: 'sidebar-documentation-nav',
    title: 'Documentation anchors',
    description: 'Sidebar как rail для doc anchors: кастомные `<button>`-пункты с active-подсветкой через `--gr-sidebar-*` токены и badge-маркером якоря.',
    status: 'ready',
    previewKey: 'gr-sidebar-documentation-nav',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrSidebar } from '@feugene/granularity'

const currentSection = ref('api')
const sections = [
  { label: 'Overview', value: 'overview' },
  { label: 'Examples', value: 'examples' },
  { label: 'API', value: 'api' },
  { label: 'Notes', value: 'notes' },
]

const activeSection = computed(() => {
  return sections.find(section => section.value === currentSection.value)?.label ?? 'API'
})
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[260px_minmax(0,1fr)]">
    <GrSidebar title="Doc sections" subtitle="Anchored navigation">
      <div class="grid gap-2">
        <button
          v-for="section in sections"
          :key="section.value"
          type="button"
          class="flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors"
          :class="section.value === currentSection ? 'bg-[var(--gr-sidebar-primary)] text-[var(--gr-sidebar-primary-fg)]' : 'hover:bg-[var(--gr-sidebar-accent)] hover:text-[var(--gr-sidebar-accent-fg)]'"
          @click="currentSection = section.value"
        >
          <span>{{ section.label }}</span>
          <GrBadge size="sm" tone="neutral">#</GrBadge>
        </button>
      </div>
    </GrSidebar>

    <div class="rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4">
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Current anchor target
      </div>
      <div class="mt-1 text-base font-semibold">
        {{ activeSection }}
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'sidebar-filter-rail',
    title: 'Filter rail composition',
    description: 'Sidebar как persistent container для фильтров и переключателей: набор `GrSwitch`, чьё состояние отражается справа через `GrBadge`.',
    status: 'ready',
    previewKey: 'gr-sidebar-filter-rail',
    code: `<script setup lang="ts">
import { reactive } from 'vue'

import { GrBadge, GrSidebar, GrSwitch } from '@feugene/granularity'

const filters = reactive({
  active: true,
  assigned: false,
  overdue: true,
})
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[260px_minmax(0,1fr)]">
    <GrSidebar title="Filters" subtitle="Sticky control rail">
      <div class="grid gap-3">
        <label class="flex items-center justify-between gap-3 text-sm">
          Active only
          <GrSwitch v-model="filters.active" />
        </label>
        <label class="flex items-center justify-between gap-3 text-sm">
          Assigned to me
          <GrSwitch v-model="filters.assigned" />
        </label>
        <label class="flex items-center justify-between gap-3 text-sm">
          Overdue
          <GrSwitch v-model="filters.overdue" />
        </label>
      </div>
    </GrSidebar>

    <div class="rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4">
      <div class="flex flex-wrap gap-2">
        <GrBadge :tone="filters.active ? 'primary' : 'neutral'">
          Active: {{ filters.active ? 'on' : 'off' }}
        </GrBadge>
        <GrBadge :tone="filters.assigned ? 'primary' : 'neutral'">
          Assigned: {{ filters.assigned ? 'on' : 'off' }}
        </GrBadge>
        <GrBadge :tone="filters.overdue ? 'primary' : 'neutral'">
          Overdue: {{ filters.overdue ? 'on' : 'off' }}
        </GrBadge>
      </div>
    </div>
  </div>
</template>`,
  },
]
