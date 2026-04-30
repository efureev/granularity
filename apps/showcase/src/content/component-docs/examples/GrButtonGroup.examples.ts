import type { ShowcaseComponentExampleDoc } from '../types'

export const grButtonGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'button-group-segmented',
    title: 'Segmented view switcher',
    description: 'Базовый composition-сценарий: `GrButtonGroup` собирает несколько adjacent actions в единый segmented control для view-mode и similar state switches.',
    status: 'ready',
    previewKey: 'ds-button-group-segmented',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrButtonGroup } from '@feugene/granularity'

const currentView = ref('board')
</script>

<template>
  <GrButtonGroup aria-label="View switcher">
    <GrButton :variant="currentView === 'board' ? 'primary' : 'outline'" @click="currentView = 'board'">
      Board
    </GrButton>
    <GrButton :variant="currentView === 'list' ? 'primary' : 'outline'" @click="currentView = 'list'">
      List
    </GrButton>
    <GrButton :variant="currentView === 'calendar' ? 'primary' : 'outline'" @click="currentView = 'calendar'">
      Calendar
    </GrButton>
  </GrButtonGroup>
</template>`,
  },
  {
    id: 'button-group-toolbar',
    title: 'Compact toolbar cluster',
    description: 'Показываем `GrButtonGroup` как контейнер для плотной action-toolbar, где важна визуальная связность соседних кнопок.',
    status: 'ready',
    previewKey: 'ds-button-group-toolbar',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrButtonGroup } from '@feugene/granularity'

const activeTools = ref(['bold'])
</script>

<template>
  <GrButtonGroup aria-label="Formatting toolbar">
    <GrButton size="sm" :variant="activeTools.includes('bold') ? 'primary' : 'outline'">
      B
    </GrButton>
    <GrButton size="sm" :variant="activeTools.includes('italic') ? 'primary' : 'outline'">
      I
    </GrButton>
    <GrButton size="sm" :variant="activeTools.includes('underline') ? 'primary' : 'outline'">
      U
    </GrButton>
  </GrButtonGroup>
</template>`,
  },
  {
    id: 'button-group-filter-rail',
    title: 'Filter rail composition',
    description: 'Группа подходит и для shallow filters: рядом с cards/list states можно быстро переключать сегменты без отдельного tabs-компонента.',
    status: 'ready',
    previewKey: 'ds-button-group-filter-rail',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrButtonGroup } from '@feugene/granularity'

const currentFilter = ref('all')
</script>

<template>
  <GrButtonGroup aria-label="Content filters">
    <GrButton size="sm" :variant="currentFilter === 'all' ? 'primary' : 'outline'" @click="currentFilter = 'all'">
      All
    </GrButton>
    <GrButton size="sm" :variant="currentFilter === 'scheduled' ? 'primary' : 'outline'" @click="currentFilter = 'scheduled'">
      Scheduled
    </GrButton>
    <GrButton size="sm" :variant="currentFilter === 'failed' ? 'primary' : 'outline'" @click="currentFilter = 'failed'">
      Failed
    </GrButton>
  </GrButtonGroup>
</template>`,
  },
]
