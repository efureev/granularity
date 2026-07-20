<script setup lang="ts">
import { GrKbd } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-5 text-sm">
    <span class="inline-flex items-center gap-1">
      <GrKbd>⌘</GrKbd><GrKbd>K</GrKbd>
    </span>
    <span class="inline-flex items-center gap-1">
      <GrKbd>Ctrl</GrKbd><span class="opacity-60">+</span><GrKbd>S</GrKbd>
    </span>
    <span class="inline-flex items-center gap-1">
      <GrKbd size="sm">Esc</GrKbd>
      <span class="showcase-demo-text opacity-70">— small size</span>
    </span>
  </div>
</template>
