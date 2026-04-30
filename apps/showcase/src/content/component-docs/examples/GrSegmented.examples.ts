import type { ShowcaseComponentExampleDoc } from '../types'

export const grSegmentedExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'segmented-basic-pills',
    title: 'Pills variant for compact view switching',
    description: 'Базовый happy-path для `GrSegmented`: лёгкий pills-control с moving indicator и выбором одного значения.',
    status: 'ready',
    previewKey: 'ds-segmented-basic-pills',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSegmented } from '@feugene/granularity'

const period = ref('week')

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]
</script>

<template>
  <GrSegmented v-model="period" :options="options" aria-label="Period" />
</template>`,
  },
  {
    id: 'segmented-button-variant',
    title: 'Button variant with runtime size control',
    description: 'Button-like режим подходит для toolbar и view-switcher сценариев, но сохраняет общий segmented UX и анимацию индикатора.',
    status: 'ready',
    previewKey: 'ds-segmented-button-variant',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSegmented } from '@feugene/granularity'

const view = ref('board')

const options = [
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'table', label: 'Table' },
]
</script>

<template>
  <GrSegmented v-model="view" :options="options" variant="button" aria-label="View" />
</template>`,
  },
  {
    id: 'segmented-custom-content',
    title: 'Icon + label and icon-only content',
    description: 'Компонент умеет работать и с `icon + label`, и с компактным icon-only рендерингом через scoped slot без раздувания API.',
    status: 'ready',
    previewKey: 'ds-segmented-content',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSegmented } from '@feugene/granularity'
import IconLayoutGrid from '~icons/lucide/layout-grid'
import IconRows3 from '~icons/lucide/rows-3'

const value = ref('board')

const options = [
  { value: 'board', label: 'Board', icon: IconLayoutGrid },
  { value: 'timeline', label: 'Timeline', icon: IconRows3 },
]
</script>

<template>
  <GrSegmented v-model="value" :options="options" aria-label="View" />
</template>`,
  },
  {
    id: 'segmented-states',
    title: 'Disabled items, block layout and language switcher',
    description: 'Собираем реальные product-like сценарии: language pills, full-width layout и disabled item внутри группы без потери читаемости.',
    status: 'ready',
    previewKey: 'ds-segmented-states',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSegmented } from '@feugene/granularity'

const locale = ref('ru')
const status = ref('review')

const localeOptions = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Published', disabled: true },
]
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented v-model="locale" :options="localeOptions" size="sm" aria-label="Language" />
    <GrSegmented v-model="status" :options="statusOptions" block variant="button" aria-label="Publishing status" />
  </div>
</template>`,
  },
]