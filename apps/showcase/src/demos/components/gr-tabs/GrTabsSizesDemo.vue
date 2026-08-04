<script setup lang="ts">
import { ref } from 'vue'

import { GrTabs } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const active = ref('overview')

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity', badge: '12' },
  { value: 'settings', label: 'Settings' },
]
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrTabs v-model="active" :tabs="tabs" :size="size" />
    </div>
  </div>
</template>
