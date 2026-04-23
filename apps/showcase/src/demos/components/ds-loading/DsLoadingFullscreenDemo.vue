<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsLoading } from '@feugene/granularity'

const loading = ref(false)

function runFullscreenSync() {
  loading.value = true

  window.setTimeout(() => {
    loading.value = false
  }, 1400)
}
</script>

<template>
  <div class="grid gap-3">
    <DsButton class="justify-self-start" @click="runFullscreenSync">
      Simulate global sync
    </DsButton>

    <div class="text-xs text-[var(--muted-fg)]">
      Fullscreen overlay closes automatically after a short async cycle.
    </div>

    <DsLoading v-if="loading" fullscreen text="Syncing workspace data..." style="--muted-fg: white;" />
  </div>
</template>