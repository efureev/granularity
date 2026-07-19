<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrEmptyState, GrList, GrListItem } from '@feugene/granularity'

const archived = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div>
      <GrButton size="sm" variant="outline" @click="archived = !archived">
        {{ archived ? 'Show active items' : 'Show empty state' }}
      </GrButton>
    </div>

    <GrList :divided="!archived">
      <template v-if="!archived">
        <GrListItem title="Retention policy" description="Archive old reports after 90 days." />
        <GrListItem title="Export history" description="Keep downloadable exports for 30 days." />
      </template>

      <GrEmptyState
        v-else
        title="No archived presets"
        description="Use undivided mode when the list needs to host a richer placeholder instead of row separators."
      >
        <GrButton size="sm" @click="archived = false">
          Restore examples
        </GrButton>
      </GrEmptyState>
    </GrList>
  </div>
</template>