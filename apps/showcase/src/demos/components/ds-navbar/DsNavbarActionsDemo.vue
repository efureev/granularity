<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsButton, DsNavbar } from '@feugene/granularity'

const notifications = ref(3)
</script>

<template>
  <div class="grid gap-3 rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-3">
    <DsNavbar title="Workspace">
      <DsBadge size="sm" tone="neutral">
        {{ notifications }} updates
      </DsBadge>

      <DsButton size="sm" variant="outline" @click="notifications++">
        Refresh
      </DsButton>
    </DsNavbar>

    <div class="px-4 py-3 text-sm text-[var(--muted-fg)]">
      Action slot works well for global filters, status pills and quick actions in page-level shells.
    </div>
  </div>
</template>