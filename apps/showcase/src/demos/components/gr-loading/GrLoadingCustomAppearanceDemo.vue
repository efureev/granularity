<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton variant="outline" class="justify-self-start" @click="loading = !loading">
      Toggle custom overlay
    </GrButton>

    <div class="relative min-h-[180px] rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="grid gap-2 text-sm text-[var(--gr-muted-fg)]">
        <div class="font-medium text-[var(--gr-fg)]">Brand migration</div>
        <div>Custom background and a static, tinted spinner adapt the overlay to dense dashboards.</div>
      </div>

      <GrLoading
        v-if="loading"
        text="Preparing migration plan..."
        background="color-mix(in srgb, var(--gr-fg) 78%, transparent)"
        custom-class="rounded-xl"
        spinner-tone="primary"
        :spinner-size="36"
        :animated="false"
      />
    </div>
  </div>
</template>