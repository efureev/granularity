<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrCommandPalette, GrKbd, useTheme, vHotkey, type GrCommandItem } from '@feugene/granularity'

const open = ref(false)
const lastCommand = ref<string | null>(null)

// Команда «Toggle theme» настоящая: переключает тему витрины через `useTheme()`.
const { isDark, toggleTheme } = useTheme()

const commands = computed<GrCommandItem[]>(() => [
  { id: 'new-doc', label: 'New document', icon: 'i-lucide-file-plus', group: 'File', shortcut: ['⌘', 'N'], keywords: ['create'] },
  { id: 'open', label: 'Open…', description: 'Recent files', icon: 'i-lucide-folder-open', group: 'File', shortcut: ['⌘', 'O'] },
  { id: 'export', label: 'Export to PDF', icon: 'i-lucide-download', group: 'File' },
  { id: 'invite', label: 'Invite a teammate', icon: 'i-lucide-user-plus', group: 'Team' },
  { id: 'roles', label: 'Manage roles', icon: 'i-lucide-shield-check', group: 'Team' },
  {
    id: 'theme',
    label: 'Toggle theme',
    description: isDark.value ? 'Now: dark' : 'Now: light',
    icon: isDark.value ? 'i-lucide-sun' : 'i-lucide-moon',
    group: 'Settings',
    shortcut: ['⌘', 'J'],
    keywords: ['dark', 'light'],
  },
  { id: 'billing', label: 'Billing', description: 'Plan and invoices', icon: 'i-lucide-credit-card', group: 'Settings' },
  { id: 'archive', label: 'Archive workspace', icon: 'i-lucide-archive', group: 'Settings', disabled: true },
])

function onSelect(item: GrCommandItem): void {
  lastCommand.value = item.label
  if (item.id === 'theme') toggleTheme()
}

// Сочетание, которое палитра только показывает, здесь работает по-настоящему:
// `v-hotkey` вешает глобальный слушатель (Meta — macOS, Ctrl — остальные).
const hotkeys = {
  'Meta+J': toggleTheme,
  'Ctrl+J': toggleTheme,
}
</script>

<template>
  <div v-hotkey="hotkeys" class="grid gap-4">
    <div class="flex items-center gap-3">
      <GrButton @click="open = true">
        Open palette
      </GrButton>
      <span class="text-sm text-[var(--gr-muted-fg)]">
        or press <GrKbd size="sm">⌘</GrKbd> <GrKbd size="sm">K</GrKbd>
      </span>
    </div>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Last command: <code>{{ lastCommand ?? '—' }}</code> · theme: <code>{{ isDark ? 'dark' : 'light' }}</code>
      — try <GrKbd size="sm">⌘</GrKbd> <GrKbd size="sm">J</GrKbd> without opening the palette.
    </p>

    <GrCommandPalette v-model="open" :items="commands" @select="onSelect">
      <template #footer>
        <span class="flex items-center gap-1"><GrKbd size="sm">↑</GrKbd><GrKbd size="sm">↓</GrKbd> to navigate</span>
        <span class="flex items-center gap-1"><GrKbd size="sm">↵</GrKbd> to run</span>
        <span class="flex items-center gap-1"><GrKbd size="sm">Esc</GrKbd> to close</span>
      </template>
    </GrCommandPalette>
  </div>
</template>
