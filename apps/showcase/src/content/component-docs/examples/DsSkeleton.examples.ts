import type { ShowcaseComponentExampleDoc } from '../types'

export const dsSkeletonExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'skeleton-text-card',
    title: 'Text card placeholder',
    description: 'Базовый loading-surface для статей, карточек и описательных блоков: title + несколько строк контента.',
    status: 'ready',
    previewKey: 'ds-skeleton-text-card',
    code: `<script setup lang="ts">
import { DsCard, DsSkeleton } from '@feugene/granularity'
</script>

<template>
  <DsCard class="grid gap-4">
    <DsSkeleton width="38%" height="20px" rounded="12px" />
    <DsSkeleton />
    <DsSkeleton width="92%" />
    <DsSkeleton width="76%" />
  </DsCard>
</template>`,
  },
  {
    id: 'skeleton-list-placeholder',
    title: 'Avatar/list row placeholders',
    description: 'Data-display сценарий для таблиц и списков: avatar, две текстовые строки и trailing action area.',
    status: 'ready',
    previewKey: 'ds-skeleton-list-placeholder',
    code: `<script setup lang="ts">
import { DsSkeleton } from '@feugene/granularity'

const rows = [1, 2, 3]
</script>

<template>
  <div class="grid gap-3">
    <div v-for="row in rows" :key="row" class="flex items-center gap-3">
      <DsSkeleton width="44px" height="44px" rounded="9999px" />
      <DsSkeleton width="44%" />
    </div>
  </div>
</template>`,
  },
  {
    id: 'skeleton-dashboard-layout',
    title: 'Dashboard and chart layout',
    description: 'Комбинируем разные размеры `DsSkeleton`, чтобы быстро собрать loading-layout для dashboard, chart и KPI blocks.',
    status: 'ready',
    previewKey: 'ds-skeleton-dashboard-layout',
    code: `<script setup lang="ts">
import { DsSkeleton } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
    <DsSkeleton height="160px" rounded="18px" />
    <DsSkeleton v-for="row in 4" :key="row" width="100%" height="12px" rounded="9999px" />
  </div>
</template>`,
  },
]
