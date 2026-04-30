import type { ShowcaseComponentExampleDoc } from '../types'

export const grEmptyStateExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'empty-state-primary-action',
    title: 'Primary CTA inside card surface',
    description: 'Классический empty-state с title/description и основной CTA-кнопкой в default slot.',
    status: 'ready',
    previewKey: 'ds-empty-state-primary-action',
    code: `<script setup lang="ts">
import { GrButton, GrEmptyState } from '@feugene/granularity'
</script>

<template>
  <GrEmptyState title="No payouts yet" description="Create the first scheduled payout to start tracking approval and transfer states.">
    <GrButton size="sm">Create payout</GrButton>
  </GrEmptyState>
</template>`,
  },
  {
    id: 'empty-state-search-flow',
    title: 'Search/filter zero-results flow',
    description: 'Data-display сценарий для zero-results: input/filter сверху и действия по сбросу фильтра или созданию нового объекта.',
    status: 'ready',
    previewKey: 'ds-empty-state-search-flow',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrEmptyState, GrInput } from '@feugene/granularity'

const query = ref('treasury')
const description = computed(() => 'No saved views match “' + query.value + '”.')
</script>

<template>
  <div class="grid gap-3">
    <GrInput v-model="query" placeholder="Search views" />
    <GrEmptyState title="Nothing found" :description="description">...</GrEmptyState>
  </div>
</template>`,
  },
  {
    id: 'empty-state-split-layout',
    title: 'Embedded inside split layout',
    description: 'Показываем, что `GrEmptyState` можно использовать не только полноширинно, но и внутри card/layout composition.',
    status: 'ready',
    previewKey: 'ds-empty-state-split-layout',
    code: `<script setup lang="ts">
import { GrButton, GrCard, GrEmptyState } from '@feugene/granularity'
</script>

<template>
  <GrCard class="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
    <GrEmptyState title="No team members invited" description="Use empty-state content inside larger layouts, not only as a full-page placeholder.">
      <GrButton size="sm">Invite teammate</GrButton>
    </GrEmptyState>
  </GrCard>
</template>`,
  },
]
