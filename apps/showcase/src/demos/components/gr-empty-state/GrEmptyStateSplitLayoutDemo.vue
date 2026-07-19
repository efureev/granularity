<script setup lang="ts">
import { GrButton, GrCard, GrEmptyState } from '@feugene/granularity'
</script>

<template>
  <GrCard class="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
    <div class="rounded-xl border border-dashed border-[var(--brd)] bg-[var(--muted)] p-4 text-sm text-[var(--muted-fg)]">
      Left rail can keep filters, contextual hints or a compact KPI while the main area uses `GrEmptyState`.
    </div>

    <GrEmptyState title="No team members invited" description="Use empty-state content inside larger layouts, not only as a full-page placeholder.">
      <GrButton size="sm">Invite teammate</GrButton>
    </GrEmptyState>
  </GrCard>
</template>