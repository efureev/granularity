<script setup lang="ts">
import { GrCard, GrProgressCircle } from '@feugene/granularity'

const metrics = [
  { label: 'CPU', value: 72, tone: 'primary' as const },
  { label: 'Память', value: 91, tone: 'warning' as const },
  { label: 'Диск', value: 34, tone: 'success' as const },
]
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <GrCard v-for="metric in metrics" :key="metric.label">
      <div class="grid justify-items-center gap-2 px-4 py-2">
        <GrProgressCircle
          :value="metric.value"
          :tone="metric.tone"
          shape="dashboard"
          size="lg"
          show-value
          :aria-label="metric.label"
        />
        <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">{{ metric.label }}</span>
      </div>
    </GrCard>
  </div>
</template>
