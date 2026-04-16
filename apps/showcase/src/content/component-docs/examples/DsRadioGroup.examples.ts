import type { ShowcaseComponentExampleDoc } from '../types'

export const dsRadioGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'radio-group-options',
    title: 'Generated group from options list',
    description: 'Быстрый старт-сценарий для `options`: одна декларация массива сразу даёт полную radio-группу без ручного рендера каждого элемента.',
    status: 'ready',
    previewKey: 'ds-radio-group-options',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsRadioGroup } from '@feugene/granularity'

const status = ref('review')

const options = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'published', label: 'Published' },
]

const selectedOption = computed(() => options.find(option => option.value === status.value)?.label ?? status.value)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <DsRadioGroup v-model="status" :options="options" />

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Selected state:
      <div class="mt-2 text-base font-semibold text-[var(--fg)]">
        {{ selectedOption }}
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'radio-group-button-tone',
    title: 'Button tone with runtime size control',
    description: 'Группа переключается в button-mode и масштабируется через `size`, что особенно полезно для toolbar и page-view toggles.',
    status: 'ready',
    previewKey: 'ds-radio-group-button-variant',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsRadioGroup, DsSelect } from '@feugene/granularity'

const view = ref('board')
const size = ref<'sm' | 'md' | 'lg'>('md')

const sizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const viewOptions = [
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'table', label: 'Table' },
]
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-3 md:max-w-[220px]">
      <div class="text-sm font-semibold text-[var(--fg)]">
        Button size
      </div>
      <DsSelect v-model="size" :options="sizeOptions" />
    </div>

    <DsRadioGroup v-model="view" :options="viewOptions" variant="button" :size="size" />
  </div>
</template>`,
  },
  {
    id: 'radio-group-custom-slots',
    title: 'Custom slot content for per-option annotations',
    description: 'Когда у опций есть secondary badges и статусы, удобнее перейти от `options` к slot-based composition поверх `DsRadioGroup` + `DsRadio`.',
    status: 'ready',
    previewKey: 'ds-radio-group-custom-slots',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsRadio, DsRadioGroup } from '@feugene/granularity'

const channel = ref('slack')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <DsRadioGroup v-model="channel" name="incident-channel">
      <DsRadio value="slack">
        <span class="inline-flex items-center gap-2">
          Slack
          <DsBadge tone="success" size="sm">Primary</DsBadge>
        </span>
      </DsRadio>
      <DsRadio value="email">
        <span class="inline-flex items-center gap-2">
          Email
          <DsBadge tone="warning" size="sm">Fallback</DsBadge>
        </span>
      </DsRadio>
      <DsRadio value="pagerduty">
        <span class="inline-flex items-center gap-2">
          PagerDuty
          <DsBadge tone="danger" size="sm">Escalation</DsBadge>
        </span>
      </DsRadio>
    </DsRadioGroup>

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Routed through: <span class="font-semibold text-[var(--fg)]">{{ channel }}</span>
    </div>
  </div>
</template>`,
  },
]
