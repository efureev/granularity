<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsButtonGroup } from '@feugene/granularity'

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
      <DsButtonGroup aria-label="View switcher">
        <DsButton
          v-for="view in views"
          :key="view.value"
          size="sm"
          :variant="currentView === view.value ? 'primary' : 'outline'"
          @click="currentView = view.value"
        >
          {{ view.label }}
        </DsButton>
      </DsButtonGroup>

      <DsBadge size="sm" tone="primary">
        Active: {{ currentView }}
      </DsBadge>
    </div>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4 text-sm text-[var(--muted-fg)]">
      Используйте группу, когда несколько action-кнопок переключают один контекст и должны восприниматься как единый control cluster.
    </div>
  </div>
</template>