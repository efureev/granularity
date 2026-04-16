<script setup lang="ts">
import { DsBadgeWrap, DsButton } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <DsBadgeWrap :value="3">
      <DsButton size="sm" variant="outline">Inbox</DsButton>
    </DsBadgeWrap>

    <DsBadgeWrap :value="12">
      <DsButton size="sm" variant="outline">Approvals</DsButton>
    </DsBadgeWrap>

    <DsBadgeWrap :value="99">
      <DsButton size="sm">Notifications</DsButton>
    </DsBadgeWrap>
  </div>
</template>
