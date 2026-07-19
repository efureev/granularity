<script setup lang="ts">
import { GrButton, GrEmptyState } from '@feugene/granularity'
</script>

<template>
  <GrEmptyState title="No payouts yet" description="Create the first scheduled payout to start tracking approval and transfer states.">
    <GrButton size="sm">Create payout</GrButton>
  </GrEmptyState>
</template>