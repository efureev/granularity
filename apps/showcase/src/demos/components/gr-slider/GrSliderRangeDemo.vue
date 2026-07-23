<script setup lang="ts">
import { ref } from 'vue'

import { GrSlider } from '@feugene/granularity'

const price = ref<[number, number]>([200, 700])
</script>

<template>
  <div class="grid gap-4">
    <GrSlider
      v-model="price"
      range
      :min="0"
      :max="1000"
      :step="50"
      show-tooltip="always"
      :format-tooltip="(v) => `$${v}`"
      aria-label="Price range"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      From <code>${{ price[0] }}</code> to <code>${{ price[1] }}</code> — two thumbs that never cross.
    </p>
  </div>
</template>
