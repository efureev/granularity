<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrSidebar } from '@feugene/granularity'

const currentSection = ref('overview')
const sections = [
  { label: 'Overview', value: 'overview' },
  { label: 'Team', value: 'team' },
  { label: 'Billing', value: 'billing' },
]
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[240px_minmax(0,1fr)]">
    <GrSidebar title="Workspace" subtitle="Navigation">
      <div class="grid gap-2">
        <GrButton
          v-for="section in sections"
          :key="section.value"
          size="sm"
          :variant="section.value === currentSection ? 'primary' : 'ghost'"
          class="justify-start"
          @click="currentSection = section.value"
        >
          {{ section.label }}
        </GrButton>
      </div>
    </GrSidebar>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="text-base font-semibold capitalize">
          {{ currentSection }}
        </div>
        <GrBadge tone="neutral">
          Inline layout
        </GrBadge>
      </div>
    </div>
  </div>
</template>