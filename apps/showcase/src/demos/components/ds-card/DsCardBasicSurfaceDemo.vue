<script setup lang="ts">
import {DsCard, DsButton} from "@feugene/granularity";
</script>
<template>
  <DsCard class="grid gap-4 p-5">
    <div>
      <div class="text-sm font-semibold text-[var(--fg)]">Basic card</div>
      <div class="mt-1 text-sm text-[var(--muted-fg)]">
        Use cards to group related content and keep border/background treatment consistent across the app shell.
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <DsButton size="sm">Primary action</DsButton>
      <DsButton size="sm" variant="outline">Secondary</DsButton>
    </div>
  </DsCard>
</template>
