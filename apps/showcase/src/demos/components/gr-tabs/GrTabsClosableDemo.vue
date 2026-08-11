<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrTabs, type GrTab } from '@feugene/granularity'

const initial: GrTab[] = [
  { value: 'readme', label: 'README.md', icon: 'i-lucide-pin', closable: false },
  { value: 'index', label: 'index.ts' },
  { value: 'styles', label: 'styles.css' },
  { value: 'config', label: 'vite.config.ts' },
]

const tabs = ref<GrTab[]>([...initial])
const currentTab = ref('index')

/**
 * Компонент эмитит только `close`: список — проп, и закрытие может не
 * состояться («сохранить изменения?»). Выбор соседа тоже за потребителем.
 */
function close(value: string) {
  const index = tabs.value.findIndex(tab => tab.value === value)
  if (index < 0) return

  tabs.value.splice(index, 1)

  if (currentTab.value === value)
    currentTab.value = tabs.value[index]?.value ?? tabs.value[index - 1]?.value ?? ''
}

function closeAll() {
  tabs.value = []
  currentTab.value = ''
}

function restore() {
  tabs.value = [...initial]
  currentTab.value = 'index'
}
</script>

<template>
  <div class="grid gap-3">
    <GrTabs
      v-model="currentTab"
      :tabs="tabs"
      closable
      variant="line"
      empty-text="No open files"
      @close="close"
    />

    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" variant="secondary" :disabled="tabs.length === initial.length" @click="restore">
        Reopen all
      </GrButton>

      <GrButton size="sm" variant="ghost-border" :disabled="tabs.length === 0" @click="closeAll">
        Close all
      </GrButton>

      <span class="text-sm text-[var(--gr-muted-fg)]">
        README.md is pinned (<code>closable: false</code>) and stays put — "Close all" empties the list to show the
        empty row. Click the close icon, or focus a tab and press <kbd>Delete</kbd>.
      </span>
    </div>
  </div>
</template>
