<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsDropdown } from '@feugene/granularity'

const lastAction = ref('No action yet')

function select(action: string) {
  lastAction.value = action
}
</script>

<template>
  <div class="grid gap-3">
    <DsDropdown>
      <template #trigger="{ open }">
        <DsButton variant="outline">
          {{ open ? 'Close menu' : 'Open menu' }}
        </DsButton>
      </template>

      <template #content>
        <div class="grid gap-1">
          <button type="button" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--accent)]" @click="select('Preview')">
            Preview
          </button>
          <button type="button" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--accent)]" @click="select('Duplicate')">
            Duplicate
          </button>
          <button type="button" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--accent)]" @click="select('Archive')">
            Archive
          </button>
        </div>
      </template>
    </DsDropdown>

    <DsBadge>
      {{ lastAction }}
    </DsBadge>
  </div>
</template>