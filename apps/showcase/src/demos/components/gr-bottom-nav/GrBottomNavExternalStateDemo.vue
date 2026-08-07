<script setup lang="ts">
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
        `v-model` keeps the bottom navigation in sync with external actions, and a disabled
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
</template>
