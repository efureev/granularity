<script setup lang="ts">
import {GrCard, GrBadge, GrButton} from "@feugene/granularity";
</script>
<template>
  <GrCard class="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
    <div class="grid gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <div class="text-sm font-semibold text-[var(--fg)]">Release checklist</div>
        <GrBadge size="sm" tone="info" radius="semi">2 blockers</GrBadge>
      </div>

      <div class="text-sm text-[var(--muted-fg)]">
        Cards are often the shell for richer compositions: lists, actions, helper badges and any spacing utilities
        passed via `class`.
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" variant="outline">Open runbook</GrButton>
      <GrButton size="sm">Resolve blockers</GrButton>
    </div>
  </GrCard>
</template>
