<script setup lang="ts">
import { GrBadge } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <GrBadge>Neutral</GrBadge>
      <GrBadge tone="primary">Primary</GrBadge>
      <GrBadge tone="info">Info</GrBadge>
      <GrBadge tone="success">Success</GrBadge>
      <GrBadge tone="warning">Warning</GrBadge>
      <GrBadge tone="danger">Danger</GrBadge>
      <GrBadge tone="slate">Slate</GrBadge>
      <GrBadge tone="azure">Azure</GrBadge>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <GrBadge dark>Neutral</GrBadge>
      <GrBadge tone="primary" dark>Primary</GrBadge>
      <GrBadge tone="info" dark>Info</GrBadge>
      <GrBadge tone="success" dark>Success</GrBadge>
      <GrBadge tone="warning" dark>Warning</GrBadge>
      <GrBadge tone="danger" dark>Danger</GrBadge>
      <GrBadge tone="slate" dark>Slate</GrBadge>
      <GrBadge tone="azure" dark>Azure</GrBadge>
    </div>
  </div>
</template>
