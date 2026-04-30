import type { ShowcaseComponentExampleDoc } from '../types'

export const grListExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'list-settings',
    title: 'Settings rows with actions',
    description: 'Базовый data-display сценарий: `GrList` + `GrListItem` собирают preference rows со secondary controls справа.',
    status: 'ready',
    previewKey: 'ds-list-settings',
    code: `<script setup lang="ts">
import { reactive } from 'vue'

import { GrList, GrListItem, GrSwitch } from '@feugene/granularity'

const settings = reactive({ alerts: true })
</script>

<template>
  <GrList>
    <GrListItem title="Realtime alerts" description="Push incidents to the operations inbox.">
      <GrSwitch v-model="settings.alerts" />
    </GrListItem>
  </GrList>
</template>`,
  },
  {
    id: 'list-queue-actions',
    title: 'Queue rows with badges and buttons',
    description: 'Показываем `GrList` как lightweight alternative для job queues и task summaries, где справа нужны badges и compact buttons.',
    status: 'ready',
    previewKey: 'ds-list-queue-actions',
    code: `<script setup lang="ts">
import { GrBadge, GrButton, GrList, GrListItem } from '@feugene/granularity'
</script>

<template>
  <GrList>
    <GrListItem title="Publish release notes" description="Ready for review by marketing">
      <div class="flex items-center gap-2">
        <GrBadge size="sm" tone="secondary">Ready</GrBadge>
        <GrButton size="sm" variant="outline">Open</GrButton>
      </div>
    </GrListItem>
  </GrList>
</template>`,
  },
  {
    id: 'list-empty-state',
    title: 'Empty state and undivided mode',
    description: 'Закрываем special data-display case: `GrList` может хостить richer placeholder/empty state, если отключить row dividers.',
    status: 'ready',
    previewKey: 'ds-list-empty-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrEmptyState, GrList } from '@feugene/granularity'

const archived = ref(false)
</script>

<template>
  <GrList :divided="!archived">
    <GrEmptyState
      v-if="archived"
      title="No archived presets"
      description="Use undivided mode when the list needs to host a richer placeholder."
    >
      <GrButton size="sm" @click="archived = false">Restore examples</GrButton>
    </GrEmptyState>
  </GrList>
</template>`,
  },
]
