<script setup lang="ts">
import { GrBadgeWrap, GrButton } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <GrBadgeWrap :value="3">
      <GrButton size="sm" variant="outline">Inbox</GrButton>
    </GrBadgeWrap>

    <GrBadgeWrap :value="120" :max="99" tone="primary">
      <GrButton size="sm" variant="outline">Approvals</GrButton>
    </GrBadgeWrap>

    <GrBadgeWrap :value="0" show-zero tone="neutral" placement="bottom-right">
      <GrButton size="sm" variant="outline">Drafts</GrButton>
    </GrBadgeWrap>

    <GrBadgeWrap :value="7" tone="success">
      <GrButton size="sm">Notifications</GrButton>
    </GrBadgeWrap>
  </div>
</template>
