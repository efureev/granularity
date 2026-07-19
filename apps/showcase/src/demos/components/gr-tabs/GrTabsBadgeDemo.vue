<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTabs } from '@feugene/granularity'

const currentTab = ref('queue')
const tabs = [
  { value: 'queue', label: 'Queue', badge: '12' },
  { value: 'reviews', label: 'Reviews', badge: '4' },
  { value: 'blocked', label: 'Blocked', badge: '2' },
]
</script>

<template>
  <div class="grid gap-3">
    <GrTabs v-model="currentTab" :tabs="tabs" />

    <div class="flex flex-wrap gap-2">
      <GrBadge v-for="tab in tabs" :key="tab.value" :tone="tab.value === currentTab ? 'primary' : 'neutral'">
        {{ tab.label }}: {{ tab.badge }}
      </GrBadge>
    </div>
  </div>
</template>