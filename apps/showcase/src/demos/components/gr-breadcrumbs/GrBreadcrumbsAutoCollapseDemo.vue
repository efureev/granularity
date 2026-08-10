<script setup lang="ts">
import { ref } from 'vue'

import { GrBreadcrumbs, GrSegmented, type GrBreadcrumbItem } from '@feugene/granularity'

const path: GrBreadcrumbItem[] = [
  { label: 'Storage', href: '#/storage' },
  { label: 'Workspaces', href: '#/storage/workspaces' },
  { label: 'Design system', href: '#/storage/workspaces/design-system' },
  { label: 'Releases', href: '#/storage/workspaces/design-system/releases' },
  { label: '0.15.0', href: '#/storage/workspaces/design-system/releases/0-15-0' },
  { label: 'CHANGELOG.md' },
]

// Ширина контейнера, а не окна: схлопывание считается по доступному месту,
// поэтому увидеть его можно не трогая размер браузера.
const width = ref('520')
const widths = [
  { value: '260', label: 'Narrow' },
  { value: '380', label: 'Medium' },
  { value: '520', label: 'Wide' },
]
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented v-model="width" :options="widths" size="sm" class="justify-self-start" />

    <div
      class="rounded-[var(--gr-radius-md)] border border-dashed border-[var(--gr-brd)] p-3"
      :style="{ width: `${width}px`, maxWidth: '100%' }"
    >
      <GrBreadcrumbs :items="path" auto-collapse />
    </div>
  </div>
</template>
