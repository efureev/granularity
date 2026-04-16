import type { ShowcaseComponentExampleDoc } from '../types'

export const dsButtonGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'button-group-segmented',
    title: 'Segmented view switcher',
    description: 'Базовый composition-сценарий: `DsButtonGroup` собирает несколько adjacent actions в единый segmented control для view-mode и similar state switches.',
    status: 'ready',
    previewKey: 'ds-button-group-segmented',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsButtonGroup } from '@feugene/granularity'

const currentView = ref('board')
</script>

<template>
  <DsButtonGroup aria-label="View switcher">
    <DsButton :variant="currentView === 'board' ? 'primary' : 'outline'" @click="currentView = 'board'">
      Board
    </DsButton>
    <DsButton :variant="currentView === 'list' ? 'primary' : 'outline'" @click="currentView = 'list'">
      List
    </DsButton>
    <DsButton :variant="currentView === 'calendar' ? 'primary' : 'outline'" @click="currentView = 'calendar'">
      Calendar
    </DsButton>
  </DsButtonGroup>
</template>`,
  },
  {
    id: 'button-group-toolbar',
    title: 'Compact toolbar cluster',
    description: 'Показываем `DsButtonGroup` как контейнер для плотной action-toolbar, где важна визуальная связность соседних кнопок.',
    status: 'ready',
    previewKey: 'ds-button-group-toolbar',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsButtonGroup } from '@feugene/granularity'

const activeTools = ref(['bold'])
</script>

<template>
  <DsButtonGroup aria-label="Formatting toolbar">
    <DsButton size="sm" :variant="activeTools.includes('bold') ? 'primary' : 'outline'">
      B
    </DsButton>
    <DsButton size="sm" :variant="activeTools.includes('italic') ? 'primary' : 'outline'">
      I
    </DsButton>
    <DsButton size="sm" :variant="activeTools.includes('underline') ? 'primary' : 'outline'">
      U
    </DsButton>
  </DsButtonGroup>
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

import { DsButton, DsButtonGroup } from '@feugene/granularity'

const currentFilter = ref('all')
</script>

<template>
  <DsButtonGroup aria-label="Content filters">
    <DsButton size="sm" :variant="currentFilter === 'all' ? 'primary' : 'outline'" @click="currentFilter = 'all'">
      All
    </DsButton>
    <DsButton size="sm" :variant="currentFilter === 'scheduled' ? 'primary' : 'outline'" @click="currentFilter = 'scheduled'">
      Scheduled
    </DsButton>
    <DsButton size="sm" :variant="currentFilter === 'failed' ? 'primary' : 'outline'" @click="currentFilter = 'failed'">
      Failed
    </DsButton>
  </DsButtonGroup>
</template>`,
  },
]
