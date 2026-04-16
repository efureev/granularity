<script setup lang="ts">
import { DsTooltip } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <label class="inline-flex items-center gap-2 text-sm font-600 text-[var(--fg)]">
      Notification email
      <DsTooltip text="We use this address only for billing alerts and incident updates." />
    </label>

    <div class="rounded-2xl border border-dashed border-[var(--brd)] bg-[var(--muted)]/60 p-4 text-sm text-[var(--muted-fg)]">
      Hover or focus the info icon to inspect the help copy.
    </div>
  </div>
</template>