<script setup lang="ts">
import { ref } from 'vue'

import { GR_TONES, GrButton, GrProgressBar, type GrTone } from '@feugene/granularity'

const progress = ref(32)
const tone = ref<GrTone>('primary')

const tones = GR_TONES
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" variant="outline" @click="progress = Math.max(0, progress - 16)">
        -16%
      </GrButton>
      <GrButton size="sm" @click="progress = Math.min(100, progress + 16)">
        +16%
      </GrButton>
    </div>

    <div class="flex flex-wrap gap-2">
      <GrButton
        v-for="item in tones"
        :key="item"
        size="sm"
        variant="outline"
        :tone="item"
        @click="tone = item"
      >
        {{ item }}
      </GrButton>
    </div>

    <div class="grid gap-2">
      <div class="flex items-center justify-between text-sm">
        <span>Verification progress</span>
        <span class="text-[var(--gr-muted-fg)]">{{ progress }}% · {{ tone }}</span>
      </div>
      <GrProgressBar :value="progress" :tone="tone" aria-label="Verification progress" />
    </div>
  </div>
</template>