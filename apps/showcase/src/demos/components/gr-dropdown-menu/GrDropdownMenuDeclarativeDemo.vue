<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrDropdownMenuAction, GrDropdownMenuEntry } from '@feugene/granularity'
import { GrButton, GrDropdownMenu } from '@feugene/granularity'

const density = ref<'compact' | 'cozy'>('cozy')
const showArchived = ref(false)
const lastAction = ref('—')

// Модель вместо композиции: девять меню из десяти однотипны, и собирать их
// из пяти компонентов вручную незачем.
const items = computed<GrDropdownMenuEntry[]>(() => [
  { key: 'rename', label: 'Rename', shortcut: '⌘R' },
  { key: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
  { type: 'divider' },
  {
    type: 'group',
    title: 'View',
    items: [
      { key: 'compact', label: 'Compact rows', role: 'menuitemradio', checked: density.value === 'compact' },
      { key: 'cozy', label: 'Cozy rows', role: 'menuitemradio', checked: density.value === 'cozy' },
      { key: 'archived', label: 'Show archived', role: 'menuitemcheckbox', checked: showArchived.value },
    ],
  },
  { type: 'divider' },
  // Выключенный пункт остаётся в обходе стрелками и объявляется как недоступный:
  // пользователь узнаёт, что действие есть, но сейчас не работает.
  { key: 'export', label: 'Export…', disabled: true },
  { key: 'docs', label: 'Open docs', href: 'https://github.com/fureev', external: true },
  { key: 'delete', label: 'Delete', variant: 'danger', shortcut: '⌫' },
])

function onSelect(item: GrDropdownMenuAction): void {
  if (item.key === 'compact' || item.key === 'cozy')
    density.value = item.key

  if (item.key === 'archived')
    showArchived.value = !showArchived.value

  lastAction.value = item.label
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdownMenu :items="items" placement="bottom-start" width="15rem" @select="onSelect">
      <template #trigger="{ open, triggerProps }">
        <GrButton v-bind="triggerProps" variant="outline">
          {{ open ? 'Close board actions' : 'Board actions' }}
        </GrButton>
      </template>
    </GrDropdownMenu>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Density: <span class="font-semibold text-[var(--gr-fg)]">{{ density }}</span> ·
      archived: <span class="font-semibold text-[var(--gr-fg)]">{{ showArchived ? 'shown' : 'hidden' }}</span> ·
      last action: <span class="font-semibold text-[var(--gr-fg)]">{{ lastAction }}</span>
    </div>
  </div>
</template>
