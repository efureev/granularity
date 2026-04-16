import type { ShowcaseComponentExampleDoc } from '../types'

export const dsBadgeWrapExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'badge-wrap-counter',
    title: 'Numeric overlays on buttons and icons',
    description: 'Базовый сценарий объясняет `DsBadgeWrap` как overlay-shell: value живёт поверх trigger и не требует менять сам исходный control.',
    status: 'ready',
    previewKey: 'ds-badge-wrap-counter',
    code: `<script setup lang="ts">
import { DsBadgeWrap, DsButton } from '@feugene/granularity'
</script>

<template>
  <DsBadgeWrap :value="3">
    <DsButton size="sm" variant="outline">Inbox</DsButton>
  </DsBadgeWrap>
</template>`,
  },
  {
    id: 'badge-wrap-dot-status',
    title: 'Dot mode for attention indicators',
    description: 'Когда количество не так важно, как сам факт нового события, `dot`-режим работает лучше и визуально легче.',
    status: 'ready',
    previewKey: 'ds-badge-wrap-dot-status',
    code: `<script setup lang="ts">
import { DsAvatar, DsBadgeWrap } from '@feugene/granularity'
</script>

<template>
  <DsBadgeWrap dot>
    <DsAvatar :size="40">AD</DsAvatar>
  </DsBadgeWrap>
</template>`,
  },
  {
    id: 'badge-wrap-tab-notification',
    title: 'Navigation and tab decorations',
    description: 'Третий сценарий фиксирует slot-based nature компонента: badge overlay можно повесить на tab/button/navigation item без специальных API на стороне child-компонента.',
    status: 'ready',
    previewKey: 'ds-badge-wrap-tab-notification',
    code: `<script setup lang="ts">
import { DsBadgeWrap, DsButton } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <DsBadgeWrap :value="2">
      <DsButton size="sm" variant="ghost-border">Inbox</DsButton>
    </DsBadgeWrap>
    <DsBadgeWrap dot>
      <DsButton size="sm" variant="ghost-border">Deployments</DsButton>
    </DsBadgeWrap>
  </div>
</template>`,
  },
]
