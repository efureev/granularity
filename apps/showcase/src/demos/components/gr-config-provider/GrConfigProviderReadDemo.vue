<script setup lang="ts">
import { GrConfigProvider } from '@feugene/granularity'

import ConfigReader from './ConfigReader.vue'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Inside a provider
      </div>
      <GrConfigProvider
        size="lg"
        :z-index-base="2000"
        :component-defaults="{ GrButton: { variant: 'secondary' } }"
      >
        <ConfigReader />
      </GrConfigProvider>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        No provider (fallbacks)
      </div>
      <ConfigReader />
    </div>
  </div>
</template>
