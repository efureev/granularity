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

// Разброс задержек нарочный: короткий запрос отвечает дольше длинного, поэтому
// без отмены устаревшего в списке оказался бы ответ на предыдущий ввод.
function latencyFor(query: string): number {
  return Math.max(200, 900 - query.length * 150)
}

async function fetchPeople(query: string, signal: AbortSignal): Promise<GrAutocompleteOption[]> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, latencyFor(query))
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })

  const needle = query.toLowerCase()
  return DIRECTORY.filter(o => o.label.toLowerCase().includes(needle))
}
</script>

<template>
  <div class="grid gap-3">
    <GrAutocomplete
      v-model="user"
      :fetch-options="fetchPeople"
      :min-query-length="1"
      clearable
      placeholder="Search people (async)…"
      aria-label="Search people"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Options are fetched by the component itself: <code>fetchOptions</code> is debounced, the
      previous request is aborted through its <code>AbortSignal</code>, and a late answer to an
      outdated query never wins.
    </p>
  </div>
</template>
