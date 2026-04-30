<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

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
    <GrButton class="justify-self-start" @click="runFullscreenSync">
      Simulate global sync
    </GrButton>

    <div class="text-xs text-[var(--muted-fg)]">
      Fullscreen overlay closes automatically after a short async cycle.
    </div>

    <GrLoading v-if="loading" fullscreen text="Syncing workspace data..." style="--muted-fg: white;" />
  </div>
</template>