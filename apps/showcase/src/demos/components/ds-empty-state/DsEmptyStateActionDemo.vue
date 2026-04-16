<script setup lang="ts">
import { DsButton, DsEmptyState } from '@feugene/granularity'
</script>

<template>
  <DsEmptyState title="No payouts yet" description="Create the first scheduled payout to start tracking approval and transfer states.">
    <DsButton size="sm">Create payout</DsButton>
  </DsEmptyState>
</template>