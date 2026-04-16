<script setup lang="ts">
import { DsBadgeWrap, DsButton } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <DsBadgeWrap :value="2">
        <DsButton size="sm" variant="ghost-border">Inbox</DsButton>
      </DsBadgeWrap>

      <DsBadgeWrap dot>
        <DsButton size="sm" variant="ghost-border">Deployments</DsButton>
      </DsBadgeWrap>

      <DsButton size="sm" variant="ghost-border">Audit log</DsButton>
    </div>

    <div class="text-sm text-[var(--muted-fg)]">
      Because `DsBadgeWrap` is slot-based, it can decorate buttons, tabs, icons or avatars without changing their internals.
    </div>
  </div>
</template>
