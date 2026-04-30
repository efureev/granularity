import type { ShowcaseComponentExampleDoc } from '../types'

export const grBadgeWrapExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'badge-wrap-counter',
    title: 'Numeric overlays on buttons and icons',
    description: 'Базовый сценарий объясняет `GrBadgeWrap` как overlay-shell: value живёт поверх trigger и не требует менять сам исходный control.',
    status: 'ready',
    previewKey: 'ds-badge-wrap-counter',
    code: `<script setup lang="ts">
import { GrBadgeWrap, GrButton } from '@feugene/granularity'
</script>

<template>
  <GrBadgeWrap :value="3">
    <GrButton size="sm" variant="outline">Inbox</GrButton>
  </GrBadgeWrap>
</template>`,
  },
  {
    id: 'badge-wrap-dot-status',
    title: 'Dot mode for attention indicators',
    description: 'Когда количество не так важно, как сам факт нового события, `dot`-режим работает лучше и визуально легче.',
    status: 'ready',
    previewKey: 'ds-badge-wrap-dot-status',
    code: `<script setup lang="ts">
import { GrAvatar, GrBadgeWrap } from '@feugene/granularity'
</script>

<template>
  <GrBadgeWrap dot>
    <GrAvatar :size="40">AD</GrAvatar>
  </GrBadgeWrap>
</template>`,
  },
  {
    id: 'badge-wrap-tab-notification',
    title: 'Navigation and tab decorations',
    description: 'Третий сценарий фиксирует slot-based nature компонента: badge overlay можно повесить на tab/button/navigation item без специальных API на стороне child-компонента.',
    status: 'ready',
    previewKey: 'ds-badge-wrap-tab-notification',
    code: `<script setup lang="ts">
import { GrBadgeWrap, GrButton } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <GrBadgeWrap :value="2">
      <GrButton size="sm" variant="ghost-border">Inbox</GrButton>
    </GrBadgeWrap>
    <GrBadgeWrap dot>
      <GrButton size="sm" variant="ghost-border">Deployments</GrButton>
    </GrBadgeWrap>
  </div>
</template>`,
  },
]
