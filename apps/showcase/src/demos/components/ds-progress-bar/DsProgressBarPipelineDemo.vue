<script setup lang="ts">
import { DsBadge, DsProgressBar } from '@feugene/granularity'

const stages = [
  { label: 'Validation', value: 100, tone: 'success' as const },
  { label: 'Fraud screening', value: 72, tone: 'warning' as const },
  { label: 'Settlement', value: 41, tone: 'neutral' as const },
]
</script>

<template>
  <div class="grid gap-3">
    <div
      v-for="stage in stages"
      :key="stage.label"
      class="grid gap-2 rounded-xl border border-[var(--brd)] bg-[var(--card)] p-3"
    >
      <div class="flex items-center justify-between gap-3 text-sm">
        <span>{{ stage.label }}</span>
        <DsBadge size="sm" :tone="stage.tone">{{ stage.value }}%</DsBadge>
      </div>

      <DsProgressBar :value="stage.value" :tone="stage.tone" :aria-label="stage.label" />
    </div>
  </div>
</template>