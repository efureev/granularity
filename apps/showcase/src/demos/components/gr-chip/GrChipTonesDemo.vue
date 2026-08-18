<script setup lang="ts">
import { GrChip } from '@feugene/granularity'

const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info', 'slate', 'azure'] as const
const sizes = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <GrChip v-for="tone in tones" :key="tone" :tone="tone" :label="tone" />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <GrChip v-for="tone in tones" :key="tone" :tone="tone" :label="tone" dark />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <GrChip v-for="size in sizes" :key="size" :size="size" tone="info" :label="size" closable />
    </div>
  </div>
</template>
