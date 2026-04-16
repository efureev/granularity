<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsButton, DsEmptyState, DsInput } from '@feugene/granularity'

const query = ref('treasury')

const description = computed(() => {
  return `No saved views match “${query.value}”. Try a broader term or create a new filtered workspace.`
})
</script>

<template>
  <div class="grid gap-3">
    <DsInput v-model="query" placeholder="Search views" />

    <DsEmptyState title="Nothing found" :description="description">
      <div class="flex flex-wrap justify-center gap-2">
        <DsButton size="sm" variant="outline">Clear filter</DsButton>
        <DsButton size="sm">Create view</DsButton>
      </div>
    </DsEmptyState>
  </div>
</template>