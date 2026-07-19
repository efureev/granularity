<script setup lang="ts">
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

    <div class="flex-1 rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="text-base font-semibold capitalize">
          {{ currentSection }}
        </div>
        <GrBadge tone="neutral">
          {{ collapsed ? 'Collapsed' : 'Expanded' }}
        </GrBadge>
      </div>
      <p class="mt-2 text-sm text-[var(--muted-fg)]">
        Toggle the sidebar: collapsed items keep their icon, and «Billing» (no icon) falls back to its first letter.
      </p>
    </div>
  </div>
</template>
