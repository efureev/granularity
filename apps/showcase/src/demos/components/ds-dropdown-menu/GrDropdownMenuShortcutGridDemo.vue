<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuColumn,
  GrDropdownMenuColumns,
} from '@feugene/granularity'

const shortcuts = [
  { action: 'Search', hotkey: '⌘K' },
  { action: 'Save draft', hotkey: '⌘S' },
  { action: 'Assign owner', hotkey: 'A' },
  { action: 'Archive', hotkey: '⌘⌫' },
]
</script>

<template>
  <GrDropdownMenu width="64" align="left" :close-on-content-click="false">
    <template #trigger="{ open }">
      <GrButton variant="outline">
        {{ open ? 'Hide shortcut map' : 'Open shortcut map' }}
      </GrButton>
    </template>

    <GrDropdownMenuColumns>
      <template v-for="shortcut in shortcuts" :key="shortcut.action">
        <GrDropdownMenuColumn align="left">
          <span class="text-sm text-[var(--fg)]">{{ shortcut.action }}</span>
        </GrDropdownMenuColumn>
        <GrDropdownMenuColumn align="right">
          <code class="rounded bg-[var(--muted)] px-2 py-1 text-xs text-[var(--muted-fg)]">{{ shortcut.hotkey }}</code>
        </GrDropdownMenuColumn>
      </template>
    </GrDropdownMenuColumns>
  </GrDropdownMenu>
</template>