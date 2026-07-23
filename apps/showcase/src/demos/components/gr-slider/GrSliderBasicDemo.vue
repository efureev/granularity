<script setup lang="ts">
import { ref } from 'vue'

import { GrSlider } from '@feugene/granularity'

const volume = ref(40)
</script>

<template>
  <div class="grid gap-4">
    <GrSlider
      v-model="volume"
      :min="0"
      :max="100"
      show-tooltip
      :format-tooltip="(v) => `${v}%`"
      aria-label="Volume"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Value: <code>{{ volume }}</code> — drag the thumb or use arrow keys, Home / End, PageUp / PageDown.
    </p>
  </div>
</template>
