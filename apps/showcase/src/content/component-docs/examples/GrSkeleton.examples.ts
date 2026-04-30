import type { ShowcaseComponentExampleDoc } from '../types'

export const grSkeletonExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'skeleton-text-card',
    title: 'Text card placeholder',
    description: 'Базовый loading-surface для статей, карточек и описательных блоков: title + несколько строк контента.',
    status: 'ready',
    previewKey: 'ds-skeleton-text-card',
    code: `<script setup lang="ts">
import { GrCard, GrSkeleton } from '@feugene/granularity'
</script>

<template>
  <GrCard class="grid gap-4">
    <GrSkeleton width="38%" height="20px" rounded="12px" />
    <GrSkeleton />
    <GrSkeleton width="92%" />
    <GrSkeleton width="76%" />
  </GrCard>
</template>`,
  },
  {
    id: 'skeleton-list-placeholder',
    title: 'Avatar/list row placeholders',
    description: 'Data-display сценарий для таблиц и списков: avatar, две текстовые строки и trailing action area.',
    status: 'ready',
    previewKey: 'ds-skeleton-list-placeholder',
    code: `<script setup lang="ts">
import { GrSkeleton } from '@feugene/granularity'

const rows = [1, 2, 3]
</script>

<template>
  <div class="grid gap-3">
    <div v-for="row in rows" :key="row" class="flex items-center gap-3">
      <GrSkeleton width="44px" height="44px" rounded="9999px" />
      <GrSkeleton width="44%" />
    </div>
  </div>
</template>`,
  },
  {
    id: 'skeleton-dashboard-layout',
    title: 'Dashboard and chart layout',
    description: 'Комбинируем разные размеры `GrSkeleton`, чтобы быстро собрать loading-layout для dashboard, chart и KPI blocks.',
    status: 'ready',
    previewKey: 'ds-skeleton-dashboard-layout',
    code: `<script setup lang="ts">
import { GrSkeleton } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
    <GrSkeleton height="160px" rounded="18px" />
    <GrSkeleton v-for="row in 4" :key="row" width="100%" height="12px" rounded="9999px" />
  </div>
</template>`,
  },
]
