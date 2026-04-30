<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrButtonGroup } from '@feugene/granularity'

const currentView = ref('board')

const views = [
  { label: 'Board', value: 'board' },
  { label: 'List', value: 'list' },
  { label: 'Calendar', value: 'calendar' },
]
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <GrButtonGroup aria-label="View switcher">
        <GrButton
          v-for="view in views"
          :key="view.value"
          size="sm"
          :variant="currentView === view.value ? 'primary' : 'outline'"
          @click="currentView = view.value"
        >
          {{ view.label }}
        </GrButton>
      </GrButtonGroup>

      <GrBadge size="sm" tone="primary">
        Active: {{ currentView }}
      </GrBadge>
    </div>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4 text-sm text-[var(--muted-fg)]">
      Используйте группу, когда несколько action-кнопок переключают один контекст и должны восприниматься как единый control cluster.
    </div>
  </div>
</template>