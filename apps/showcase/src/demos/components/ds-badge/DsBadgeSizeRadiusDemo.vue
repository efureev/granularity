<script setup lang="ts">
import { DsBadge } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <DsBadge size="sm" tone="success" radius="square">sm square</DsBadge>
    <DsBadge size="sm" tone="success" radius="semi">sm semi</DsBadge>
    <DsBadge size="sm" tone="success" radius="round">sm round</DsBadge>

    <DsBadge size="md" tone="warning" radius="square">md square</DsBadge>
    <DsBadge size="md" tone="warning" radius="semi">md semi</DsBadge>
    <DsBadge size="md" tone="warning" radius="round">md round</DsBadge>

    <DsBadge size="lg" tone="info" radius="square">lg square</DsBadge>
    <DsBadge size="lg" tone="info" radius="semi">lg semi</DsBadge>
    <DsBadge size="lg" tone="info" radius="round">lg round</DsBadge>
  </div>
</template>
