<script setup lang="ts">
import { ref } from 'vue'

import IconFile from '~icons/lucide/file'
import IconFolder from '~icons/lucide/folder'

import { GrTree, grTreeViewVars } from '@feugene/granularity'
import type { GrTreeKey, GrTreeNode } from '@feugene/granularity'

type Item = { id: string, label: string, children?: Item[] }

const files: Item[] = [
  { id: 'pkg', label: 'packages', children: [
    { id: 'core', label: 'granularity', children: [
      { id: 'src', label: 'src', children: [
        { id: 'components', label: 'components', children: [
          { id: 'tree', label: 'GrTree', children: [
            { id: 'sfc', label: 'GrTree.vue' },
            { id: 'styles', label: 'grTreeStyles.ts' },
            { id: 'tokens', label: 'tokens.json' },
          ] },
          { id: 'affix', label: 'GrAffix', children: [
            { id: 'affix-sfc', label: 'GrAffix.vue' },
            { id: 'affix-state', label: 'affixState.ts' },
          ] },
        ] },
        { id: 'composables', label: 'composables', children: [
          { id: 'usetree', label: 'useTree.ts' },
        ] },
      ] },
      { id: 'manifest', label: 'package.json' },
    ] },
    { id: 'charts', label: 'granularity-charts', children: [
      { id: 'charts-src', label: 'src' },
    ] },
  ] },
  { id: 'apps', label: 'apps', children: [
    { id: 'showcase', label: 'showcase' },
  ] },
]

const current = ref<GrTreeKey | undefined>('sfc')

function childCount(node: GrTreeNode<Item>): number {
  return node.childNodes.length
}
</script>

<template>
  <!--
    Вид — набор значений тех же `--gr-tree-*`, что задаёт `size`, поэтому он
    раскладывается в `style` и переопределяется по одной строке. Семейство в
    набор не входит: своего токена у дерева нет, моноширинный стек берётся
    рядом из `--gr-font-mono`.

    Значок и счётчик — не украшение вида, а его несущая часть: колено связи
    упирается в значок, а без него обрывается в пустоте перед подписью.
  -->
  <div class="w-full overflow-x-auto">
    <GrTree
      v-model:current-key="current"
      :data="files"
      node-key="id"
      branch-line="elbow"
      :style="{ ...grTreeViewVars.explorer, fontFamily: 'var(--gr-font-mono)' }"
      :default-expanded-keys="['pkg', 'core', 'src', 'components', 'tree', 'composables']"
    >
      <template #default="{ node }">
        <component
          :is="childCount(node) ? IconFolder : IconFile"
          class="size-3.5 flex-none"
          :class="childCount(node) ? 'text-[var(--gr-primary)]' : 'text-[var(--gr-muted-fg)]'"
        />
        <span class="truncate">{{ node.label }}</span>
        <span
          v-if="childCount(node)"
          class="ml-auto pl-3 text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]"
        >{{ childCount(node) }}</span>
      </template>
    </GrTree>
  </div>
</template>
