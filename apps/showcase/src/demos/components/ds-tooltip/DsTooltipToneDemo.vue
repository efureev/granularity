<script setup lang="ts">
import { ref } from 'vue'

import { DsInput, DsTooltip } from '@feugene/granularity'

const tooltipText = ref('Escalation policy will be applied to new alerts only.')
const iconColor = ref('var(--warning)')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-600 text-[var(--fg)]">
        Custom tone
      </span>
      <DsTooltip :text="tooltipText" :icon-color="iconColor" />
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <DsInput v-model="tooltipText" placeholder="Tooltip text" />
      <DsInput v-model="iconColor" placeholder="var(--warning) / #f59e0b" />
    </div>
  </div>
</template>