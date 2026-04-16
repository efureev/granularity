import type { ShowcaseComponentExampleDoc } from '../types'

export const dsEmptyStateExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'empty-state-primary-action',
    title: 'Primary CTA inside card surface',
    description: 'Классический empty-state с title/description и основной CTA-кнопкой в default slot.',
    status: 'ready',
    previewKey: 'ds-empty-state-primary-action',
    code: `<script setup lang="ts">
import { DsButton, DsEmptyState } from '@feugene/granularity'
</script>

<template>
  <DsEmptyState title="No payouts yet" description="Create the first scheduled payout to start tracking approval and transfer states.">
    <DsButton size="sm">Create payout</DsButton>
  </DsEmptyState>
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

import { DsButton, DsEmptyState, DsInput } from '@feugene/granularity'

const query = ref('treasury')
const description = computed(() => 'No saved views match “' + query.value + '”.')
</script>

<template>
  <div class="grid gap-3">
    <DsInput v-model="query" placeholder="Search views" />
    <DsEmptyState title="Nothing found" :description="description">...</DsEmptyState>
  </div>
</template>`,
  },
  {
    id: 'empty-state-split-layout',
    title: 'Embedded inside split layout',
    description: 'Показываем, что `DsEmptyState` можно использовать не только полноширинно, но и внутри card/layout composition.',
    status: 'ready',
    previewKey: 'ds-empty-state-split-layout',
    code: `<script setup lang="ts">
import { DsButton, DsCard, DsEmptyState } from '@feugene/granularity'
</script>

<template>
  <DsCard class="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
    <DsEmptyState title="No team members invited" description="Use empty-state content inside larger layouts, not only as a full-page placeholder.">
      <DsButton size="sm">Invite teammate</DsButton>
    </DsEmptyState>
  </DsCard>
</template>`,
  },
]
