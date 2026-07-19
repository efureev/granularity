<script setup lang="ts">
import { GrTooltip } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <GrTooltip text="Custom slot lets you attach the tooltip to any trigger element.">
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brd)] bg-[var(--card)] text-sm font-700 text-[var(--fg)] transition-colors hover:bg-[var(--muted)]"
        aria-label="Open contextual help"
      >
        ?
      </button>
    </GrTooltip>

    <span class="text-sm text-[var(--muted-fg)]">
      Reuse the same tooltip primitive for icon buttons, labels or table headers.
    </span>
  </div>
</template>