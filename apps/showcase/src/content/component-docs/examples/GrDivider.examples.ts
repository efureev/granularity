import type { ShowcaseComponentExampleDoc } from '../types'

export const grDividerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'divider-basic',
    title: 'Horizontal, labeled and vertical',
    description: 'Простая линия (`<hr>`), линия с меткой (`label` + `align`) и вертикальный разделитель (`orientation="vertical"`).',
    status: 'ready',
    previewKey: 'gr-divider-basic',
    code: `<script setup lang="ts">
import { GrDivider } from '@feugene/granularity'
</script>

<template>
  <GrDivider />
  <GrDivider label="OR" />
  <GrDivider label="Left aligned" align="start" />

  <div class="flex items-center gap-3">
    <span>Inline</span>
    <GrDivider orientation="vertical" class="h-5" />
    <span>vertical divider</span>
  </div>
</template>`,
  },
]
