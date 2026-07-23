<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="loading = !loading">
      {{ loading ? 'Hide' : 'Show' }} inline loading
    </GrButton>

    <div class="relative min-h-[180px] rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="grid gap-2 text-sm text-[var(--gr-muted-fg)]">
        <div class="font-medium text-[var(--gr-fg)]">Invoice list</div>
        <div>Use `GrLoading` as an overlay above an existing card or section while async data is refreshing.</div>
      </div>

      <GrLoading v-if="loading" text="Refreshing rows..." />
    </div>
  </div>
</template>