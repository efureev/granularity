<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrTreeKey } from '@feugene/granularity'
import { GrRadioGroup, GrTree } from '@feugene/granularity'

type TreeItem = {
  id: number
  label: string
  children?: TreeItem[]
}

const treeData: TreeItem[] = [
  {
    id: 1,
    label: 'Каталог',
    children: [
      { id: 11, label: 'Одежда' },
      { id: 12, label: 'Обувь' },
    ],
  },
  {
    id: 2,
    label: 'Склады',
    children: [
      { id: 21, label: 'Москва' },
      { id: 22, label: 'Казань' },
    ],
  },
]

/**
 * Выбранный узел живёт снаружи, и это не поза: подсветку строки рисует дерево,
 * а всё остальное — заголовок панели, доступность действий — потребитель. Будь
 * у понятия два владельца, они разошлись бы на такт, и строка оказалась бы
 * подсвечена там, где панель показывает другое.
 */
const currentKey = ref<GrTreeKey | null>(11)

const flat = computed(() => {
  const result: TreeItem[] = []
  const walk = (items: TreeItem[]) => items.forEach((item) => {
    result.push(item)
    if (item.children)
      walk(item.children)
  })
  walk(treeData)

  return result
})

const currentLabel = computed(() => flat.value.find(item => item.id === currentKey.value)?.label ?? '—')

const handleVisibility = ref<'auto' | 'hover' | 'always'>('auto')

const visibilityOptions = [
  { value: 'auto', label: 'auto' },
  { value: 'hover', label: 'hover' },
  { value: 'always', label: 'always' },
] satisfies Array<{ value: 'auto' | 'hover' | 'always', label: string }>
</script>

<template>
  <div class="grid gap-4">
    <GrTree
      v-model:current-key="currentKey"
      :data="treeData"
      node-key="id"
      default-expand-all
      draggable
      :drag-handle-visibility="handleVisibility"
      branch-line
    />

    <div class="showcase-demo-panel grid gap-3 rounded-[var(--gr-radius-lg)] border p-4">
      <p class="showcase-demo-text text-sm">
        Выбрано: <strong>{{ currentLabel }}</strong> (<code>{{ currentKey ?? 'null' }}</code>)
      </p>

      <GrRadioGroup v-model="handleVisibility" :options="visibilityOptions" variant="button" size="sm" />

      <p class="showcase-demo-text text-sm">
        <code>dragHandleVisibility</code> решает, когда видна ручка переноса. По умолчанию
        <code>auto</code>: под курсором на устройстве с наведением и всегда там, где наведения не
        бывает. На тач-экране ручка «по наведению» недостижима, то есть перетаскивания там нет вовсе.
      </p>
    </div>
  </div>
</template>
