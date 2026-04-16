import type { ShowcaseComponentExampleDoc } from '../types'

export const dsLinkExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'link-builder',
    title: 'Interactive link constructor',
    description: 'Соберите `DsLink` под ваш сценарий: переключайте tone, underline, size, навигационные атрибуты и сразу смотрите итоговый snippet.',
    status: 'ready',
    previewKey: 'ds-link-builder',
    code: '',
  },
  {
    id: 'link-variants',
    title: 'Variants and underline modes',
    description: 'На витрине важно сравнить `tone`, `underline` и size contract, потому что `DsLink` часто используется как inline action вместо кнопки.',
    status: 'ready',
    previewKey: 'ds-link-variants',
    code: `<script setup lang="ts">
import { DsLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 text-sm">
    <DsLink href="#" variant="primary" size="md">Primary navigation link</DsLink>
    <DsLink href="#" variant="default" size="md">Default inline action</DsLink>
    <DsLink href="#" variant="muted" underline="always" size="md">Muted persistent underline</DsLink>
    <DsLink href="#" variant="danger" size="md">Destructive secondary action</DsLink>
  </div>
</template>`,
  },
  {
    id: 'link-external',
    title: 'External navigation and inline icon',
    description: 'Показываем `external`-режим и composition с `DsIcon`, чтобы закрепить contract для внешних docs/source links.',
    status: 'ready',
    previewKey: 'ds-link-external',
    code: `<script setup lang="ts">
import { DsIcon, DsLink } from '@feugene/granularity'
</script>

<template>
  <DsLink href="https://example.com/docs/showcase" external size="md">
    Open external documentation
    <DsIcon size="sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
      </svg>
    </DsIcon>
  </DsLink>
</template>`,
  },
  {
    id: 'link-disabled-states',
    title: 'Disabled and muted states',
    description: 'Отдельно показываем disabled/muted сценарии, чтобы было понятно, как `DsLink` деградирует до неинтерактивного inline элемента.',
    status: 'ready',
    previewKey: 'ds-link-disabled-states',
    code: `<script setup lang="ts">
import { DsLink } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <DsLink href="#" size="md">Ready link</DsLink>
    <DsLink href="#" disabled size="md">Disabled link</DsLink>
    <DsLink href="#" underline="none" variant="muted" size="md">Muted helper link</DsLink>
  </div>
</template>`,
  },
]
