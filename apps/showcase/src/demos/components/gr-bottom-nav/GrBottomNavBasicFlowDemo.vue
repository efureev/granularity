<script setup lang="ts">
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
</template>
