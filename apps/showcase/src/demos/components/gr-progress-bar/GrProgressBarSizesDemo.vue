<script setup lang="ts">
import { GrProgressBar } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrProgressBar :value="62" :size="size" aria-label="Upload progress" />
    </div>
  </div>
</template>
