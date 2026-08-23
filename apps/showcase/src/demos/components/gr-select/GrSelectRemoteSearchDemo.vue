<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const CATALOG = [
  { value: 'ams', label: 'Amsterdam' },
  { value: 'ber', label: 'Berlin' },
  { value: 'bcn', label: 'Barcelona' },
  { value: 'lis', label: 'Lisbon' },
  { value: 'prg', label: 'Prague' },
  { value: 'waw', label: 'Warsaw' },
]

const value = ref<string[]>(['ams', 'ber', 'bcn'])
const query = ref('')
const options = ref(CATALOG)
const loading = ref(false)
const lastEvent = ref('—')

let requestId = 0

// Запрос уходит наружу — без этого `loading` было не с чем связать.
async function fetchOptions(search: string): Promise<void> {
  const id = ++requestId
  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 400))
  if (id !== requestId)
    return

  options.value = CATALOG.filter(option => option.label.toLowerCase().includes(search.trim().toLowerCase()))
  loading.value = false
}
</script>

<template>
  <div class="grid gap-3">
    <GrSelect
      v-model="value"
      v-model:search="query"
      :options="options"
      :loading="loading"
      :max-tag-count="2"
      multiple
      tags
      filterable
      options-view="panel"
      clearable
      aria-label="Cities"
      placeholder="Pick cities"
      @search="fetchOptions"
      @change="lastEvent = 'change'"
      @clear="lastEvent = 'clear'"
      @update:open="lastEvent = $event ? 'opened' : 'closed'"
    />

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Запрос: <span class="font-semibold text-[var(--gr-fg)]">{{ query || '—' }}</span> ·
      выбрано: <span class="font-semibold text-[var(--gr-fg)]">{{ value.length }}</span> ·
      последнее событие: <span class="font-semibold text-[var(--gr-fg)]">{{ lastEvent }}</span>.
      Хвост чипов свёрнут в «+N», крестики достижимы `Tab`.
    </div>
  </div>
</template>
