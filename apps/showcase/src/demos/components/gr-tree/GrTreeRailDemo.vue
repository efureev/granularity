<script setup lang="ts">
import { ref } from 'vue'

import { GrTree, grTreeViewVars } from '@feugene/granularity'
import type { GrTreeKey } from '@feugene/granularity'

type Item = { id: string, label: string, children?: Item[] }

const sections: Item[] = [
  { id: 'ops', label: 'Операции', children: [
    { id: 'esc', label: 'Эскалации' },
    { id: 'rules', label: 'Регламенты', children: [
      { id: 'duty', label: 'Дежурства' },
      { id: 'tpl', label: 'Шаблоны ответов' },
    ] },
    { id: 'shifts', label: 'Отчёты смены' },
  ] },
  { id: 'billing', label: 'Биллинг', children: [
    { id: 'invoices', label: 'Счета' },
    { id: 'disputes', label: 'Споры' },
  ] },
  { id: 'support', label: 'Поддержка' },
]

const current = ref<GrTreeKey | undefined>('duty')
</script>

<template>
  <!--
    Выбранная строка — сплошная плашка, обрезанная слева по отступу уровня, и
    текст на ней перекрашен: без токена `--gr-tree-row-current-color` он остался
    бы цветом обычной строки и на насыщенной подложке стал бы нечитаемым.
  -->
  <div class="w-full max-w-xs">
    <GrTree
      v-model:current-key="current"
      :data="sections"
      node-key="id"
      :style="grTreeViewVars.rail"
      :default-expanded-keys="['ops', 'rules', 'billing']"
    >
      <template #default="{ node }">
        <span class="truncate">{{ node.label }}</span>
        <span
          v-if="node.childNodes.length"
          class="rail-count ml-auto pl-3 text-[0.85em] [font-variant-numeric:tabular-nums]"
        >{{ node.childNodes.length }}</span>
      </template>
    </GrTree>
  </div>
</template>

<style scoped>
/* Счётчик приглушён на обычных строках и берёт полный цвет строки на выбранной:
   на насыщенной подложке приглушение съело бы контраст, а прозрачность —
   разбавила бы выверенный токен текста. */
.rail-count {
  color: var(--gr-muted-fg);
}

.gr-tree__row--current .rail-count {
  color: inherit;
}
</style>
