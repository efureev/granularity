<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsDropdownMenu, DsDropdownMenuItem } from '@feugene/granularity'

const lastAction = ref('Not selected yet')

const actions = [
  'Duplicate page',
  'Move to archive',
  'Copy public URL',
]
</script>

<template>
  <div class="flex flex-wrap items-start gap-3">
    <DsDropdownMenu align="left" width="60">
      <template #trigger="{ open }">
        <DsButton variant="outline">
          {{ open ? 'Close quick actions' : 'Open quick actions' }}
        </DsButton>
      </template>

      <DsDropdownMenuItem
        v-for="action in actions"
        :key="action"
        @click="lastAction = action"
      >
        {{ action }}
      </DsDropdownMenuItem>
    </DsDropdownMenu>

    <DsBadge tone="neutral">
      Last action: {{ lastAction }}
    </DsBadge>
  </div>
</template>