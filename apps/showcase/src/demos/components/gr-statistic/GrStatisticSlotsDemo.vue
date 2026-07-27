<script setup lang="ts">
import { GrBadge, GrCard, GrStatistic } from '@feugene/granularity'

const uptime = '99.982'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <GrCard class="p-4">
      <GrStatistic title="Uptime" :value="uptime" :precision="3" suffix="%" size="lg" tone="success">
        <template #trend>
          <GrBadge tone="success" size="xs">
            SLA met
          </GrBadge>
        </template>
      </GrStatistic>
    </GrCard>

    <GrCard class="p-4">
      <GrStatistic title="Time to first response" value="2 h 15 min" size="sm">
        <template #icon>
          <span class="i-lucide-clock block h-4 w-4" aria-hidden="true" />
        </template>
        <template #trend>
          <span>Target — under 4 hours</span>
        </template>
      </GrStatistic>
    </GrCard>
  </div>
</template>
