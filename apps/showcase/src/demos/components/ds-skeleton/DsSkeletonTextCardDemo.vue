<script setup lang="ts">
import { DsCard, DsSkeleton } from '@feugene/granularity'
</script>

<template>
  <DsCard class="grid gap-4">
    <DsSkeleton width="38%" height="20px" rounded="12px" />
    <div class="grid gap-2">
      <DsSkeleton />
      <DsSkeleton width="92%" />
      <DsSkeleton width="76%" />
    </div>
  </DsCard>
</template>