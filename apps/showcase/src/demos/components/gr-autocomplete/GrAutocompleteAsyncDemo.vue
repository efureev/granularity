<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete, type GrAutocompleteOption } from '@feugene/granularity'

// Игрушечная «база» пользователей — эмулируем удалённый поиск с задержкой.
const DIRECTORY: GrAutocompleteOption[] = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'alan', label: 'Alan Turing' },
  { value: 'grace', label: 'Grace Hopper' },
  { value: 'linus', label: 'Linus Torvalds' },
  { value: 'margaret', label: 'Margaret Hamilton' },
  { value: 'dennis', label: 'Dennis Ritchie' },
  { value: 'ken', label: 'Ken Thompson' },
  { value: 'barbara', label: 'Barbara Liskov' },
]

const user = ref('')
const options = ref<GrAutocompleteOption[]>([])
const loading = ref(false)

let requestId = 0

async function onSearch(query: string): Promise<void> {
  if (!query) {
    options.value = []
    loading.value = false
    return
  }

  const current = ++requestId
  loading.value = true

  // Эмуляция сетевого запроса.
  await new Promise(resolve => setTimeout(resolve, 500))

  // Отбрасываем ответы, если пришёл более свежий запрос (защита от гонок).
  if (current !== requestId) return

  const needle = query.toLowerCase()
  options.value = DIRECTORY.filter(o => o.label.toLowerCase().includes(needle))
  loading.value = false
}
</script>

<template>
  <div class="grid gap-3">
    <GrAutocomplete
      v-model="user"
      :options="options"
      :loading="loading"
      :filterable="false"
      :min-query-length="1"
      clearable
      placeholder="Search people (async)…"
      aria-label="Search people"
      @search="onSearch"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Options are fetched remotely via the debounced <code>@search</code> event; <code>:loading</code>
      drives the spinner and loading row. Stale responses are discarded to avoid races.
    </p>
  </div>
</template>
