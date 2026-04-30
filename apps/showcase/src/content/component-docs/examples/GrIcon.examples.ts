import type { ShowcaseComponentExampleDoc } from '../types'

export const grIconExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'icon-size-scale',
    title: 'Size scale',
    description: 'На странице важно показать, как `GrIcon` ведёт себя на разных размерах и почему он удобен как sizing-wrapper вокруг inline svg.',
    status: 'ready',
    previewKey: 'ds-icon-size-scale',
    code: `<script setup lang="ts">
import { GrIcon } from '@feugene/granularity'

const sizes = [12, 16, 20, 28, 36]
</script>

<template>
  <div class="flex flex-wrap items-end gap-5">
    <GrIcon v-for="size in sizes" :key="size" :size="size">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
        <circle cx="12" cy="12" r="8" />
      </svg>
    </GrIcon>
  </div>
</template>`,
  },
  {
    id: 'icon-inline-copy',
    title: 'Inline copy and link helpers',
    description: 'Показываем, что `GrIcon` можно встраивать в copy blocks, helper rows и рядом с `GrLink`, не ломая baseline текста.',
    status: 'ready',
    previewKey: 'ds-icon-inline-copy',
    code: `<script setup lang="ts">
import { GrIcon, GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-start gap-3">
      <GrIcon size="md">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
          <path d="M4 12h16" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </GrIcon>
      <span class="text-sm">Sync billing status every 5 minutes</span>
    </div>

    <GrLink href="https://example.com" external>
      Explore icon usage inside inline content
    </GrLink>
  </div>
</template>`,
  },
  {
    id: 'icon-status-card',
    title: 'Status cards and KPI tiles',
    description: 'Отдельный сценарий для dashboards: `GrIcon` помогает собирать status cards и KPI summaries с предсказуемым tone/size contract.',
    status: 'ready',
    previewKey: 'ds-icon-status-card',
    code: `<script setup lang="ts">
import { GrBadge, GrCard, GrIcon } from '@feugene/granularity'
</script>

<template>
  <GrCard class="p-4">
    <div class="flex items-center justify-between gap-3">
      <GrIcon size="lg" class="text-emerald-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
          <circle cx="12" cy="12" r="8" />
          <path d="m9.5 12 1.7 1.8 3.5-4.1" />
        </svg>
      </GrIcon>
      <GrBadge size="sm" tone="secondary">snapshot</GrBadge>
    </div>
  </GrCard>
</template>`,
  },
]
