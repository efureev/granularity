<script setup lang="ts">
import { ref } from 'vue'

import { GrTree, grTreeViewVars } from '@feugene/granularity'
import type { GrTreeKey } from '@feugene/granularity'

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
          { id: 'affix', label: 'GrAffix' },
        ] },
        { id: 'composables', label: 'composables', children: [
          { id: 'usetree', label: 'useTree.ts' },
        ] },
      ] },
      { id: 'manifest', label: 'package.json' },
    ] },
    { id: 'charts', label: 'granularity-charts' },
  ] },
  { id: 'apps', label: 'apps' },
]

const current = ref<GrTreeKey | undefined>('sfc')
</script>

<template>
  <!--
    Вид — набор значений тех же `--gr-tree-*`, что задаёт `size`, поэтому он
    раскладывается в `style` и переопределяется по одной строке.

    `elbow` здесь не украшение: колено соединяет узлы и обрывается на середине
    последнего ребёнка, так что на шестом уровне видно, какие ветки ещё
    продолжаются, а какие закончились.
  -->
  <div class="w-full overflow-x-auto">
    <GrTree
      v-model:current-key="current"
      :data="files"
      node-key="id"
      branch-line="elbow"
      :style="grTreeViewVars.explorer"
      :default-expanded-keys="['pkg', 'core', 'src', 'components', 'tree', 'composables']"
    />
  </div>
</template>
