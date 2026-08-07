import type { ShowcaseComponentExampleDoc } from '../types'

export const grEmptyStateExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'empty-state-primary-action',
    title: 'Primary CTA inside card surface',
    description: 'Классический сценарий: иконка, заголовок-heading, описание и основное действие в слоте по умолчанию.',
    status: 'ready',
    previewKey: 'gr-empty-state-primary-action',
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
    description: 'Ноль результатов поиска: фильтр сверху, компактный `size="sm"` и действия по сбросу или созданию объекта.',
    status: 'ready',
    previewKey: 'gr-empty-state-search-flow',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrEmptyState, GrInput } from '@feugene/granularity'

const query = ref('treasury')

const description = computed(() => {
  return \`No saved views match “\${query.value}”. Try a broader term or create a new filtered workspace.\`
})
</script>

<template>
  <div class="grid gap-3">
    <GrInput v-model="query" placeholder="Search views" />

    <GrEmptyState size="sm" title="Nothing found" :description="description">
      <div class="flex flex-wrap justify-center gap-2">
        <GrButton size="sm" variant="outline">Clear filter</GrButton>
        <GrButton size="sm">Create view</GrButton>
      </div>
    </GrEmptyState>
  </div>
</template>`,
  },
  {
    id: 'empty-state-split-layout',
    title: 'Embedded inside split layout',
    description: '`variant="ghost"` внутри уже существующей карточки: без него получалась карточка в карточке со второй рамкой.',
    status: 'ready',
    previewKey: 'gr-empty-state-split-layout',
    code: `<script setup lang="ts">
import { GrButton, GrCard, GrEmptyState } from '@feugene/granularity'
</script>

<template>
  <GrCard class="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
    <div class="rounded-xl border border-dashed border-[var(--gr-brd)] bg-[var(--gr-muted)] p-4 text-sm text-[var(--gr-muted-fg)]">
      Left rail can keep filters, contextual hints or a compact KPI while the main area uses \`GrEmptyState\`.
    </div>

    <GrEmptyState variant="ghost" title="No team members invited" description="Inside an existing card the ghost variant drops the second border around the same surface.">
      <GrButton size="sm">Invite teammate</GrButton>
    </GrEmptyState>
  </GrCard>
</template>`,
  },
]
