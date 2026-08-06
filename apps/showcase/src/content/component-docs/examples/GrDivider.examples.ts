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
  {
    id: 'divider-variants',
    title: 'Line style, spacing and explicit length',
    description: '`variant` (`solid`/`dashed`/`dotted`), `thickness` через `--gr-divider-thickness`, `spacing` по шкале пакета и `length` — высота вертикального разделителя там, где flex-родителя нет и растянуться не от чего.',
    status: 'ready',
    previewKey: 'gr-divider-variants',
    code: `<script setup lang="ts">
import { GrDivider } from '@feugene/granularity'
</script>

<template>
  <div class="grid max-w-md gap-4">
    <div class="showcase-demo-text text-sm">solid · dashed · dotted</div>
    <GrDivider />
    <GrDivider variant="dashed" />
    <GrDivider variant="dotted" :thickness="2" />

    <GrDivider label="spacing=md" variant="dashed" spacing="md" />

    <!-- Вне flex-родителя вертикальной линии не от чего растянуться — высоту
         задаёт \`length\`. -->
    <div class="flex items-center gap-1 text-sm">
      <span class="showcase-demo-text">Файл</span>
      <GrDivider orientation="vertical" spacing="sm" :length="20" />
      <span class="showcase-demo-text">Правка</span>
      <GrDivider orientation="vertical" spacing="sm" :length="20" variant="dashed" />
      <span class="showcase-demo-text">Вид</span>
    </div>
  </div>
</template>`,
  },
]
