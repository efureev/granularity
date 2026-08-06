<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrCommandPalette, type GrCommandItem } from '@feugene/granularity'

const open = ref(false)
const lastCommand = ref<string | null>(null)

// История выбора: последние три команды поднимаются наверх, пока запрос пуст.
const recentIds = ref<string[]>(['theme', 'invite'])

const commands: GrCommandItem[] = [
  { id: 'new-doc', label: 'New document', icon: 'i-lucide-file-plus', group: 'File', keywords: ['create'] },
  { id: 'open', label: 'Open…', description: 'Recent files', icon: 'i-lucide-folder-open', group: 'File' },
  { id: 'export', label: 'Export to PDF', icon: 'i-lucide-download', group: 'File' },
  { id: 'invite', label: 'Invite a teammate', icon: 'i-lucide-user-plus', group: 'Team' },
  { id: 'theme', label: 'Toggle theme', description: 'Dark or light', icon: 'i-lucide-moon', group: 'Settings' },
  { id: 'billing', label: 'Billing', description: 'Plan and invoices', icon: 'i-lucide-credit-card', group: 'Settings' },
]

function onSelect(item: GrCommandItem) {
  lastCommand.value = item.label
  recentIds.value = [item.id, ...recentIds.value.filter(id => id !== item.id)].slice(0, 3)
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton variant="outline" @click="open = true">
        Открыть палитру
      </GrButton>
      <GrBadge size="sm">
        {{ lastCommand ?? 'команда не выбрана' }}
      </GrBadge>
    </div>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Недавние: {{ recentIds.join(', ') || '—' }} · начните печатать — секция уступит место
      результатам, а совпадения подсветятся
    </div>

    <GrCommandPalette
      v-model="open"
      :items="commands"
      :recent-ids="recentIds"
      hotkey=""
      @select="onSelect"
    />
  </div>
</template>
