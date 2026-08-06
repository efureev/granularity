import type { ShowcaseComponentExampleDoc } from '../types'

export const grAutocompleteExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'autocomplete-basic',
    title: 'Filterable single select',
    description: 'Базовый сценарий: текстовый `<input role="combobox">` фильтрует опции по мере ввода (локальная фильтрация), `clearable` очищает выбор. Стрелки/Enter/Home/End работают с клавиатуры, активная опция подсвечивается через `aria-activedescendant`.',
    status: 'ready',
    previewKey: 'gr-autocomplete-basic',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete } from '@feugene/granularity'

const options = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular' },
]

const framework = ref('')
</script>

<template>
  <GrAutocomplete
    v-model="framework"
    :options="options"
    clearable
    placeholder="Search a framework…"
    aria-label="Search a framework"
  />
</template>`,
    note: 'В отличие от GrSelect, combobox-ом здесь является сам инпут: набранный текст — это поисковый запрос, а выбор опции заполняет поле.',
  },
  {
    id: 'autocomplete-multiple',
    title: 'Multiple with removable chips',
    description: 'Режим `multiple` рендерит выбранные значения как удаляемые chips перед инпутом. Backspace при пустом запросе удаляет последний тег, а `allow-custom-value` позволяет добавить значение, которого нет в списке (Enter).',
    status: 'ready',
    previewKey: 'gr-autocomplete-multiple',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete } from '@feugene/granularity'

const options = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Platform' },
  { value: 'billing', label: 'Billing' },
  { value: 'support', label: 'Support' },
]

const teams = ref<string[]>(['design', 'platform'])
</script>

<template>
  <GrAutocomplete
    v-model="teams"
    multiple
    :options="options"
    allow-custom-value
    :close-on-select="false"
    clearable
    placeholder="Add teams…"
    aria-label="Add teams"
  />
</template>`,
    note: 'Это ключевое отличие от GrSelect multiple, который показывает выбор строкой «a, b, c»: здесь каждый выбор — самостоятельный интерактивный chip.',
  },
  {
    id: 'autocomplete-async',
    title: 'Async remote loading',
    description: 'Удалённый поиск ведёт сам компонент: `fetch-options` дебаунсится, предыдущий запрос отменяется через `AbortSignal`, а ответ на устаревший запрос игнорируется — при быстром вводе в списке всегда результат последнего запроса. Локальную фильтрацию и `loading` в этом режиме компонент берёт на себя, `min-query-length` откладывает запрос до нужной длины.',
    status: 'ready',
    previewKey: 'gr-autocomplete-async',
    code: `<script setup lang="ts">
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
</template>`,
    note: 'Если запрос ведёт само приложение (свой стор, кэш, своя отмена), остаётся прежний путь — дебаунснутое событие `search` плюс внешние `:options` и `:loading`.',
  },
]
