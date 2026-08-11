<script setup lang="ts">
import { GrCard, GrSkeleton } from '@feugene/granularity'
</script>

<template>
  <GrCard class="grid gap-4 p-4">
    <GrSkeleton variant="rect" width="38%" height="20px" />

    <!-- Три строки одним пропом: последняя короче, поэтому блок читается абзацем. -->
    <GrSkeleton :count="3" />
  </GrCard>
</template>
