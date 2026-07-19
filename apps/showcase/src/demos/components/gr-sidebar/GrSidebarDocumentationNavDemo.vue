<script setup lang="ts">
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
          :class="section.value === currentSection ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-fg)]' : 'hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-fg)]'"
          @click="currentSection = section.value"
        >
          <span>{{ section.label }}</span>
          <GrBadge size="sm" tone="neutral">
            #
          </GrBadge>
        </button>
      </div>
    </GrSidebar>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4">
      <div class="text-sm text-[var(--muted-fg)]">
        Current anchor target
      </div>
      <div class="mt-1 text-base font-semibold">
        {{ activeSection }}
      </div>
    </div>
  </div>
</template>