import type { ShowcaseComponentExampleDoc } from '../types'

export const grCommandPaletteExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'command-palette-basic',
    title: 'Commands with groups and shortcuts',
    description: 'Палитра открывается по ⌘K (Ctrl+K вне macOS) или программно через `v-model`. Команды группируются полем `group`, ищутся по метке, описанию и `keywords`. Команда «Toggle theme» здесь настоящая: переключает тему через `useTheme()`, а её сочетание ⌘J повешено директивой `v-hotkey` — работает и без открытия палитры.',
    status: 'ready',
    previewKey: 'gr-command-palette-basic',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrCommandPalette, GrKbd, useTheme, vHotkey, type GrCommandItem } from '@feugene/granularity'

const open = ref(false)
const lastCommand = ref<string | null>(null)

// Команда «Toggle theme» настоящая: переключает тему витрины через \`useTheme()\`.
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
// \`v-hotkey\` вешает глобальный слушатель (Meta — macOS, Ctrl — остальные).
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
</template>`,
    note: 'Поле ввода — `role="combobox"`, список — `role="listbox"`, активная команда указывается через `aria-activedescendant`: фокус не покидает поиск.',
  },
  {
    id: 'command-palette-async',
    title: 'Remote search',
    description: '`:filterable="false"` отдаёт фильтрацию наружу: палитра эмитит `search`, владелец подставляет результаты и `loading`. `:hotkey="null"` отключает глобальное сочетание.',
    status: 'ready',
    previewKey: 'gr-command-palette-async',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCommandPalette, type GrCommandItem } from '@feugene/granularity'

const open = ref(false)
const loading = ref(false)
const results = ref<GrCommandItem[]>([])

const catalog: GrCommandItem[] = [
  { id: 'u-1', label: 'Anna Kovalenko', description: 'Design · Berlin', icon: 'i-lucide-user', group: 'People' },
  { id: 'u-2', label: 'Mark Tarasov', description: 'Backend · Tbilisi', icon: 'i-lucide-user', group: 'People' },
  { id: 'p-1', label: 'Onboarding revamp', description: 'Project · in progress', icon: 'i-lucide-folder', group: 'Projects' },
  { id: 'p-2', label: 'Pricing page A/B', description: 'Project · planned', icon: 'i-lucide-folder', group: 'Projects' },
  { id: 'd-1', label: 'Q3 report.pdf', description: 'Document · 2.4 MB', icon: 'i-lucide-file-text', group: 'Documents' },
]

let searchTimer: ReturnType<typeof setTimeout> | null = null

// Имитация похода на сервер: палитра не фильтрует сама (\`:filterable="false"\`),
// список приходит снаружи.
function onSearch(query: string): void {
  if (searchTimer) clearTimeout(searchTimer)

  if (!query) {
    loading.value = false
    results.value = []
    return
  }

  loading.value = true
  searchTimer = setTimeout(() => {
    const needle = query.toLowerCase()
    results.value = catalog.filter(item =>
      item.label.toLowerCase().includes(needle) || item.description?.toLowerCase().includes(needle),
    )
    loading.value = false
  }, 600)
}
</script>

<template>
  <div class="grid gap-4">
    <GrButton variant="outline" @click="open = true">
      Search the workspace
    </GrButton>

    <GrCommandPalette
      v-model="open"
      :items="results"
      :filterable="false"
      :loading="loading"
      :hotkey="null"
      placeholder="Search people, projects, documents…"
      @search="onSearch"
    >
      <template #empty="{ query }">
        {{ query ? \`Nothing found for “\${query}”\` : 'Start typing to search' }}
      </template>
    </GrCommandPalette>
  </div>
</template>`,
  },
]
