<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsEmptyState, DsList, DsListItem } from '@feugene/granularity'

const archived = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div>
      <DsButton size="sm" variant="outline" @click="archived = !archived">
        {{ archived ? 'Show active items' : 'Show empty state' }}
      </DsButton>
    </div>

    <DsList :divided="!archived">
      <template v-if="!archived">
        <DsListItem title="Retention policy" description="Archive old reports after 90 days." />
        <DsListItem title="Export history" description="Keep downloadable exports for 30 days." />
      </template>

      <DsEmptyState
        v-else
        title="No archived presets"
        description="Use undivided mode when the list needs to host a richer placeholder instead of row separators."
      >
        <DsButton size="sm" @click="archived = false">
          Restore examples
        </DsButton>
      </DsEmptyState>
    </DsList>
  </div>
</template>