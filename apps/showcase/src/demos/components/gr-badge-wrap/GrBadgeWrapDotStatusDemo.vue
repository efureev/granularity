<script setup lang="ts">
import { GrAvatar, GrBadgeWrap, GrCard } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <GrBadgeWrap dot>
      <GrAvatar :size="40">AD</GrAvatar>
    </GrBadgeWrap>

    <GrBadgeWrap dot>
      <GrAvatar :size="40" shape="square">QA</GrAvatar>
    </GrBadgeWrap>

    <GrCard class="p-4 text-sm text-[var(--muted-fg)]">
      Dot mode is useful when the exact count is less important than “requires attention now”.
    </GrCard>
  </div>
</template>
