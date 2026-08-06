import type { ShowcaseComponentExampleDoc } from '../types'

export const grTreeSelectExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tree-select-path-display',
    title: 'Single select with path display',
    description: 'Базовый сценарий для `GrTreeSelect`: single-value режим с `valueDisplay="path"`, когда пользователю нужен контекст полной ветки.',
    status: 'ready',
    previewKey: 'gr-tree-select-path-display',
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
    previewKey: 'gr-tree-select-multiple-filter',
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
    previewKey: 'gr-tree-select-custom-slots',
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
  {
    id: 'tree-select-keyboard',
    title: 'Клавиатура и загрузка справочника',
    description: 'Стрелка с поля открывает панель и уводит в дерево, `Esc` возвращает фокус обратно, а `loading` не даёт спутать «ещё едет» с «ничего нет».',
    status: 'ready',
    previewKey: 'gr-tree-select-keyboard',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrTreeSelect } from '@feugene/granularity'

type Region = {
  id: string
  label: string
  children?: Region[]
}

const catalog: Region[] = [
  {
    id: 'eu',
    label: 'Europe',
    children: [
      { id: 'eu-central', label: 'Central' },
      { id: 'eu-north', label: 'North' },
    ],
  },
  {
    id: 'us',
    label: 'Americas',
    children: [
      { id: 'us-east', label: 'East' },
      { id: 'us-west', label: 'West' },
    ],
  },
]

const data = ref<Region[]>([])
const loading = ref(false)
const value = ref<string | null>(null)

async function load() {
  loading.value = true
  data.value = []

  await new Promise(resolve => setTimeout(resolve, 900))

  data.value = catalog
  loading.value = false
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
    <div class="grid gap-3">
      <GrTreeSelect
        v-model="value"
        :data="data"
        :loading="loading"
        node-key="id"
        filterable
        clearable
        placeholder="Регион размещения"
        aria-label="Регион размещения"
      />

      <div>
        <GrButton size="sm" variant="outline" @click="load">
          Загрузить справочник
        </GrButton>
      </div>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      <ul class="grid gap-1">
        <li>Стрелка вниз на поле открывает панель и уводит в поиск.</li>
        <li>Ещё одна стрелка — фокус уже в дереве, дальше клавиши GrTree.</li>
        <li><code>Esc</code> закрывает панель и возвращает фокус на поле.</li>
        <li>Пока данные едут, панель показывает индикатор, а не «нет данных».</li>
      </ul>
    </div>
  </div>
</template>`,
  },
]
