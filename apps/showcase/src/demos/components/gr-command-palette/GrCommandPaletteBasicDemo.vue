<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCommandPalette, GrKbd, type GrCommandItem } from '@feugene/granularity'

const open = ref(false)
const lastCommand = ref<string | null>(null)

const commands: GrCommandItem[] = [
  { id: 'new-doc', label: 'New document', icon: 'i-lucide-file-plus', group: 'File', shortcut: ['⌘', 'N'], keywords: ['create'] },
  { id: 'open', label: 'Open…', description: 'Recent files', icon: 'i-lucide-folder-open', group: 'File', shortcut: ['⌘', 'O'] },
  { id: 'export', label: 'Export to PDF', icon: 'i-lucide-download', group: 'File' },
  { id: 'invite', label: 'Invite a teammate', icon: 'i-lucide-user-plus', group: 'Team' },
  { id: 'roles', label: 'Manage roles', icon: 'i-lucide-shield-check', group: 'Team' },
  { id: 'theme', label: 'Toggle theme', icon: 'i-lucide-moon', group: 'Settings', shortcut: ['⌘', 'J'] },
  { id: 'billing', label: 'Billing', description: 'Plan and invoices', icon: 'i-lucide-credit-card', group: 'Settings' },
  { id: 'archive', label: 'Archive workspace', icon: 'i-lucide-archive', group: 'Settings', disabled: true },
]

function onSelect(item: GrCommandItem): void {
  lastCommand.value = item.label
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <GrButton @click="open = true">
        Open palette
      </GrButton>
      <span class="text-sm text-[var(--gr-muted-fg)]">
        or press <GrKbd size="sm">⌘</GrKbd> <GrKbd size="sm">K</GrKbd>
      </span>
    </div>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Last command: <code>{{ lastCommand ?? '—' }}</code>
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
