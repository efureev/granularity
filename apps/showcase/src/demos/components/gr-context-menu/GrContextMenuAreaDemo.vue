<script setup lang="ts">
import { ref } from 'vue'

import type { GrDropdownMenuAction, GrDropdownMenuEntry } from '@feugene/granularity'
import { GrCard, GrContextMenu } from '@feugene/granularity'

const items: GrDropdownMenuEntry[] = [
  { key: 'paste', label: 'Вставить', shortcut: '⌘V' },
  { key: 'select-all', label: 'Выделить всё', shortcut: '⌘A' },
  { type: 'divider' },
  {
    type: 'group',
    title: 'Вид',
    items: [
      { key: 'grid', label: 'Сеткой' },
      { key: 'list', label: 'Списком' },
    ],
  },
  { type: 'divider' },
  { key: 'clear', label: 'Очистить холст', variant: 'danger' },
]

const lastAction = ref('—')

function onSelect(item: GrDropdownMenuAction): void {
  lastAction.value = item.label
}
</script>

<template>
  <GrCard class="grid gap-4 p-5">
    <!--
      Обёртки достаточно, когда действия не зависят от того, по чему кликнули:
      она же приносит клавиатурный вызов, который иначе пришлось бы писать руками.
    -->
    <GrContextMenu :items="items" @select="onSelect">
      <div
        tabindex="0"
        class="grid h-40 place-items-center rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] text-sm text-[var(--gr-muted-fg)]"
      >
        Правый клик по этой области
      </div>
    </GrContextMenu>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Последнее действие: <strong>{{ lastAction }}</strong>
    </p>
  </GrCard>
</template>
