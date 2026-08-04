<script setup lang="ts">
import { GrFileUpload } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrFileUpload :size="size" placeholder="Drag files here or click to select">
        <template #tip>
          PDF or PNG, up to 10 MB
        </template>
      </GrFileUpload>
    </div>
  </div>
</template>
