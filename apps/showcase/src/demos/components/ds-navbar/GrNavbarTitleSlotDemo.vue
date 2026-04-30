<script setup lang="ts">
import { GrBadge, GrButton, GrNavbar } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-3">
    <GrNavbar title="Ignored by slot">
      <template #title>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold">Release dashboard</span>
          <GrBadge size="sm" tone="info">
            Beta
          </GrBadge>
        </div>
      </template>

      <GrButton size="sm">
        Publish
      </GrButton>
    </GrNavbar>

    <div class="px-4 py-3 text-sm text-[var(--muted-fg)]">
      Title slot lets you replace the default text with richer branding or contextual breadcrumbs.
    </div>
  </div>
</template>