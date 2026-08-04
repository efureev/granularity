<script setup lang="ts">
import { GrTooltip } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-2">
      <span class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </span>

      <GrTooltip :size="size" text="Billing runs on the first day of each month." />
    </div>
  </div>
</template>
