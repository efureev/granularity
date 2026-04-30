<script setup lang="ts">
import {GrCard, GrButton} from "@feugene/granularity";
</script>
<template>
  <GrCard class="grid gap-4 p-5">
    <div>
      <div class="text-sm font-semibold text-[var(--fg)]">Basic card</div>
      <div class="mt-1 text-sm text-[var(--muted-fg)]">
        Use cards to group related content and keep border/background treatment consistent across the app shell.
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <GrButton size="sm">Primary action</GrButton>
      <GrButton size="sm" variant="outline">Secondary</GrButton>
    </div>
  </GrCard>
</template>
