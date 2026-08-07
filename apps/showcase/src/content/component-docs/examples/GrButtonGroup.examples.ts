import type { ShowcaseComponentExampleDoc } from '../types'

export const grButtonGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'button-group-segmented',
    title: 'Segmented view switcher',
    description: 'Базовый composition-сценарий: `GrButtonGroup` собирает несколько adjacent actions в единый segmented control для view-mode и similar state switches.',
    status: 'ready',
    previewKey: 'gr-button-group-segmented',
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
    previewKey: 'gr-button-group-toolbar',
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
    id: 'button-group-shared-style',
    title: 'Shared styling and wrapped buttons',
    description: 'Размер, вариант и тон задаются один раз на группе и доходят до кнопок; проп самой кнопки сильнее группы, а группа сильнее `GrConfigProvider` — она ближе. Обёртка вокруг кнопки (тултип, `v-if`-спан, роутерная ссылка) ряд не разрывает: склейка считает звенья группы, а не прямых потомков.',
    status: 'ready',
    previewKey: 'gr-button-group-shared-style',
    code: `<script setup lang="ts">
import { GrButton, GrButtonGroup, GrTooltip } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4">
    <!-- Оформление задаётся один раз на группе, а не повторяется на каждой кнопке. -->
    <GrButtonGroup aria-label="Период отчёта" size="sm" variant="outline" tone="neutral">
      <GrButton>День</GrButton>
      <GrButton>Неделя</GrButton>
      <GrButton tone="primary">
        Месяц
      </GrButton>
    </GrButtonGroup>

    <!-- Обёртка вокруг кнопки не разрывает ряд: склейка считает звенья, а не прямых потомков. -->
    <GrButtonGroup aria-label="Действия над документом" variant="outline">
      <GrButton>Открыть</GrButton>
      <GrTooltip content="Копия появится рядом с оригиналом">
        <GrButton>Дублировать</GrButton>
      </GrTooltip>
      <GrButton>Архивировать</GrButton>
    </GrButtonGroup>
  </div>
</template>`,
  },
  {
    id: 'button-group-orientation',
    title: 'Vertical group and spaced mode',
    description: '`orientation="vertical"` собирает кнопки в столбец — скругления переезжают на верхний и нижний края. `:attached="false"` даёт обычный ряд с зазором: каждая кнопка сохраняет свои радиусы и границы.',
    status: 'ready',
    previewKey: 'gr-button-group-orientation',
    code: `<script setup lang="ts">
import { GrButton, GrButtonGroup } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-start gap-8">
    <GrButtonGroup aria-label="Слои карты" orientation="vertical" variant="outline">
      <GrButton>Схема</GrButton>
      <GrButton>Спутник</GrButton>
      <GrButton>Гибрид</GrButton>
    </GrButtonGroup>

    <!-- \`attached: false\` — тот же ряд, но без склейки: каждая кнопка со своими радиусами. -->
    <GrButtonGroup aria-label="Экспорт" :attached="false" variant="ghost">
      <GrButton>CSV</GrButton>
      <GrButton>XLSX</GrButton>
      <GrButton>PDF</GrButton>
    </GrButtonGroup>
  </div>
</template>`,
  },
  {
    id: 'button-group-filter-rail',
    title: 'Filter rail composition',
    description: 'Группа подходит и для shallow filters: рядом с cards/list states можно быстро переключать сегменты без отдельного tabs-компонента.',
    status: 'ready',
    previewKey: 'gr-button-group-filter-rail',
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
