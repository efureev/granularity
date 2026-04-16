<script setup lang="ts">
import {
  DsButton,
  DsDropdownMenu,
  DsDropdownMenuColumn,
  DsDropdownMenuColumns,
} from '@feugene/granularity'

const shortcuts = [
  { action: 'Search', hotkey: '⌘K' },
  { action: 'Save draft', hotkey: '⌘S' },
  { action: 'Assign owner', hotkey: 'A' },
  { action: 'Archive', hotkey: '⌘⌫' },
]
</script>

<template>
  <DsDropdownMenu width="64" align="left" :close-on-content-click="false">
    <template #trigger="{ open }">
      <DsButton variant="outline">
        {{ open ? 'Hide shortcut map' : 'Open shortcut map' }}
      </DsButton>
    </template>

    <DsDropdownMenuColumns>
      <template v-for="shortcut in shortcuts" :key="shortcut.action">
        <DsDropdownMenuColumn align="left">
          <span class="text-sm text-[var(--fg)]">{{ shortcut.action }}</span>
        </DsDropdownMenuColumn>
        <DsDropdownMenuColumn align="right">
          <code class="rounded bg-[var(--muted)] px-2 py-1 text-xs text-[var(--muted-fg)]">{{ shortcut.hotkey }}</code>
        </DsDropdownMenuColumn>
      </template>
    </DsDropdownMenuColumns>
  </DsDropdownMenu>
</template>