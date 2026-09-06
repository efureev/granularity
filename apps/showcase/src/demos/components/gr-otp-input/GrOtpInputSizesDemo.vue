<script setup lang="ts">
import { ref } from 'vue'

import { GrOtpInput } from '@feugene/granularity'

const values = ref<Record<string, string>>({ xs: '12', sm: '123', md: '1234', lg: '12345' })
</script>

<template>
  <div class="grid gap-4">
    <div
        v-for="size in (['xs', 'sm', 'md', 'lg'] as const)"
        :key="size"
        class="flex items-center gap-4"
    >
      <span class="w-8 text-sm text-[var(--gr-muted-fg)]">{{ size }}</span>
      <GrOtpInput v-model="values[size]" :size :aria-label="`Код, ступень ${size}`" />
    </div>
  </div>
</template>
