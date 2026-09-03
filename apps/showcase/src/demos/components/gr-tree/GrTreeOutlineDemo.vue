<script setup lang="ts">
import { ref } from 'vue'

import { GrTree, grTreeViewVars } from '@feugene/granularity'
import type { GrTreeKey, GrTreeVisibleRow } from '@feugene/granularity'

type Item = { id: string, label: string, children?: Item[] }

const outline: Item[] = [
  { id: 'install', label: 'Установка', children: [
    { id: 'yarn', label: 'Пакетный менеджер' },
    { id: 'preset', label: 'Подключение пресета', children: [
      { id: 'tokens', label: 'Свои токены' },
      { id: 'icons', label: 'Пресет иконок' },
    ] },
  ] },
  { id: 'theming', label: 'Темы', children: [
    { id: 'roles', label: 'Роли и суффиксы' },
    { id: 'compose', label: 'Композиция поверх готовой' },
  ] },
  { id: 'a11y', label: 'Доступность' },
]

const current = ref<GrTreeKey | undefined>('preset')

/**
 * Ступени кегля по уровням — единственное, чего набор значений сделать не может:
 * уровень строки знает только разметка. Отсюда `rowClass` функцией.
 */
function levelClass(level: number): string {
  if (level === 1)
    return 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)] font-600'

  if (level === 2)
    return 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]'

  return 'outline-leaf text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
}

function rowClass(row: GrTreeVisibleRow<Item>): string {
  const base = levelClass(row.node.level)

  // Выбор не подсвечен подложкой, поэтому состояние несут полоса, цвет и вес
  // разом: на мелких уровнях одного цвета не хватает. Ступень кегля при этом
  // остаётся своя — выбор не должен менять уровень строки.
  return row.node.key === current.value ? `${base} font-600` : base
}
</script>

<template>
  <!--
    Самый тихий вид: направляющих и подложек нет, иерархию несёт набор. Он
    рассчитан на то, чтобы стоять рядом с читаемым текстом и не спорить с ним.
  -->
  <div class="w-full max-w-xs">
    <GrTree
      v-model:current-key="current"
      :data="outline"
      node-key="id"
      :branch-line="false"
      :row-class="rowClass"
      :style="grTreeViewVars.outline"
      :default-expanded-keys="['install', 'preset', 'theming']"
    />
  </div>
</template>

<style scoped>
/* Точка у самого мелкого уровня: на третьей ступени кегля разница с соседней
   почти не читается, и уровень опознаётся уже маркером, а не размером. */
:deep(.outline-leaf .gr-tree__label)::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 3px;
  margin-right: 7px;
  border-radius: 50%;
  background: currentColor;
  vertical-align: middle;
  opacity: 0.7;
}
</style>
