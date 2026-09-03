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
            { id: 'tokens', label: 'tokens.json' },
          ] },
          { id: 'affix', label: 'GrAffix' },
        ] },
        { id: 'composables', label: 'composables' },
      ] },
      { id: 'manifest', label: 'package.json' },
    ] },
    { id: 'charts', label: 'granularity-charts' },
  ] },
]

const sections: Item[] = [
  { id: 'ops', label: 'Операции', children: [
    { id: 'esc', label: 'Эскалации' },
    { id: 'rules', label: 'Регламенты', children: [
      { id: 'duty', label: 'Дежурства' },
      { id: 'tpl', label: 'Шаблоны ответов' },
    ] },
  ] },
  { id: 'billing', label: 'Биллинг', children: [
    { id: 'invoices', label: 'Счета' },
    { id: 'disputes', label: 'Споры' },
  ] },
]

const filePick = ref<GrTreeKey | undefined>('sfc')
const sectionPick = ref<GrTreeKey | undefined>('duty')
</script>

<template>
  <!--
    Вид — набор значений тех же переменных, что задаёт `size`, а не проп: второй
    канал спорил бы с размером за одни и те же токены. Набор раскладывается в
    `style`, поэтому переопределяется по одной строке.
  -->
  <div class="grid w-full gap-4 sm:grid-cols-2">
    <div class="flex flex-col gap-2">
      <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        explorer + branch-line="elbow"
      </span>
      <div class="rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] p-2">
        <GrTree
          v-model:current-key="filePick"
          :data="files"
          node-key="id"
          branch-line="elbow"
          :style="grTreeViewVars.explorer"
          :default-expanded-keys="['pkg', 'core', 'src', 'components', 'tree']"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        rail
      </span>
      <div class="rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] p-2">
        <GrTree
          v-model:current-key="sectionPick"
          :data="sections"
          node-key="id"
          :style="grTreeViewVars.rail"
          :default-expanded-keys="['ops', 'rules', 'billing']"
        />
      </div>
    </div>
  </div>
</template>
