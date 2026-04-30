<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrNavbar } from '@feugene/granularity'

const notifications = ref(3)
</script>

<template>
  <div class="grid gap-3 rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-3">
    <GrNavbar title="Workspace">
      <GrBadge size="sm" tone="neutral">
        {{ notifications }} updates
      </GrBadge>

      <GrButton size="sm" variant="outline" @click="notifications++">
        Refresh
      </GrButton>
    </GrNavbar>

    <div class="px-4 py-3 text-sm text-[var(--muted-fg)]">
      Action slot works well for global filters, status pills and quick actions in page-level shells.
    </div>
  </div>
</template>