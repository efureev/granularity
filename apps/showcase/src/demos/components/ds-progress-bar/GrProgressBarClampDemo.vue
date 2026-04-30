<script setup lang="ts">
import { GrBadge, GrProgressBar } from '@feugene/granularity'

const rows = [
  { label: 'Imported from legacy job', raw: -18, tone: 'danger' as const },
  { label: 'Actual processed records', raw: 58, tone: 'info' as const },
  { label: 'Overreported upstream value', raw: 146, tone: 'warning' as const },
]
</script>

<template>
  <div class="grid gap-3">
    <div
      v-for="row in rows"
      :key="row.label"
      class="grid gap-2 rounded-xl border border-[var(--brd)] bg-[var(--card)] p-3"
    >
      <div class="flex items-center justify-between gap-3 text-sm">
        <span>{{ row.label }}</span>
        <GrBadge size="sm" :tone="row.tone">input: {{ row.raw }}%</GrBadge>
      </div>

      <GrProgressBar :value="row.raw" :tone="row.tone" :aria-label="row.label" />
    </div>
  </div>
</template>