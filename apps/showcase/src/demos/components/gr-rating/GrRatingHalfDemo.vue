<script setup lang="ts">
import { ref } from 'vue'

import { GrRating } from '@feugene/granularity'

const myScore = ref(3.5)

const reviews = [
  { author: 'Anna K.', score: 5, text: 'Arrived a day earlier than promised.' },
  { author: 'Mark T.', score: 3.5, text: 'Good quality, packaging could be better.' },
  { author: 'Elena P.', score: 4, text: 'Exactly as described.' },
]
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-2">
      <span class="text-sm font-medium">Your rating</span>
      <GrRating
        v-model="myScore"
        allow-half
        clearable
        show-text
        :format-text="(v) => (v ? `${v} / 5` : 'Not rated')"
        aria-label="Your rating"
      />
    </div>

    <ul class="grid gap-3">
      <li v-for="review in reviews" :key="review.author" class="grid gap-1">
        <div class="flex items-center gap-2">
          <GrRating :model-value="review.score" readonly allow-half size="sm" />
          <span class="text-sm font-medium">{{ review.author }}</span>
        </div>
        <p class="text-sm text-[var(--gr-muted-fg)]">
          {{ review.text }}
        </p>
      </li>
    </ul>
  </div>
</template>
