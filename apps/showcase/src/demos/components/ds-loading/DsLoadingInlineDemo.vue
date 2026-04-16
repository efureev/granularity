<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <DsButton class="justify-self-start" @click="loading = !loading">
      {{ loading ? 'Hide' : 'Show' }} inline loading
    </DsButton>

    <div class="relative min-h-[180px] rounded-xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="grid gap-2 text-sm text-[var(--muted-fg)]">
        <div class="font-medium text-[var(--fg)]">Invoice list</div>
        <div>Use `DsLoading` as an overlay above an existing card or section while async data is refreshing.</div>
      </div>

      <DsLoading v-if="loading" text="Refreshing rows..." />
    </div>
  </div>
</template>