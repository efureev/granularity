<script setup lang="ts">
import {DsBadge, DsCard, DsIcon} from '@feugene/granularity'
import IconCircleCheck from '~icons/lucide/circle-check-big'


const stats = [
  {label: 'Healthy integrations', value: '18', tone: 'text-emerald-500'},
  {label: 'Needs review', value: '4', tone: 'text-amber-500'},
  {label: 'Failed checks', value: '1', tone: 'text-rose-500'},
]
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <DsCard
        v-for="stat in stats"
        :key="stat.label"
        class="grid gap-3 p-4"
    >
      <div class="flex items-center justify-between gap-3">
        <DsIcon size="lg" :class="stat.tone">
          <IconCircleCheck/>
        </DsIcon>

        <DsBadge size="sm" tone="neutral">
          snapshot
        </DsBadge>
      </div>

      <div>
        <div class="text-2xl font-700 text-[var(--fg)]">
          {{ stat.value }}
        </div>
        <div class="text-sm text-[var(--muted-fg)]">
          {{ stat.label }}
        </div>
      </div>
    </DsCard>
  </div>
</template>