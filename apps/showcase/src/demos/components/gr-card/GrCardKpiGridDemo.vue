<script setup lang="ts">
import { GrBadge, GrCard } from '@feugene/granularity'

const metrics = [
  { id: 'budget', label: 'Error budget', value: '98.4%', tone: 'success', badge: 'Healthy' },
  { id: 'reviews', label: 'Pending reviews', value: '7', tone: 'warning', badge: 'Attention' },
  { id: 'pipelines', label: 'Blocked pipelines', value: '2', tone: 'danger', badge: 'Escalate' },
] as const
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <GrCard
      v-for="metric in metrics"
      :key="metric.id"
      padding="sm"
      variant="outlined"
      body-class="grid gap-2"
    >
      <div class="text-sm text-[var(--gr-muted-fg)]">
        {{ metric.label }}
      </div>
      <div class="text-2xl font-semibold text-[var(--gr-fg)]">
        {{ metric.value }}
      </div>
      <GrBadge size="sm" :tone="metric.tone" radius="semi">
        {{ metric.badge }}
      </GrBadge>
    </GrCard>
  </div>
</template>
