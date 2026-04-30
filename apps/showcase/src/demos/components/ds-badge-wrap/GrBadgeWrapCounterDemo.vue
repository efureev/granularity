<script setup lang="ts">
import { GrBadgeWrap, GrButton } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <GrBadgeWrap :value="3">
      <GrButton size="sm" variant="outline">Inbox</GrButton>
    </GrBadgeWrap>

    <GrBadgeWrap :value="12">
      <GrButton size="sm" variant="outline">Approvals</GrButton>
    </GrBadgeWrap>

    <GrBadgeWrap :value="99">
      <GrButton size="sm">Notifications</GrButton>
    </GrBadgeWrap>
  </div>
</template>
