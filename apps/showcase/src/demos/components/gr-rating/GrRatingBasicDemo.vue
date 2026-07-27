<script setup lang="ts">
import { ref } from 'vue'

import { GrRating } from '@feugene/granularity'

const score = ref(4)
</script>

<template>
  <div class="grid gap-4">
    <GrRating v-model="score" show-text aria-label="Rate the delivery" />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Score: <code>{{ score }}</code> — click a star, or use arrow keys, Home / End.
    </p>
  </div>
</template>
