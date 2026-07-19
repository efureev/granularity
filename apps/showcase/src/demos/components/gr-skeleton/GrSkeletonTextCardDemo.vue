<script setup lang="ts">
import { GrCard, GrSkeleton } from '@feugene/granularity'
</script>

<template>
  <GrCard class="grid gap-4 p-4">
    <GrSkeleton width="38%" height="20px" rounded="12px" />
    <div class="grid gap-2">
      <GrSkeleton />
      <GrSkeleton width="92%" />
      <GrSkeleton width="76%" />
    </div>
  </GrCard>
</template>