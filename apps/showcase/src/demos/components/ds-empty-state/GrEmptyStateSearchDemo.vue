<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrEmptyState, GrInput } from '@feugene/granularity'

const query = ref('treasury')

const description = computed(() => {
  return `No saved views match “${query.value}”. Try a broader term or create a new filtered workspace.`
})
</script>

<template>
  <div class="grid gap-3">
    <GrInput v-model="query" placeholder="Search views" />

    <GrEmptyState title="Nothing found" :description="description">
      <div class="flex flex-wrap justify-center gap-2">
        <GrButton size="sm" variant="outline">Clear filter</GrButton>
        <GrButton size="sm">Create view</GrButton>
      </div>
    </GrEmptyState>
  </div>
</template>