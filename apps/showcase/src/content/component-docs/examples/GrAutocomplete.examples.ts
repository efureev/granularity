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
    description: 'Для удалённого поиска отключите локальную фильтрацию (`:filterable="false"`) и подпишитесь на дебаунснутое событие `search`: родитель загружает опции и управляет `:loading`. `min-query-length` откладывает запрос до нужной длины, а stale-ответы отбрасываются для защиты от гонок.',
    status: 'ready',
    previewKey: 'gr-autocomplete-async',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrAutocomplete, type GrAutocompleteOption } from '@feugene/granularity'

const user = ref('')
const options = ref<GrAutocompleteOption[]>([])
const loading = ref(false)
let requestId = 0

async function onSearch(query: string): Promise<void> {
  if (!query) {
    options.value = []
    return
  }

  const current = ++requestId
  loading.value = true
  const found = await fetchUsers(query) // ваш API-вызов
  if (current !== requestId) return // отбросить устаревший ответ

  options.value = found
  loading.value = false
}
</script>

<template>
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
</template>`,
    note: 'Компонент не завязан на конкретный транспорт: он лишь эмитит запрос и рендерит состояния loading / no-results, а загрузку данных полностью контролирует потребитель.',
  },
]
