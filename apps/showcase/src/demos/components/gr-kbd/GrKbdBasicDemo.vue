<script setup lang="ts">
import { GrKbd } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 text-sm">
    <div class="flex flex-wrap items-center gap-5">
      <!-- `mod` сам превращается в Cmd на macOS и в Ctrl на остальных платформах. -->
      <GrKbd keys="mod+K" />
      <GrKbd keys="mod+shift+P" />
      <GrKbd :keys="['ctrl', 'S']" />
      <GrKbd>Esc</GrKbd>
    </div>

    <div class="flex flex-wrap items-center gap-5">
      <GrKbd keys="mod+K" size="xs" />
      <GrKbd keys="mod+K" size="sm" />
      <GrKbd keys="mod+K" size="md" />
      <GrKbd keys="mod+K" size="lg" />
    </div>
  </div>
</template>
