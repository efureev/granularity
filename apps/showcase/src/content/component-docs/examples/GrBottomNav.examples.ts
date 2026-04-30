import type { ShowcaseComponentExampleDoc } from '../types'

export const grBottomNavExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'bottom-nav-basic-flow',
    title: 'Basic section switcher',
    description: 'Базовый mobile-first сценарий: переключаем top-level разделы и синхронизируем активное состояние с контентом страницы.',
    status: 'ready',
    previewKey: 'ds-bottom-nav-basic-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBottomNav } from '@feugene/granularity'

const currentSection = ref('overview')
const items = [
  { label: 'Overview', value: 'overview' },
  { label: 'Invoices', value: 'invoices' },
  { label: 'Team', value: 'team' },
]
</script>

<template>
  <GrBottomNav v-model="currentSection" :items="items" />
</template>`,
  },
  {
    id: 'bottom-nav-external-state',
    title: 'External state sync',
    description: 'Показываем, что `v-model` у `GrBottomNav` можно менять не только через сам компонент, но и из внешних action-кнопок.',
    status: 'ready',
    previewKey: 'ds-bottom-nav-external-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBottomNav, GrButton } from '@feugene/granularity'

const currentSection = ref('feed')
const items = [
  { label: 'Feed', value: 'feed' },
  { label: 'Tasks', value: 'tasks' },
  { label: 'Profile', value: 'profile' },
]
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <GrButton size="sm" variant="outline" @click="currentSection = 'tasks'">
      Jump to tasks
    </GrButton>
  </div>

  <GrBottomNav v-model="currentSection" :items="items" />
</template>`,
  },
  {
    id: 'bottom-nav-mobile-shell',
    title: 'Mobile shell composition',
    description: 'Сценарий для полноэкранного мобильного shell: контент остаётся на месте, а нижняя навигация фиксируется у safe-area края.',
    status: 'ready',
    previewKey: 'ds-bottom-nav-mobile-shell',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBottomNav } from '@feugene/granularity'

const currentSection = ref('approvals')
const items = [
  { label: 'Approvals', value: 'approvals' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Settings', value: 'settings' },
]
</script>

<template>
  <div class="pb-16">
    <GrBottomNav v-model="currentSection" :items="items" />
  </div>
</template>`,
  },
]
