import type { ShowcaseComponentExampleDoc } from '../types'

export const dsSidebarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'sidebar-basic-sections',
    title: 'Basic section rail',
    description: 'Базовый сценарий для desktop-shell: `DsSidebar` хранит группу section actions и остаётся визуальной рамкой для левой навигации.',
    status: 'ready',
    previewKey: 'ds-sidebar-basic-sections',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsSidebar } from '@feugene/granularity'

const currentSection = ref('overview')
const sections = [
  { label: 'Overview', value: 'overview' },
  { label: 'Team', value: 'team' },
  { label: 'Billing', value: 'billing' },
]
</script>

<template>
  <DsSidebar title="Workspace" subtitle="Navigation">
    <div class="grid gap-2">
      <DsButton
        v-for="section in sections"
        :key="section.value"
        size="sm"
        :variant="section.value === currentSection ? 'primary' : 'ghost'"
        class="justify-start"
        @click="currentSection = section.value"
      >
        {{ section.label }}
      </DsButton>
    </div>
  </DsSidebar>
</template>`,
  },
  {
    id: 'sidebar-documentation-nav',
    title: 'Documentation anchors',
    description: 'Показываем sidebar как rail для doc anchors и section-level jump links внутри длинных страниц витрины.',
    status: 'ready',
    previewKey: 'ds-sidebar-documentation-nav',
    code: `<script setup lang="ts">
import { DsSidebar } from '@feugene/granularity'
</script>

<template>
  <DsSidebar title="Doc sections" subtitle="Anchored navigation">
    <button type="button" class="rounded-md px-3 py-2 text-left text-sm">
      API
    </button>
  </DsSidebar>
</template>`,
  },
  {
    id: 'sidebar-filter-rail',
    title: 'Filter rail composition',
    description: 'Sidebar можно использовать не только для route navigation, но и как persistent container для filters, toggles и secondary controls.',
    status: 'ready',
    previewKey: 'ds-sidebar-filter-rail',
    code: `<script setup lang="ts">
import { reactive } from 'vue'

import { DsSidebar, DsSwitch } from '@feugene/granularity'

const filters = reactive({
  active: true,
  assigned: false,
  overdue: true,
})
</script>

<template>
  <DsSidebar title="Filters" subtitle="Sticky control rail">
    <div class="grid gap-3">
      <label class="flex items-center justify-between gap-3 text-sm">
        Active only
        <DsSwitch v-model="filters.active" />
      </label>
    </div>
  </DsSidebar>
</template>`,
  },
]
