<script setup lang="ts">
import { GrSkeleton } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
    <div class="grid gap-3 rounded-xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <GrSkeleton width="26%" height="18px" rounded="12px" />
      <GrSkeleton height="160px" rounded="18px" />
      <div class="grid gap-2 sm:grid-cols-3">
        <GrSkeleton v-for="card in 3" :key="card" height="72px" rounded="16px" />
      </div>
    </div>

    <div class="grid gap-3 rounded-xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <GrSkeleton width="48%" height="18px" rounded="12px" />
      <GrSkeleton v-for="row in 4" :key="row" width="100%" height="12px" rounded="9999px" />
    </div>
  </div>
</template>