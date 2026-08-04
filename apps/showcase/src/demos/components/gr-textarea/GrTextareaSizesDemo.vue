<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput, GrTextarea } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const title = ref('Weekly digest')
const note = ref('Subscribers receive this summary every Monday at 09:00.')
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrFormField label="Title">
        <GrInput v-model="title" :size="size" />
      </GrFormField>

      <GrFormField label="Note">
        <GrTextarea v-model="note" :size="size" :rows="2" />
      </GrFormField>
    </div>
  </div>
</template>
