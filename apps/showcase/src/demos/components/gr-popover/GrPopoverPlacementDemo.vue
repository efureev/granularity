<script setup lang="ts">
import { GrButton, GrPopover } from '@feugene/granularity'

const placements = ['top', 'right', 'bottom', 'left'] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <GrPopover
      v-for="placement in placements"
      :key="placement"
      :placement="placement"
      :aria-label="`Opens on the ${ placement}`"
      size="sm"
    >
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" size="sm" v-bind="triggerProps">
          {{ placement }}
        </GrButton>
      </template>

      <template #content>
        <div class="w-40 text-[var(--gr-fg)]">
          Opens on the <b>{{ placement }}</b> and flips itself when the edge is close.
        </div>
      </template>
    </GrPopover>
  </div>
</template>
