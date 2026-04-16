<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsCheckbox, DsSwitch } from '@feugene/granularity'

const weeklyDigest = ref(true)
const incidentAlerts = ref(false)
const controlsDisabled = ref(false)

const enabledCount = computed(() => [weeklyDigest.value, incidentAlerts.value].filter(Boolean).length)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-3">
      <DsCheckbox v-model="weeklyDigest" :disabled="controlsDisabled">
        Weekly product digest
      </DsCheckbox>
      <DsCheckbox v-model="incidentAlerts" :disabled="controlsDisabled">
        Incident alerts
      </DsCheckbox>
      <DsCheckbox :model-value="true" disabled>
        Security bulletins are always enabled
      </DsCheckbox>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div>
        <div class="text-sm font-semibold text-[var(--fg)]">
          Selection summary
        </div>
        <div class="text-sm text-[var(--muted-fg)]">
          {{ enabledCount }} of 2 optional channels are active.
        </div>
      </div>

      <DsSwitch v-model="controlsDisabled" size="sm">
        Lock editable options
      </DsSwitch>
    </div>
  </div>
</template>