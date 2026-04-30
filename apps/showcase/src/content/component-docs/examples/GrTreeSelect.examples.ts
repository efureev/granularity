import type { ShowcaseComponentExampleDoc } from '../types'

export const grTreeSelectExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tree-select-path-display',
    title: 'Single select with path display',
    description: 'Базовый сценарий для `GrTreeSelect`: single-value режим с `valueDisplay="path"`, когда пользователю нужен контекст полной ветки.',
    status: 'ready',
    previewKey: 'ds-tree-select-path-display',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTreeSelect } from '@feugene/granularity'

const value = ref(122)
</script>

<template>
  <div class="grid gap-4">
    <GrTreeSelect
      v-model="value"
      :data="treeData"
      clearable
      value-display="path"
      placeholder="Pick knowledge area"
      aria-label="Pick knowledge area"
      :default-expanded-keys="[1]"
    />

    <GrBadge>
      Current value: {{ value ?? 'nothing selected' }}
    </GrBadge>
  </div>
</template>`,
  },
  {
    id: 'tree-select-multiple-filter',
    title: 'Multiple selection with filtering',
    description: 'Показываем наиболее ценный complex-flow: multi-select режим, встроенный filter и `closeOnSelect=false` для пакетного выбора узлов.',
    status: 'ready',
    previewKey: 'ds-tree-select-multiple-filter',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrTreeSelect } from '@feugene/granularity'

const selectedValues = ref([12, 21])
</script>

<template>
  <GrTreeSelect
    v-model="selectedValues"
    :data="treeData"
    multiple
    filterable
    clearable
    :close-on-select="false"
    placeholder="Filter and pick several areas"
    aria-label="Filter and pick several areas"
    :default-expanded-keys="[1, 2, 3]"
  />
</template>`,
    note: 'Это хороший reference для permission matrices, taxonomy pickers и bulk-assignment flows.',
  },
  {
    id: 'tree-select-custom-slots',
    title: 'Custom trigger value and node slots',
    description: 'Документируем slot API компонента: кастомный value-preview в trigger и enriched node rendering внутри dropdown-tree.',
    status: 'ready',
    previewKey: 'ds-tree-select-custom-slots',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrTreeSelect } from '@feugene/granularity'

const value = ref(11)
</script>

<template>
  <GrTreeSelect v-model="value" :data="treeData" :default-expanded-keys="[1, 2]">
    <template #value="{ displayValue, labels }">
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="font-600">{{ displayValue || 'Nothing selected' }}</span>
        <span v-if="labels.length">{{ labels.length }} label(s)</span>
      </div>
    </template>

    <template #node="{ data, selected }">
      <div class="flex w-full items-center justify-between gap-3">
        <span>{{ data.label }}</span>
        <span>{{ selected ? 'Selected' : data.owner }}</span>
      </div>
    </template>
  </GrTreeSelect>
</template>`,
    note: 'Этот пример помогает увидеть, как `GrTreeSelect` превращается из generic picker в domain-specific selector без форка компонента.',
  },
]
