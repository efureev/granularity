<script setup lang="ts">
import { ref } from 'vue'

import type { GrDropdownMenuAction, GrDropdownMenuEntry } from '@feugene/granularity'
import { GrButton, GrDropdownMenu } from '@feugene/granularity'

const lastAction = ref('—')

// Пункт с `children` ничего не выполняет — он раскрывает следующий уровень,
// поэтому `select` по нему не приходит.
const items: GrDropdownMenuEntry[] = [
  { key: 'rename', label: 'Rename', shortcut: '⌘R' },
  { type: 'divider' },
  {
    key: 'export',
    label: 'Export',
    children: [
      { key: 'pdf', label: 'PDF' },
      { key: 'csv', label: 'CSV' },
      { type: 'divider' },
      {
        key: 'image',
        label: 'Image',
        children: [
          { key: 'png', label: 'PNG' },
          { key: 'svg', label: 'SVG' },
        ],
      },
    ],
  },
  {
    key: 'share',
    label: 'Share',
    children: [
      { type: 'group', title: 'Access', items: [
        { key: 'link-view', label: 'Anyone with the link', role: 'menuitemradio', checked: true },
        { key: 'link-edit', label: 'Anyone can edit', role: 'menuitemradio' },
      ] },
      { type: 'divider' },
      { key: 'invite', label: 'Invite people…' },
    ],
  },
  { key: 'locked', label: 'Move to…', disabled: true },
  { type: 'divider' },
  { key: 'delete', label: 'Delete', variant: 'danger', shortcut: '⌫' },
]

function onSelect(item: GrDropdownMenuAction): void {
  lastAction.value = item.label
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdownMenu :items="items" placement="bottom-start" width="14rem" @select="onSelect">
      <template #trigger="{ triggerProps }">
        <GrButton v-bind="triggerProps" variant="outline">
          Document actions
        </GrButton>
      </template>
    </GrDropdownMenu>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Last action: <span class="font-semibold text-[var(--gr-fg)]">{{ lastAction }}</span>
    </div>
  </div>
</template>
