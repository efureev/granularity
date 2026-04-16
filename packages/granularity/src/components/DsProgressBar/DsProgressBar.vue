<script setup lang="ts">
import { computed } from 'vue'

import { dsProgressBarFillClass, type DsProgressBarTone } from './dsStyle'

const props = withDefaults(defineProps<{
  value: number
  ariaLabel?: string
  tone?: DsProgressBarTone
}>(), {
  ariaLabel: undefined,
  tone: 'primary',
})

const safe = computed(() => {
  if (Number.isNaN(props.value))
    return 0

  return Math.min(100, Math.max(0, props.value))
})

const fillClassName = computed(() => dsProgressBarFillClass(props.tone))
</script>

<template>
  <div
    role="progressbar"
    :aria-label="props.ariaLabel"
    :aria-valuenow="safe"
    aria-valuemin="0"
    aria-valuemax="100"
    class="h-2 w-full rounded-full bg-[var(--muted)] border border-[var(--brd)] overflow-hidden"
  >
    <div
      class="h-full"
      :class="fillClassName"
      :style="{ width: `${safe}%` }"
    />
  </div>
</template>