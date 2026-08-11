<script setup lang="ts">
import { GrSkeleton } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="grid gap-2">
        <span class="text-xs text-[var(--gr-muted-fg)]">variant="text"</span>
        <GrSkeleton />
      </div>

      <div class="grid gap-2">
        <span class="text-xs text-[var(--gr-muted-fg)]">variant="rect"</span>
        <GrSkeleton variant="rect" height="40px" />
      </div>

      <div class="grid gap-2">
        <span class="text-xs text-[var(--gr-muted-fg)]">variant="circle"</span>
        <GrSkeleton variant="circle" width="40px" />
      </div>
    </div>

    <div class="grid gap-2">
      <span class="text-xs text-[var(--gr-muted-fg)]">:count="4"</span>
      <GrSkeleton :count="4" />
    </div>
  </div>
</template>
