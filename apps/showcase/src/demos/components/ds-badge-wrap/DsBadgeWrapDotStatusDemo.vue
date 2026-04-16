<script setup lang="ts">
import { DsAvatar, DsBadgeWrap, DsCard } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <DsBadgeWrap dot>
      <DsAvatar :size="40">AD</DsAvatar>
    </DsBadgeWrap>

    <DsBadgeWrap dot>
      <DsAvatar :size="40" shape="square">QA</DsAvatar>
    </DsBadgeWrap>

    <DsCard class="p-4 text-sm text-[var(--muted-fg)]">
      Dot mode is useful when the exact count is less important than “requires attention now”.
    </DsCard>
  </div>
</template>
