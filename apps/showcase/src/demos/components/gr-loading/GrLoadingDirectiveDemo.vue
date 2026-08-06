<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrInput, vLoading } from '@feugene/granularity'

const loading = ref(false)
const name = ref('Alan Turing')

function save() {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" :disabled="loading" @click="save">
      Save profile
    </GrButton>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      While the overlay is up, the form below is `inert`: Tab skips it and screen readers ignore it.
      The container itself reports `aria-busy`.
    </div>

    <div
      v-loading="{ loading, text: 'Saving profile...', delay: 150 }"
      class="rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4"
    >
      <div class="grid gap-3">
        <GrInput v-model="name" aria-label="Full name" />
        <GrButton variant="outline" class="justify-self-start">
          Reset
        </GrButton>
      </div>
    </div>
  </div>
</template>
