<script setup lang="ts">
import { ref } from 'vue'

import { DsBottomNav, DsButton, DsCard } from '@feugene/granularity'

const currentSection = ref('feed')
const items = [
  { label: 'Feed', value: 'feed' },
  { label: 'Tasks', value: 'tasks' },
  { label: 'Profile', value: 'profile' },
]
</script>

<template>
  <div class="grid gap-4 pb-16 sm:pb-4">
    <div class="flex flex-wrap gap-2">
      <DsButton size="sm" variant="outline" @click="currentSection = 'feed'">
        Open feed
      </DsButton>
      <DsButton size="sm" variant="outline" @click="currentSection = 'tasks'">
        Jump to tasks
      </DsButton>
      <DsButton size="sm" variant="outline" @click="currentSection = 'profile'">
        Focus profile
      </DsButton>
    </div>

    <DsCard class="p-4">
      <div class="text-sm text-[var(--muted-fg)]">
        `v-model` keeps the bottom navigation in sync with external actions.
      </div>
      <div class="mt-2 text-base font-semibold capitalize">
        Current section: {{ currentSection }}
      </div>
    </DsCard>

    <DsBottomNav v-model="currentSection" :items="items" />
  </div>
</template>