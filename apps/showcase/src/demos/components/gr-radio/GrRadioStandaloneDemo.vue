<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrRadio } from '@feugene/granularity'

const delivery = ref('weekly')

const selectedLabel = computed(() => {
  const labels: Record<string, string> = {
    daily: 'Daily digest',
    weekly: 'Weekly digest',
    monthly: 'Monthly report',
  }

  return labels[delivery.value] ?? delivery.value
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-3">
      <GrRadio v-model="delivery" name="digest-frequency" value="daily">
        Daily digest
      </GrRadio>
      <GrRadio v-model="delivery" name="digest-frequency" value="weekly">
        Weekly digest
      </GrRadio>
      <GrRadio v-model="delivery" name="digest-frequency" value="monthly">
        Monthly report
      </GrRadio>
    </div>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Current delivery cadence:
      <div class="mt-2 text-base font-semibold text-[var(--fg)]">
        {{ selectedLabel }}
      </div>
    </div>
  </div>
</template>