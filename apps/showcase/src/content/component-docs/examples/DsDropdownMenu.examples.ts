import type { ShowcaseComponentExampleDoc } from '../types'

export const dsDropdownMenuExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dropdown-menu-quick-actions',
    title: 'Quick actions menu',
    description: 'Строим компактное action-menu поверх `DsDropdownMenu`, сохраняя привычный trigger/content contract от `DsDropdown`.',
    status: 'ready',
    previewKey: 'ds-dropdown-menu-quick-actions',
    code: `<script setup lang="ts">
import { DsButton, DsDropdownMenu, DsDropdownMenuItem } from '@feugene/granularity'
</script>

<template>
  <DsDropdownMenu align="left" width="60">
    <template #trigger="{ open }">
      <DsButton variant="outline">
        {{ open ? 'Close quick actions' : 'Open quick actions' }}
      </DsButton>
    </template>

    <DsDropdownMenuItem>Duplicate page</DsDropdownMenuItem>
    <DsDropdownMenuItem>Move to archive</DsDropdownMenuItem>
    <DsDropdownMenuItem>Copy public URL</DsDropdownMenuItem>
  </DsDropdownMenu>
</template>`,
  },
  {
    id: 'dropdown-menu-grouped-actions',
    title: 'Grouped sections with danger zone',
    description: 'Для richer menus используем `DsDropdownMenuGroup` и `DsDropdownMenuDivider`, чтобы отделять publish-flow и destructive actions.',
    status: 'ready',
    previewKey: 'ds-dropdown-menu-grouped-actions',
    code: `<script setup lang="ts">
import {
  DsButton,
  DsDropdownMenu,
  DsDropdownMenuDivider,
  DsDropdownMenuGroup,
  DsDropdownMenuItem,
} from '@feugene/granularity'
</script>

<template>
  <DsDropdownMenu width="64">
    <template #trigger>
      <DsButton>Workspace actions</DsButton>
    </template>

    <DsDropdownMenuGroup title="Publish" :uppercase="false" dividers>
      <DsDropdownMenuItem>Publish now</DsDropdownMenuItem>
      <DsDropdownMenuItem>Schedule for review</DsDropdownMenuItem>
    </DsDropdownMenuGroup>

    <DsDropdownMenuDivider />

    <DsDropdownMenuGroup title="Danger zone" :uppercase="false" dividers>
      <DsDropdownMenuItem variant="danger">Delete draft</DsDropdownMenuItem>
    </DsDropdownMenuGroup>
  </DsDropdownMenu>
</template>`,
  },
  {
    id: 'dropdown-menu-shortcut-grid',
    title: 'Shortcut cheat-sheet grid',
    description: 'Показываем `DsDropdownMenuColumns` и `DsDropdownMenuColumn` для двухколоночных shortcut/metadata layouts внутри overlay.',
    status: 'ready',
    previewKey: 'ds-dropdown-menu-shortcut-grid',
    code: `<script setup lang="ts">
import {
  DsButton,
  DsDropdownMenu,
  DsDropdownMenuColumn,
  DsDropdownMenuColumns,
} from '@feugene/granularity'
</script>

<template>
  <DsDropdownMenu width="64" align="left" :close-on-content-click="false">
    <template #trigger>
      <DsButton variant="outline">Open shortcut map</DsButton>
    </template>

    <DsDropdownMenuColumns>
      <DsDropdownMenuColumn align="left">Search</DsDropdownMenuColumn>
      <DsDropdownMenuColumn align="right">⌘K</DsDropdownMenuColumn>
      <DsDropdownMenuColumn align="left">Save draft</DsDropdownMenuColumn>
      <DsDropdownMenuColumn align="right">⌘S</DsDropdownMenuColumn>
    </DsDropdownMenuColumns>
  </DsDropdownMenu>
</template>`,
  },
]
