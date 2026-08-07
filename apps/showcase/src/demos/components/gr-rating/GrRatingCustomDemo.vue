<script setup lang="ts">
import { ref } from 'vue'

import { GrRating } from '@feugene/granularity'

const likes = ref(3)
const difficulty = ref(2)
const size = ref(4)

// Подписи по делениям: диктор читает «4 из 5, хорошо», а не голое число.
const service = ref(4)
const serviceTexts = ['Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']
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
      <span class="text-sm font-medium">Labels per step</span>
      <GrRating
        v-model="service"
        :texts="serviceTexts"
        show-text
        aria-label="Service quality"
      />
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium">Compact read-only (for tables and lists)</span>
      <div class="flex items-center gap-6">
        <GrRating :model-value="3" readonly compact show-text aria-label="Compact rating" />
        <GrRating :model-value="4.5" readonly compact allow-half show-text aria-label="Compact half rating" />
      </div>
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
