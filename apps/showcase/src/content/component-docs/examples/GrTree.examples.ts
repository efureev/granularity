import type { ShowcaseComponentExampleDoc } from '../types'

export const grTreeExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tree-expanded-state',
    title: 'Controlled expanded state and branch lines',
    description: 'Показываем `GrTree` как иерархический explorer, где внешняя orchestration управляет раскрытием групп и визуальными branch lines.',
    status: 'ready',
    previewKey: 'ds-tree-expanded-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrTree } from '@feugene/granularity'

const expandedKeys = ref([1, 2])
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" variant="outline" @click="expandedKeys = [1, 2, 3]">
        Expand all groups
      </GrButton>
      <GrButton size="sm" variant="ghost" @click="expandedKeys = [2]">
        Focus billing
      </GrButton>
    </div>

    <GrTree :data="treeData" :default-expanded-keys="expandedKeys" branch-line />

    <div class="flex flex-wrap gap-2">
      <GrBadge v-for="key in expandedKeys" :key="key">
        Expanded: {{ key }}
      </GrBadge>
    </div>
  </div>
</template>`,
    note: 'Этот сценарий подчёркивает, что `GrTree` хорошо работает как controlled navigation/data primitive, а не только как статичное дерево.',
  },
  {
    id: 'tree-filtering',
    title: 'Filtering through instance API',
    description: 'Фильтрацию важно показывать не как магический prop, а как реальную интеграцию через expose-метод `filter()` и внешний input.',
    status: 'ready',
    previewKey: 'ds-tree-filtering',
    code: `<script setup lang="ts">
import { ref, watch } from 'vue'

import { GrInput, GrTree } from '@feugene/granularity'

const query = ref('')
const treeRef = ref(null)

watch(query, value => treeRef.value?.filter(value), { immediate: true })
</script>

<template>
  <div class="grid gap-4">
    <GrInput v-model="query" placeholder="Filter tree nodes" aria-label="Filter tree nodes" />

    <GrTree
      ref="treeRef"
      :data="treeData"
      :filter-node-method="(value, data) => [data.label, data.team].join(' ').toLowerCase().includes(String(value).toLowerCase())"
      branch-line
    />
  </div>
</template>`,
    note: 'Полезный integration recipe для search/filter поверх больших справочников и nested navigation.',
  },
  {
    id: 'tree-drag-and-slot',
    title: 'Drag-and-drop with custom row slot',
    description: 'Комбинируем две важные возможности complex-дерева: rearrange drag-and-drop и кастомный рендер строки через default slot.',
    status: 'ready',
    previewKey: 'ds-tree-drag-and-slot',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrTree } from '@feugene/granularity'

const lastDrop = ref('Drag a row handle to reorder or nest nodes')
</script>

<template>
  <div class="grid gap-4">
    <GrTree
      :data="treeData"
      :default-expanded-keys="[1, 2]"
      draggable
      branch-line
      @node-drop="(draggingNode, dropNode, dropType) => lastDrop = [draggingNode.label, '→', dropNode.label, '(' + dropType + ')'].join(' ')"
    >
      <template #default="{ data }">
        <div class="flex w-full items-center justify-between gap-3">
          <span>{{ data.label }}</span>
          <span>{{ data.status }}</span>
        </div>
      </template>
    </GrTree>

    <GrBadge>{{ lastDrop }}</GrBadge>
  </div>
</template>`,
    note: 'Сценарий особенно важен для real-world деревьев с ownership/status метаданными и операторскими перестановками.',
  },
]
