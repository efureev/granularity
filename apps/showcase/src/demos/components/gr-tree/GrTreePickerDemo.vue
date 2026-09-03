<script setup lang="ts">
import { ref } from 'vue'

import { GrTree, grTreeViewVars } from '@feugene/granularity'
import type { GrTreeKey, GrTreeNode } from '@feugene/granularity'

type Item = { id: string, label: string, children?: Item[] }

const scope: Item[] = [
  { id: 'reports', label: 'Отчёты', children: [
    { id: 'sales', label: 'Продажи', children: [
      { id: 'regions', label: 'Регионы', children: [
        { id: 'north', label: 'Север' },
        { id: 'south', label: 'Юг' },
      ] },
      { id: 'channels', label: 'Каналы' },
    ] },
    { id: 'stock', label: 'Склад', children: [
      { id: 'balance', label: 'Остатки' },
      { id: 'turnover', label: 'Оборачиваемость' },
    ] },
    { id: 'finance', label: 'Финансы' },
  ] },
  { id: 'admin', label: 'Администрирование', children: [
    { id: 'users', label: 'Пользователи' },
    { id: 'audit', label: 'Журнал действий' },
  ] },
]

const checked = ref<GrTreeKey[]>(['north'])

/** Листья поддерева: отмечают всегда их, родитель отмечается каскадом. */
function leavesOf(node: GrTreeNode<Item>): GrTreeKey[] {
  if (!node.childNodes.length)
    return [node.key]

  return node.childNodes.flatMap(leavesOf)
}

function selectedOf(node: GrTreeNode<Item>): { picked: number, total: number } {
  const leaves = leavesOf(node)
  return { picked: leaves.filter(key => checked.value.includes(key)).length, total: leaves.length }
}
</script>

<template>
  <!--
    Отметки — ось, а не вид: `showCheckbox` включается на любом наборе. Вид
    задаёт под неё плотность: строка 38px и увеличенный квадрат делают целью
    нажатия сам квадрат, а не подпись.

    Счётчик «N из M» показан только у веток и только когда выбрано не всё: он
    отвечает на вопрос, ради которого ветку и сворачивают, — что там внутри
    осталось.
  -->
  <div class="w-full max-w-sm">
    <GrTree
      v-model:checked-keys="checked"
      :data="scope"
      node-key="id"
      show-checkbox
      :style="grTreeViewVars.picker"
      :default-expanded-keys="['reports', 'sales', 'regions']"
    >
      <template #default="{ node }">
        <span class="truncate">{{ node.label }}</span>
        <span
          v-if="node.childNodes.length && selectedOf(node).picked && selectedOf(node).picked < selectedOf(node).total"
          class="ml-auto rounded-full bg-[var(--gr-tree-row-current-bg)] px-[7px] py-px text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-primary-text)] [font-variant-numeric:tabular-nums]"
        >{{ selectedOf(node).picked }} из {{ selectedOf(node).total }}</span>
      </template>
    </GrTree>
  </div>
</template>
