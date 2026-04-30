<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDropdownMenu, GrDropdownMenuItem } from '@feugene/granularity'

const lastAction = ref('Not selected yet')

const actions = [
  'Duplicate page',
  'Move to archive',
  'Copy public URL',
]
</script>

<template>
  <div class="flex flex-wrap items-start gap-3">
    <GrDropdownMenu align="left" width="60">
      <template #trigger="{ open }">
        <GrButton variant="outline">
          {{ open ? 'Close quick actions' : 'Open quick actions' }}
        </GrButton>
      </template>

      <GrDropdownMenuItem
        v-for="action in actions"
        :key="action"
        @click="lastAction = action"
      >
        {{ action }}
      </GrDropdownMenuItem>
    </GrDropdownMenu>

    <GrBadge tone="neutral">
      Last action: {{ lastAction }}
    </GrBadge>
  </div>
</template>