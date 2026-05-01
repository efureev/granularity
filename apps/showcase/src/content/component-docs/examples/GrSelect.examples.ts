import type { ShowcaseComponentExampleDoc } from '../types'

export const grSelectExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'select-builder',
    title: 'Interactive select constructor',
    description: 'Живой playground для всех ключевых пропсов `GrSelect`: меняйте `view`, `size`, `optionsView`, `variant`, `underline` и состояния (multiple/clearable/disabled/allow-custom-value) без переключения между отдельными demo-картами.',
    status: 'ready',
    previewKey: 'ds-select-builder',
    code: '',
    note: 'Лучший формат для дизайн-ревью и QA: один сценарий сразу покрывает весь контракт пропсов и помогает быстро проверить native/panel-режимы и link-стилизацию.',
  },
  {
    id: 'select-native-modes',
    title: 'Native single and clearable',
    description: 'Базовый сценарий для `GrSelect`: обычный single-select и clearable режим в native-rendering без дополнительной composition-логики.',
    status: 'ready',
    previewKey: 'ds-select-native-modes',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const options = [
  { value: 'alpha', label: 'Alpha workspace' },
  { value: 'beta', label: 'Beta workspace' },
  { value: 'gamma', label: 'Gamma workspace' },
]

const nativeValue = ref('')
const clearableValue = ref('beta')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid gap-2">
      <GrSelect
        v-model="nativeValue"
        :options="options"
        placeholder="Pick workspace"
        aria-label="Pick workspace"
      />
    </div>

    <div class="grid gap-2">
      <GrSelect
        v-model="clearableValue"
        clearable
        :options="options"
        placeholder="Pick owner"
        aria-label="Pick owner"
      />
    </div>
  </div>
</template>`,
  },
  {
    id: 'select-panel-multiple',
    title: 'Panel mode for multiple selection',
    description: 'Отдельно показываем `optionsView="panel"` вместе с `multiple`, чтобы было видно поведение dropdown-панели как mini-picker.',
    status: 'ready',
    previewKey: 'ds-select-panel-multiple',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const options = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Platform' },
  { value: 'billing', label: 'Billing' },
  { value: 'support', label: 'Support' },
]

const selectedTeams = ref<string[]>(['design', 'platform'])
</script>

<template>
  <GrSelect
    v-model="selectedTeams"
    multiple
    optionsView="panel"
    :close-on-select="false"
    :options="options"
    placeholder="Pick teams"
    aria-label="Pick teams"
  />
</template>`,
    note: 'Этот сценарий помогает быстро проверить panel-behavior, множественный выбор и то, как компонент ведёт себя в формах фильтров.',
  },
  {
    id: 'select-custom-value',
    title: 'Custom value and value slot',
    description: 'Сложный режим для cases, где пользователь может добавить свой вариант и одновременно кастомизировать отображение выбранного значения.',
    status: 'ready',
    previewKey: 'ds-select-custom-value',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrSelect } from '@feugene/granularity'

const options = [
  { value: 'ru', label: 'Russia' },
  { value: 'kz', label: 'Kazakhstan' },
  { value: 'uz', label: 'Uzbekistan' },
]

const region = ref('')
</script>

<template>
  <GrSelect
    v-model="region"
    optionsView="panel"
    allow-custom-value
    :options="options"
    placeholder="Pick or add region"
    aria-label="Pick or add region"
  >
    <template #value="{ displayLabel, hasSelection, placeholder }">
      <span v-if="hasSelection" class="inline-flex items-center gap-2">
        <GrBadge>custom</GrBadge>
        <span>{{ displayLabel }}</span>
      </span>
      <span v-else>{{ placeholder }}</span>
    </template>
  </GrSelect>
</template>`,
    note: 'Именно этот режим критичен для демо complex-компонента: здесь одновременно видны custom input, panel dropdown и slot-based composition.',
  },
]
