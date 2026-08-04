<script setup lang="ts">
import { GrTree } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const data = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'components', label: 'components' },
      { id: 'composables', label: 'composables' },
    ],
  },
]
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrTree :data="data" :size="size" :default-expanded-keys="['src']" />
    </div>
  </div>
</template>
