import type { ShowcaseComponentExampleDoc } from '../types'

export const dsListExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'list-settings',
    title: 'Settings rows with actions',
    description: 'Базовый data-display сценарий: `DsList` + `DsListItem` собирают preference rows со secondary controls справа.',
    status: 'ready',
    previewKey: 'ds-list-settings',
    code: `<script setup lang="ts">
import { reactive } from 'vue'

import { DsList, DsListItem, DsSwitch } from '@feugene/granularity'

const settings = reactive({ alerts: true })
</script>

<template>
  <DsList>
    <DsListItem title="Realtime alerts" description="Push incidents to the operations inbox.">
      <DsSwitch v-model="settings.alerts" />
    </DsListItem>
  </DsList>
</template>`,
  },
  {
    id: 'list-queue-actions',
    title: 'Queue rows with badges and buttons',
    description: 'Показываем `DsList` как lightweight alternative для job queues и task summaries, где справа нужны badges и compact buttons.',
    status: 'ready',
    previewKey: 'ds-list-queue-actions',
    code: `<script setup lang="ts">
import { DsBadge, DsButton, DsList, DsListItem } from '@feugene/granularity'
</script>

<template>
  <DsList>
    <DsListItem title="Publish release notes" description="Ready for review by marketing">
      <div class="flex items-center gap-2">
        <DsBadge size="sm" tone="secondary">Ready</DsBadge>
        <DsButton size="sm" variant="outline">Open</DsButton>
      </div>
    </DsListItem>
  </DsList>
</template>`,
  },
  {
    id: 'list-empty-state',
    title: 'Empty state and undivided mode',
    description: 'Закрываем special data-display case: `DsList` может хостить richer placeholder/empty state, если отключить row dividers.',
    status: 'ready',
    previewKey: 'ds-list-empty-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsEmptyState, DsList } from '@feugene/granularity'

const archived = ref(false)
</script>

<template>
  <DsList :divided="!archived">
    <DsEmptyState
      v-if="archived"
      title="No archived presets"
      description="Use undivided mode when the list needs to host a richer placeholder."
    >
      <DsButton size="sm" @click="archived = false">Restore examples</DsButton>
    </DsEmptyState>
  </DsList>
</template>`,
  },
]
