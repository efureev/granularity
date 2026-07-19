<script setup lang="ts">
import { ref } from 'vue'

import {
  GrBadge,
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuDivider,
  GrDropdownMenuGroup,
  GrDropdownMenuItem,
} from '@feugene/granularity'

const selectedAction = ref('Publish now')
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
    <GrDropdownMenu width="64">
      <template #trigger="{ open }">
        <GrButton>
          {{ open ? 'Hide workspace actions' : 'Workspace actions' }}
        </GrButton>
      </template>

      <GrDropdownMenuGroup title="Publish" :uppercase="false" dividers>
        <GrDropdownMenuItem @click="selectedAction = 'Publish now'">
          Publish now
        </GrDropdownMenuItem>
        <GrDropdownMenuItem @click="selectedAction = 'Schedule for review'">
          Schedule for review
        </GrDropdownMenuItem>
      </GrDropdownMenuGroup>

      <GrDropdownMenuDivider />

      <GrDropdownMenuGroup title="Danger zone" :uppercase="false" dividers>
        <GrDropdownMenuItem variant="danger" @click="selectedAction = 'Delete draft'">
          Delete draft
        </GrDropdownMenuItem>
      </GrDropdownMenuGroup>
    </GrDropdownMenu>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4">
      <div class="text-sm text-[var(--muted-fg)]">
        Selected action
      </div>
      <div class="mt-2 flex items-center gap-3">
        <div class="text-sm font-600 text-[var(--fg)]">
          {{ selectedAction }}
        </div>
        <GrBadge size="sm" tone="primary">
          grouped menu
        </GrBadge>
      </div>
    </div>
  </div>
</template>