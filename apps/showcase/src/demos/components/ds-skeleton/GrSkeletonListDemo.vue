<script setup lang="ts">
import { GrSkeleton } from '@feugene/granularity'

const rows = [1, 2, 3]
</script>

<template>
  <div class="grid gap-3 rounded-xl border border-[var(--brd)] bg-[var(--card)] p-4">
    <div v-for="row in rows" :key="row" class="flex items-center gap-3">
      <GrSkeleton width="44px" height="44px" rounded="9999px" />
      <div class="min-w-0 flex-1 grid gap-2">
        <GrSkeleton width="44%" />
        <GrSkeleton width="72%" />
      </div>
      <GrSkeleton width="72px" height="28px" rounded="10px" />
    </div>
  </div>
</template>