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
    description: 'Минималистичный cheat-sheet хоткеев: `GrDropdownMenuHeader` + одноколоночный `GrDropdownMenuList`, где в каждой строке действие слева и хоткей-чипы справа (`justify-between`). Клавиши рендерим компонентом `GrKbd` — без ручной вёрстки `<kbd>`.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-shortcut-grid',
    code: `<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuHeader,
  GrDropdownMenuList,
  GrKbd,
} from '@feugene/granularity'

// Каждый хоткей — массив клавиш: рендерим их как отдельные \`GrKbd\`-чипы,
// так «⌘ K» читается чище, чем слипшееся «⌘K».
const shortcuts = [
  { action: 'Search', keys: ['⌘', 'K'] },
  { action: 'Save draft', keys: ['⌘', 'S'] },
  { action: 'Assign owner', keys: ['A'] },
  { action: 'Archive', keys: ['⌘', '⌫'] },
]
</script>

<template>
  <!--
    Минималистичный cheat-sheet: одна колонка, в каждой строке действие слева и
    хоткей справа (\`justify-between\`). Клавиши — компонент \`GrKbd\` (дефолтный размер).
  -->
  <GrDropdownMenu width="64" align="left" :close-on-content-click="false">
    <template #trigger="{ open }">
      <GrButton variant="outline">
        {{ open ? 'Hide shortcuts' : 'Keyboard shortcuts' }}
      </GrButton>
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
          <GrKbd
            v-for="(key, index) in shortcut.keys"
            :key="index"
          >
            {{ key }}
          </GrKbd>
        </span>
      </div>
    </GrDropdownMenuList>
  </GrDropdownMenu>
</template>`,
  },
]
