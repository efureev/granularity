import type { ShowcaseComponentExampleDoc } from '../types'

export const grDropdownMenuExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dropdown-menu-quick-actions',
    title: 'Quick actions menu',
    description: 'Строим компактное action-menu поверх `GrDropdownMenu`, сохраняя привычный trigger/content contract от `GrDropdown`.',
    status: 'ready',
    previewKey: 'ds-dropdown-menu-quick-actions',
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
    previewKey: 'ds-dropdown-menu-grouped-actions',
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
    description: 'Показываем `GrDropdownMenuColumns` и `GrDropdownMenuColumn` для двухколоночных shortcut/metadata layouts внутри overlay.',
    status: 'ready',
    previewKey: 'ds-dropdown-menu-shortcut-grid',
    code: `<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuColumn,
  GrDropdownMenuColumns,
} from '@feugene/granularity'
</script>

<template>
  <GrDropdownMenu width="64" align="left" :close-on-content-click="false">
    <template #trigger>
      <GrButton variant="outline">Open shortcut map</GrButton>
    </template>

    <GrDropdownMenuColumns>
      <GrDropdownMenuColumn align="left">Search</GrDropdownMenuColumn>
      <GrDropdownMenuColumn align="right">⌘K</GrDropdownMenuColumn>
      <GrDropdownMenuColumn align="left">Save draft</GrDropdownMenuColumn>
      <GrDropdownMenuColumn align="right">⌘S</GrDropdownMenuColumn>
    </GrDropdownMenuColumns>
  </GrDropdownMenu>
</template>`,
  },
]
