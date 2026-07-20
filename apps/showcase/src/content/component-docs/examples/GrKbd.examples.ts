import type { ShowcaseComponentExampleDoc } from '../types'

export const grKbdExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'kbd-basic',
    title: 'Keys and shortcuts',
    description: 'Отображение клавиш и сочетаний через `<kbd>`. Размер — `size="sm" | "md"`.',
    status: 'ready',
    previewKey: 'gr-kbd-basic',
    code: `<script setup lang="ts">
import { GrKbd } from '@feugene/granularity'
</script>

<template>
  <span class="inline-flex items-center gap-1">
    <GrKbd>⌘</GrKbd><GrKbd>K</GrKbd>
  </span>
  <GrKbd size="sm">Esc</GrKbd>
</template>`,
  },
]
