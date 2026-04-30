import type { ShowcaseComponentExampleDoc } from '../types'

export const grBadgeExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'badge-builder',
    title: 'Interactive badge constructor',
    description: 'Соберите `GrBadge` под ваш сценарий: переключайте `tone`, `size`, `radius`, filled-mode и текст лейбла, сразу видя итоговый snippet.',
    status: 'ready',
    previewKey: 'ds-badge-builder',
    code: '',
  },
  {
    id: 'badge-tone-scale',
    title: 'Light and dark semantic tones',
    description: 'Сценарий работает как справочник по semantic palette: light и filled (`dark`) режимы удобно сравнить бок о бок, включая `slate` и `azure`.',
    status: 'ready',
    previewKey: 'ds-badge-variant-scale',
    code: `<script setup lang="ts">
import { GrBadge } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <GrBadge>Neutral</GrBadge>
    <GrBadge tone="primary">Primary</GrBadge>
    <GrBadge tone="info">Info</GrBadge>
    <GrBadge tone="success">Success</GrBadge>
    <GrBadge tone="warning">Warning</GrBadge>
    <GrBadge tone="danger">Danger</GrBadge>
    <GrBadge tone="slate">Slate</GrBadge>
    <GrBadge tone="azure">Azure</GrBadge>
  </div>
</template>`,
  },
  {
    id: 'badge-size-radius',
    title: 'Size and radius combinations',
    description: 'Отдельно выделяем `size` и `radius`, чтобы quickly show pill/semi/square badges для table cells, filters и inline labels.',
    status: 'ready',
    previewKey: 'ds-badge-size-radius',
    code: `<script setup lang="ts">
import { GrBadge } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <GrBadge size="sm" tone="success" radius="square">sm square</GrBadge>
    <GrBadge size="md" tone="warning" radius="semi">md semi</GrBadge>
    <GrBadge size="lg" tone="info" radius="round">lg round</GrBadge>
  </div>
</template>`,
  },
  {
    id: 'badge-toolbar-filters',
    title: 'Badges inside action toolbars',
    description: 'Компонент часто используется не сам по себе, а как secondary marker внутри toolbar/filter buttons. Этот сценарий показывает composition-паттерн.',
    status: 'ready',
    previewKey: 'ds-badge-toolbar-filters',
    code: `<script setup lang="ts">
import { GrBadge, GrButton, GrButtonGroup } from '@feugene/granularity'
</script>

<template>
  <GrButtonGroup aria-label="Filter pipelines">
    <GrButton variant="outline">
      Failed
      <GrBadge class="ml-2" size="sm" radius="semi" dark>3</GrBadge>
    </GrButton>
    <GrButton variant="outline">
      Needs review
      <GrBadge class="ml-2" size="sm" tone="warning" radius="semi">7</GrBadge>
    </GrButton>
  </GrButtonGroup>
</template>`,
  },
]
