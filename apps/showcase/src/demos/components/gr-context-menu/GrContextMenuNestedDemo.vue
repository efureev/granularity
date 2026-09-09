<script setup lang="ts">
import { ref } from 'vue'

import type { GrDropdownMenuAction, GrDropdownMenuEntry } from '@feugene/granularity'
import { GrCard, GrContextMenu } from '@feugene/granularity'

// Модель общая с `GrDropdownMenu`, поэтому и второй уровень тот же:
// пункт с `children` раскрывает подменю, `select` по нему не приходит.
const items: GrDropdownMenuEntry[] = [
  { key: 'open', label: 'Открыть', shortcut: '⏎' },
  { key: 'rename', label: 'Переименовать', shortcut: 'F2' },
  { type: 'divider' },
  {
    key: 'export',
    label: 'Экспортировать',
    children: [
      { key: 'pdf', label: 'PDF' },
      { key: 'csv', label: 'CSV' },
      { type: 'divider' },
      {
        key: 'image',
        label: 'Картинкой',
        children: [
          { key: 'png', label: 'PNG' },
          { key: 'svg', label: 'SVG' },
        ],
      },
    ],
  },
  {
    key: 'move',
    label: 'Переместить в',
    children: [
      { key: 'drafts', label: 'Черновики' },
      { key: 'archive', label: 'Архив' },
      { key: 'trash', label: 'Корзину', variant: 'danger' },
    ],
  },
  { type: 'divider' },
  { key: 'delete', label: 'Удалить', variant: 'danger', shortcut: '⌫' },
]

const lastAction = ref('—')

function onSelect(item: GrDropdownMenuAction): void {
  lastAction.value = item.label
}
</script>

<template>
  <GrCard class="grid gap-4 p-5">
    <GrContextMenu :items="items" @select="onSelect">
      <div
        tabindex="0"
        class="grid h-40 place-items-center rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] text-sm text-[var(--gr-muted-fg)]"
      >
        Правый клик или Shift+F10 — у пунктов «Экспортировать» и «Переместить в» есть второй уровень
      </div>
    </GrContextMenu>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Последнее действие: <strong>{{ lastAction }}</strong>
    </p>
  </GrCard>
</template>
