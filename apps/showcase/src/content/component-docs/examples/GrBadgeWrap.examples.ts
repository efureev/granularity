import type { ShowcaseComponentExampleDoc } from '../types'

export const grBadgeWrapExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'badge-wrap-counter',
    title: 'Numeric overlays on buttons and icons',
    description: 'Счётчик живёт поверх любого контрола и не требует менять его самого. `max` сворачивает крупные числа в «99+», `showZero` оставляет ноль на виду, `tone` и `placement` подбирают цвет и угол.',
    status: 'ready',
    previewKey: 'gr-badge-wrap-counter',
    code: `<script setup lang="ts">
import { GrBadgeWrap, GrButton } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <GrBadgeWrap :value="3">
      <GrButton size="sm" variant="outline">Inbox</GrButton>
    </GrBadgeWrap>

    <GrBadgeWrap :value="120" :max="99" tone="primary">
      <GrButton size="sm" variant="outline">Approvals</GrButton>
    </GrBadgeWrap>

    <GrBadgeWrap :value="0" show-zero tone="neutral" placement="bottom-right">
      <GrButton size="sm" variant="outline">Drafts</GrButton>
    </GrBadgeWrap>

    <GrBadgeWrap :value="7" tone="success">
      <GrButton size="sm">Notifications</GrButton>
    </GrBadgeWrap>
  </div>
</template>`,
  },
  {
    id: 'badge-wrap-dot-status',
    title: 'Dot mode for attention indicators',
    description: 'Когда важно не количество, а сам факт нового события, точка работает легче. Она декоративна, пока ей не дали `aria-label` — тогда её слышит и скринридер.',
    status: 'ready',
    previewKey: 'gr-badge-wrap-dot-status',
    code: `<script setup lang="ts">
import { GrAvatar, GrBadgeWrap, GrCard } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <GrBadgeWrap dot aria-label="Unread messages">
      <GrAvatar :size="40">AD</GrAvatar>
    </GrBadgeWrap>

    <GrBadgeWrap dot tone="warning">
      <GrAvatar :size="40" shape="square">QA</GrAvatar>
    </GrBadgeWrap>

    <GrCard class="p-4 text-sm text-[var(--gr-muted-fg)]">
      Dot mode is useful when the exact count is less important than “requires attention now”.
    </GrCard>
  </div>
</template>`,
  },
  {
    id: 'badge-wrap-tab-notification',
    title: 'Navigation and tab decorations',
    description: 'Компонент работает через слот, поэтому счётчик вешается на вкладку, кнопку или пункт навигации без специального API на их стороне.',
    status: 'ready',
    previewKey: 'gr-badge-wrap-tab-notification',
    code: `<script setup lang="ts">
import { GrBadgeWrap, GrButton } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrBadgeWrap :value="2">
        <GrButton size="sm" variant="ghost-border">Inbox</GrButton>
      </GrBadgeWrap>

      <GrBadgeWrap dot>
        <GrButton size="sm" variant="ghost-border">Deployments</GrButton>
      </GrBadgeWrap>

      <GrButton size="sm" variant="ghost-border">Audit log</GrButton>
    </div>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Because \`GrBadgeWrap\` is slot-based, it can decorate buttons, tabs, icons or avatars without changing their internals.
    </div>
  </div>
</template>`,
  },
]
