<script setup lang="ts">
import { GrSkeleton } from '@feugene/granularity'

const rows = [1, 2, 3]
</script>

<template>
  <div class="grid gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
    <div v-for="row in rows" :key="row" class="flex items-center gap-3">
      <GrSkeleton variant="circle" width="44px" />

      <div class="min-w-0 flex-1 grid gap-2">
        <GrSkeleton width="44%" />
        <GrSkeleton width="72%" />
      </div>

      <GrSkeleton variant="rect" width="72px" height="28px" />
    </div>
  </div>
</template>
