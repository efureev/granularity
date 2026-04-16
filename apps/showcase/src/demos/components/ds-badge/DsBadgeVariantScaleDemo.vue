<script setup lang="ts">
import { DsBadge } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <DsBadge>Neutral</DsBadge>
      <DsBadge tone="primary">Primary</DsBadge>
      <DsBadge tone="info">Info</DsBadge>
      <DsBadge tone="success">Success</DsBadge>
      <DsBadge tone="warning">Warning</DsBadge>
      <DsBadge tone="danger">Danger</DsBadge>
      <DsBadge tone="slate">Slate</DsBadge>
      <DsBadge tone="azure">Azure</DsBadge>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <DsBadge dark>Neutral</DsBadge>
      <DsBadge tone="primary" dark>Primary</DsBadge>
      <DsBadge tone="info" dark>Info</DsBadge>
      <DsBadge tone="success" dark>Success</DsBadge>
      <DsBadge tone="warning" dark>Warning</DsBadge>
      <DsBadge tone="danger" dark>Danger</DsBadge>
      <DsBadge tone="slate" dark>Slate</DsBadge>
      <DsBadge tone="azure" dark>Azure</DsBadge>
    </div>
  </div>
</template>
