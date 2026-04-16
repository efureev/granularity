<script setup lang="ts">
import { ref } from 'vue'

import {
  DsBadge,
  DsButton,
  DsDropdownMenu,
  DsDropdownMenuDivider,
  DsDropdownMenuGroup,
  DsDropdownMenuItem,
} from '@feugene/granularity'

const selectedAction = ref('Publish now')
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
    <DsDropdownMenu width="64">
      <template #trigger="{ open }">
        <DsButton>
          {{ open ? 'Hide workspace actions' : 'Workspace actions' }}
        </DsButton>
      </template>

      <DsDropdownMenuGroup title="Publish" :uppercase="false" dividers>
        <DsDropdownMenuItem @click="selectedAction = 'Publish now'">
          Publish now
        </DsDropdownMenuItem>
        <DsDropdownMenuItem @click="selectedAction = 'Schedule for review'">
          Schedule for review
        </DsDropdownMenuItem>
      </DsDropdownMenuGroup>

      <DsDropdownMenuDivider />

      <DsDropdownMenuGroup title="Danger zone" :uppercase="false" dividers>
        <DsDropdownMenuItem variant="danger" @click="selectedAction = 'Delete draft'">
          Delete draft
        </DsDropdownMenuItem>
      </DsDropdownMenuGroup>
    </DsDropdownMenu>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4">
      <div class="text-sm text-[var(--muted-fg)]">
        Selected action
      </div>
      <div class="mt-2 flex items-center gap-3">
        <div class="text-sm font-600 text-[var(--fg)]">
          {{ selectedAction }}
        </div>
        <DsBadge size="sm" tone="primary">
          grouped menu
        </DsBadge>
      </div>
    </div>
  </div>
</template>