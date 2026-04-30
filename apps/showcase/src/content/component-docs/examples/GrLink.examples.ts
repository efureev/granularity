import type { ShowcaseComponentExampleDoc } from '../types'

export const grLinkExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'link-builder',
    title: 'Interactive link constructor',
    description: 'Соберите `GrLink` под ваш сценарий: переключайте tone, underline, size, навигационные атрибуты и сразу смотрите итоговый snippet.',
    status: 'ready',
    previewKey: 'ds-link-builder',
    code: '',
  },
  {
    id: 'link-variants',
    title: 'Variants and underline modes',
    description: 'На витрине важно сравнить `tone`, `underline` и size contract, потому что `GrLink` часто используется как inline action вместо кнопки.',
    status: 'ready',
    previewKey: 'ds-link-variants',
    code: `<script setup lang="ts">
import { GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 text-sm">
    <GrLink href="#" variant="primary" size="md">Primary navigation link</GrLink>
    <GrLink href="#" variant="default" size="md">Default inline action</GrLink>
    <GrLink href="#" variant="muted" underline="always" size="md">Muted persistent underline</GrLink>
    <GrLink href="#" variant="danger" size="md">Destructive secondary action</GrLink>
  </div>
</template>`,
  },
  {
    id: 'link-external',
    title: 'External navigation and inline icon',
    description: 'Показываем `external`-режим и composition с `GrIcon`, чтобы закрепить contract для внешних docs/source links.',
    status: 'ready',
    previewKey: 'ds-link-external',
    code: `<script setup lang="ts">
import { GrIcon, GrLink } from '@feugene/granularity'
</script>

<template>
  <GrLink href="https://example.com/docs/showcase" external size="md">
    Open external documentation
    <GrIcon size="sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
      </svg>
    </GrIcon>
  </GrLink>
</template>`,
  },
  {
    id: 'link-disabled-states',
    title: 'Disabled and muted states',
    description: 'Отдельно показываем disabled/muted сценарии, чтобы было понятно, как `GrLink` деградирует до неинтерактивного inline элемента.',
    status: 'ready',
    previewKey: 'ds-link-disabled-states',
    code: `<script setup lang="ts">
import { GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <GrLink href="#" size="md">Ready link</GrLink>
    <GrLink href="#" disabled size="md">Disabled link</GrLink>
    <GrLink href="#" underline="none" variant="muted" size="md">Muted helper link</GrLink>
  </div>
</template>`,
  },
]
