import type { ShowcaseComponentExampleDoc } from '../types'

export const grSegmentedExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'segmented-basic-pills',
    title: 'Pills variant for compact view switching',
    description: 'Базовый happy-path для `GrSegmented`: лёгкий pills-control с moving indicator и выбором одного значения.',
    status: 'ready',
    previewKey: 'gr-segmented-basic-pills',
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
    previewKey: 'gr-segmented-button-variant',
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
    previewKey: 'gr-segmented-content',
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

// Icon-only: иконка декоративна, имя сегменту задаётся через \`ariaLabel\`.
const iconOnlyOptions = [
  { value: 'board', icon: IconLayoutGrid, ariaLabel: 'Board' },
  { value: 'timeline', icon: IconRows3, ariaLabel: 'Timeline' },
]
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented v-model="value" :options="options" aria-label="View" />

    <GrSegmented v-model="value" :options="iconOnlyOptions" size="sm" aria-label="Compact view">
      <template #default="{ option }">
        <component :is="option.icon" class="h-4 w-4" />
      </template>
    </GrSegmented>
  </div>
</template>`,
  },
  {
    id: 'segmented-states',
    title: 'Disabled items, block layout and language switcher',
    description: 'Собираем реальные product-like сценарии: language pills, full-width layout и disabled item внутри группы без потери читаемости.',
    status: 'ready',
    previewKey: 'gr-segmented-states',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrSegmentedOption } from '@feugene/granularity'
import { GrButton, GrSegmented } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const locale = ref<'ru' | 'en'>('ru')
const status = ref<'draft' | 'review' | 'published'>('review')

const localeOptions: GrSegmentedOption[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

// \`syncing\` — сегмент занят: спиннер вместо иконки, выбор не принимается,
// стрелки его перешагивают.
const syncing = ref(false)

const statusOptions = computed<GrSegmentedOption[]>(() => [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review', loading: syncing.value },
  { value: 'published', label: 'Published', disabled: true },
])

function syncReview() {
  syncing.value = true
  window.setTimeout(() => { syncing.value = false }, 2000)
}

const statusLabel = computed(() => statusOptions.value.find(option => option.value === status.value)?.label ?? status.value)
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
    <div class="grid gap-4 rounded-[24px] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          {{ t('components.GrSegmented.states.languageSwitcher') }}
        </div>
        <GrSegmented v-model="locale" :options="localeOptions" size="sm" :indicator-duration="220" :aria-label="t('components.GrSegmented.states.languageAria')" />
      </div>

      <div class="grid gap-3">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          {{ t('components.GrSegmented.states.blockLayout') }}
        </div>
        <GrSegmented
          v-model="status"
          :options="statusOptions"
          block
          variant="button"
          :indicator-duration="500"
          :aria-label="t('components.GrSegmented.states.statusAria')"
        />
      </div>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      {{ t('components.GrSegmented.states.selectedState') }}
      <div class="mt-2 text-base font-semibold text-[var(--gr-fg)]">
        {{ statusLabel }}
      </div>
      <div class="mt-3 text-sm">
        {{ t('components.GrSegmented.states.disabledNote') }}
      </div>
      <GrButton class="mt-3" size="sm" variant="outline" :disabled="syncing" @click="syncReview">
        Sync «Review» for 2s
      </GrButton>
    </div>
  </div>
</template>`,
  },
]