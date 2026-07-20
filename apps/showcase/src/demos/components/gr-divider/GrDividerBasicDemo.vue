<script setup lang="ts">
import { GrDivider } from '@feugene/granularity'
</script>

<template>
  <div class="grid max-w-md gap-4">
    <div class="showcase-demo-text text-sm">Section A</div>
    <GrDivider />
    <div class="showcase-demo-text text-sm">Section B</div>

    <GrDivider label="OR" />
    <GrDivider label="Left aligned" align="start" />

    <div class="flex items-center gap-3 text-sm">
      <span class="showcase-demo-text">Inline</span>
      <GrDivider orientation="vertical" class="h-5" />
      <span class="showcase-demo-text">vertical divider</span>
    </div>
  </div>
</template>
