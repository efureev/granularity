<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <DsButton variant="outline" class="justify-self-start" @click="loading = !loading">
      Toggle custom overlay
    </DsButton>

    <div class="relative min-h-[180px] rounded-xl border border-[var(--brd)] bg-[var(--card)] p-4">
      <div class="grid gap-2 text-sm text-[var(--muted-fg)]">
        <div class="font-medium text-[var(--fg)]">Brand migration</div>
        <div>Custom background, z-index and static spinner help adapt the overlay to dense dashboards.</div>
      </div>

      <DsLoading
        v-if="loading"
        text="Preparing migration plan..."
        background="color-mix(in srgb, var(--fg) 78%, transparent)"
        spinner-class="text-[var(--bg)] h-8 w-8"
        custom-class="rounded-xl"
        :animated="false"
        :z-index="20"
      />
    </div>
  </div>
</template>