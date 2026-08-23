<script setup lang="ts">
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

// Имитация похода на сервер: палитра не фильтрует сама (`:filterable="false"`),
// список приходит снаружи.
function onSearch(query: string): void {
  if (searchTimer)
    clearTimeout(searchTimer)

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
        {{ query ? `Nothing found for “${query}”` : 'Start typing to search' }}
      </template>
    </GrCommandPalette>
  </div>
</template>
