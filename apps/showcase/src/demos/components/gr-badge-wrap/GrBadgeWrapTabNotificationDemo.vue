<script setup lang="ts">
import { GrBadgeWrap, GrButton } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <GrBadgeWrap :value="2">
        <GrButton size="sm" variant="ghost-border">Inbox</GrButton>
      </GrBadgeWrap>

      <GrBadgeWrap dot>
        <GrButton size="sm" variant="ghost-border">Deployments</GrButton>
      </GrBadgeWrap>

      <GrButton size="sm" variant="ghost-border">Audit log</GrButton>
    </div>

    <div class="text-sm text-[var(--muted-fg)]">
      Because `GrBadgeWrap` is slot-based, it can decorate buttons, tabs, icons or avatars without changing their internals.
    </div>
  </div>
</template>
