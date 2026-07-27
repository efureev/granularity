<script setup lang="ts">
import { ref } from 'vue'

import { GrRating } from '@feugene/granularity'

const likes = ref(3)
const difficulty = ref(2)
const size = ref(4)
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-2">
      <span class="text-sm font-medium">Custom symbol and tone</span>
      <GrRating
        v-model="likes"
        icon="i-lucide-heart"
        tone="danger"
        aria-label="How much you liked it"
      />
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium">Own colour via CSS variable</span>
      <GrRating
        v-model="difficulty"
        :max="4"
        style="--gr-rating-color: var(--gr-info)"
        aria-label="Difficulty"
      />
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium">Sizes and disabled</span>
      <div class="flex items-center gap-6">
        <GrRating v-model="size" size="sm" aria-label="Small" />
        <GrRating v-model="size" size="md" aria-label="Medium" />
        <GrRating v-model="size" size="lg" aria-label="Large" />
        <GrRating :model-value="2" disabled aria-label="Disabled" />
      </div>
    </div>
  </div>
</template>
