<script setup lang="ts">
import { GrBadge } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <GrBadge size="sm" tone="success" radius="square">sm square</GrBadge>
    <GrBadge size="sm" tone="success" radius="semi">sm semi</GrBadge>
    <GrBadge size="sm" tone="success" radius="round">sm round</GrBadge>

    <GrBadge size="md" tone="warning" radius="square">md square</GrBadge>
    <GrBadge size="md" tone="warning" radius="semi">md semi</GrBadge>
    <GrBadge size="md" tone="warning" radius="round">md round</GrBadge>

    <GrBadge size="lg" tone="info" radius="square">lg square</GrBadge>
    <GrBadge size="lg" tone="info" radius="semi">lg semi</GrBadge>
    <GrBadge size="lg" tone="info" radius="round">lg round</GrBadge>
  </div>
</template>
