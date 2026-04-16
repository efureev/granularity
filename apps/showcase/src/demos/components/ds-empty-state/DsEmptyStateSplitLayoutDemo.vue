<script setup lang="ts">
import { DsButton, DsCard, DsEmptyState } from '@feugene/granularity'
</script>

<template>
  <DsCard class="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
    <div class="rounded-xl border border-dashed border-[var(--brd)] bg-[var(--muted)] p-4 text-sm text-[var(--muted-fg)]">
      Left rail can keep filters, contextual hints or a compact KPI while the main area uses `DsEmptyState`.
    </div>

    <DsEmptyState title="No team members invited" description="Use empty-state content inside larger layouts, not only as a full-page placeholder.">
      <DsButton size="sm">Invite teammate</DsButton>
    </DsEmptyState>
  </DsCard>
</template>