<script setup lang="ts">
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
</template>
