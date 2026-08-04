<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrFormFile } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const file = ref<File | File[] | null>(null)
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrFormField label="Attachment">
        <GrFormFile v-model="file" :size="size" accept=".pdf,.png" />
      </GrFormField>
    </div>
  </div>
</template>
