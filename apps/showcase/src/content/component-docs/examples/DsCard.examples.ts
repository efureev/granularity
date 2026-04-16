import type { ShowcaseComponentExampleDoc } from '../types'

export const dsCardExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'card-basic-surface',
    title: 'Basic surface with host-controlled spacing',
    description: 'Показываем главный contract `DsCard`: компонент отвечает за surface/border, а внутренние spacing/layout decisions остаются у страницы через `class`.',
    status: 'ready',
    previewKey: 'ds-card-basic-surface',
    code: `<script setup lang="ts">
import { DsButton, DsCard } from '@feugene/granularity'
</script>

<template>
  <DsCard class="grid gap-4 p-5">
    <div>
      <div class="text-sm font-semibold">Basic card</div>
      <div class="mt-1 text-sm text-[var(--muted-fg)]">Use cards to group related content.</div>
    </div>

    <div class="flex gap-2">
      <DsButton size="sm">Primary action</DsButton>
      <DsButton size="sm" variant="outline">Secondary</DsButton>
    </div>
  </DsCard>
</template>`,
  },
  {
    id: 'card-kpi-grid',
    title: 'Cards as metric tiles',
    description: 'Один из самых частых use-case — KPI/stat tiles, где `DsCard` даёт единый surface для компактных dashboard-блоков.',
    status: 'ready',
    previewKey: 'ds-card-kpi-grid',
    code: `<script setup lang="ts">
import { DsBadge, DsCard } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <DsCard class="grid gap-2 p-4">
      <div class="text-sm text-[var(--muted-fg)]">Error budget</div>
      <div class="text-2xl font-semibold">98.4%</div>
      <DsBadge size="sm" tone="success" radius="semi">Healthy</DsBadge>
    </DsCard>
  </div>
</template>`,
  },
  {
    id: 'card-action-panel',
    title: 'Action panel with badges and CTA group',
    description: 'Документируем composed pattern, где карточка работает контейнером для actions, helper badges и explanatory copy.',
    status: 'ready',
    previewKey: 'ds-card-action-panel',
    code: `<script setup lang="ts">
import { DsBadge, DsButton, DsCard } from '@feugene/granularity'
</script>

<template>
  <DsCard class="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
    <div class="grid gap-2">
      <div class="flex items-center gap-2">
        <div class="text-sm font-semibold">Release checklist</div>
        <DsBadge size="sm" tone="info" radius="semi">2 blockers</DsBadge>
      </div>
      <div class="text-sm text-[var(--muted-fg)]">Cards work well as shells for richer dashboard sections.</div>
    </div>
  </DsCard>
</template>`,
  },
]
