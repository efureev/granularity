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
function rowClass(row: GrTreeVisibleRow<Item>): string {
  if (row.node.level === 1)
    return 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600'

  if (row.node.level === 2)
    return 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]'

  return 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
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
