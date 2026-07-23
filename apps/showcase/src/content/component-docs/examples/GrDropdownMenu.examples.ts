import type { ShowcaseComponentExampleDoc } from '../types'

export const grDropdownMenuExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dropdown-menu-quick-actions',
    title: 'Quick actions menu',
    description: 'Строим компактное action-menu поверх `GrDropdownMenu`, сохраняя привычный trigger/content contract от `GrDropdown`.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-quick-actions',
    code: `<script setup lang="ts">
import { GrButton, GrDropdownMenu, GrDropdownMenuItem } from '@feugene/granularity'
</script>

<template>
  <GrDropdownMenu align="left" width="60">
    <template #trigger="{ open }">
      <GrButton variant="outline">
        {{ open ? 'Close quick actions' : 'Open quick actions' }}
      </GrButton>
    </template>

    <GrDropdownMenuItem>Duplicate page</GrDropdownMenuItem>
    <GrDropdownMenuItem>Move to archive</GrDropdownMenuItem>
    <GrDropdownMenuItem>Copy public URL</GrDropdownMenuItem>
  </GrDropdownMenu>
</template>`,
  },
  {
    id: 'dropdown-menu-grouped-actions',
    title: 'Grouped sections with danger zone',
    description: 'Для richer menus используем `GrDropdownMenuGroup` и `GrDropdownMenuDivider`, чтобы отделять publish-flow и destructive actions.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-grouped-actions',
    code: `<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuDivider,
  GrDropdownMenuGroup,
  GrDropdownMenuItem,
} from '@feugene/granularity'
</script>

<template>
  <GrDropdownMenu width="64">
    <template #trigger>
      <GrButton>Workspace actions</GrButton>
    </template>

    <GrDropdownMenuGroup title="Publish" :uppercase="false" dividers>
      <GrDropdownMenuItem>Publish now</GrDropdownMenuItem>
      <GrDropdownMenuItem>Schedule for review</GrDropdownMenuItem>
    </GrDropdownMenuGroup>

    <GrDropdownMenuDivider />

    <GrDropdownMenuGroup title="Danger zone" :uppercase="false" dividers>
      <GrDropdownMenuItem variant="danger">Delete draft</GrDropdownMenuItem>
    </GrDropdownMenuGroup>
  </GrDropdownMenu>
</template>`,
  },
  {
    id: 'dropdown-menu-shortcut-grid',
    title: 'Shortcut cheat-sheet grid',
    description: 'Минималистичный cheat-sheet хоткеев: `GrDropdownMenuHeader` + одноколоночный `GrDropdownMenuList`, где в каждой строке действие слева и хоткей-чипы справа (`justify-between`) — без вертикальных разделителей.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-shortcut-grid',
    code: `<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuHeader,
  GrDropdownMenuList,
} from '@feugene/granularity'

const shortcuts = [
  { action: 'Search', keys: ['⌘', 'K'] },
  { action: 'Save draft', keys: ['⌘', 'S'] },
  { action: 'Assign owner', keys: ['A'] },
  { action: 'Archive', keys: ['⌘', '⌫'] },
]
</script>

<template>
  <GrDropdownMenu width="64" align="left" :close-on-content-click="false">
    <template #trigger="{ open }">
      <GrButton variant="outline">{{ open ? 'Hide shortcuts' : 'Keyboard shortcuts' }}</GrButton>
    </template>

    <GrDropdownMenuHeader title="Keyboard shortcuts" />

    <GrDropdownMenuList>
      <div
        v-for="shortcut in shortcuts"
        :key="shortcut.action"
        class="flex items-center justify-between gap-6 px-4 py-2 text-[13px] text-[var(--gr-fg)]"
      >
        <span class="truncate">{{ shortcut.action }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <kbd
            v-for="(key, index) in shortcut.keys"
            :key="index"
            class="min-w-[20px] rounded-md border border-[var(--gr-brd)] bg-[var(--gr-muted)] px-1.5 py-0.5 text-center text-[11px] font-medium text-[var(--gr-muted-fg)] tabular-nums"
          >{{ key }}</kbd>
        </span>
      </div>
    </GrDropdownMenuList>
  </GrDropdownMenu>
</template>`,
  },
]
