import type { ShowcaseComponentExampleDoc } from '../types'

export const grSelectExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'select-remote-search',
    title: 'Удалённый поиск, теги и события',
    description: '`v-model:search` + `@search` для подгрузки с сервера, `maxTagCount` для длинного выбора и события `change`/`clear`/`visible-change`.',
    status: 'ready',
    previewKey: 'gr-select-remote-search',
    code: `<script setup lang="ts">
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

// Запрос уходит наружу — без этого \`loading\` было не с чем связать.
async function fetchOptions(search: string): Promise<void> {
  const id = ++requestId
  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 400))
  if (id !== requestId) return

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
      @visible-change="lastEvent = $event ? 'opened' : 'closed'"
    />

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Запрос: <span class="font-semibold text-[var(--gr-fg)]">{{ query || '—' }}</span> ·
      выбрано: <span class="font-semibold text-[var(--gr-fg)]">{{ value.length }}</span> ·
      последнее событие: <span class="font-semibold text-[var(--gr-fg)]">{{ lastEvent }}</span>.
      Хвост чипов свёрнут в «+N», крестики достижимы \`Tab\`.
    </div>
  </div>
</template>`,
  },
  {
    id: 'select-builder',
    title: 'Interactive select constructor',
    description: 'Живой playground для всех ключевых пропсов `GrSelect`: меняйте `view`, `size`, `optionsView`, `variant`, `underline` и состояния (multiple/clearable/disabled/allow-custom-value) без переключения между отдельными demo-картами.',
    status: 'ready',
    previewKey: 'gr-select-builder',
    code: '',
    note: 'Лучший формат для дизайн-ревью и QA: один сценарий сразу покрывает весь контракт пропсов и помогает быстро проверить native/panel-режимы и link-стилизацию.',
  },
  {
    id: 'select-native-modes',
    title: 'Native single and clearable',
    description: 'Базовый сценарий для `GrSelect`: обычный single-select и clearable режим в native-rendering без дополнительной composition-логики.',
    status: 'ready',
    previewKey: 'gr-select-native-modes',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const options = [
  { value: 'alpha', label: 'Alpha workspace' },
  { value: 'beta', label: 'Beta workspace' },
  { value: 'gamma', label: 'Gamma workspace' },
]

const nativeValue = ref('')
const clearableValue = ref('beta')

// Значения-объекты: \`valueKey\` даёт стабильный ключ, поэтому модель может
// приходить отдельной копией — сравнение идёт по \`id\`, а не по ссылке.
type Owner = { id: number, name: string }

const owners: Owner[] = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Grace Hopper' },
]

const ownerOptions = owners.map(owner => ({ value: owner, label: owner.name }))
const owner = ref<Owner>({ id: 2, name: 'Grace Hopper' })

const region = ref('')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Native single
      </div>
      <GrSelect
        v-model="nativeValue"
        :options="options"
        placeholder="Pick workspace"
        aria-label="Pick workspace"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        value: {{ nativeValue || '—' }}
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Native clearable
      </div>
      <GrSelect
        v-model="clearableValue"
        clearable
        :options="options"
        placeholder="Pick owner"
        aria-label="Pick owner"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        value: {{ clearableValue || '—' }}
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Object values
      </div>
      <GrSelect
        v-model="owner"
        :options="ownerOptions"
        value-key="id"
        placeholder="Pick owner"
        aria-label="Pick owner (object value)"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        value: #{{ owner.id }} — {{ owner.name }}
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Validation state
      </div>
      <GrSelect
        v-model="region"
        :options="[{ value: 'eu', label: 'EU' }, { value: 'us', label: 'US' }]"
        :invalid="region === ''"
        :state="region === '' ? 'default' : 'success'"
        placeholder="Pick region"
        aria-label="Pick region"
      />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        {{ region === '' ? 'Region is required' : 'Looks good' }}
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'select-panel-multiple',
    title: 'Panel mode for multiple selection',
    description: 'Отдельно показываем `optionsView="panel"` вместе с `multiple`, чтобы было видно поведение dropdown-панели как mini-picker.',
    status: 'ready',
    previewKey: 'gr-select-panel-multiple',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const options = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Platform' },
  { value: 'billing', label: 'Billing' },
  { value: 'support', label: 'Support' },
]

const selectedTeams = ref<string[]>(['design', 'platform'])
</script>

<template>
  <GrSelect
    v-model="selectedTeams"
    multiple
    optionsView="panel"
    :close-on-select="false"
    :options="options"
    placeholder="Pick teams"
    aria-label="Pick teams"
  />
</template>`,
    note: 'Этот сценарий помогает быстро проверить panel-behavior, множественный выбор и то, как компонент ведёт себя в формах фильтров.',
  },
  {
    id: 'select-groups',
    title: 'Grouped options',
    description: 'Опции можно группировать в стандартном формате `{ label, options: [{ value, label }] }`. В `optionsView="native"` группы рендерятся как нативные `<optgroup>`, а в `optionsView="panel"` — как заголовки групп внутри dropdown-панели.',
    status: 'ready',
    previewKey: 'gr-select-groups',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const groupedOptions = [
  {
    label: 'Popular cities',
    options: [
      { value: 'Shanghai', label: 'Shanghai' },
      { value: 'Beijing', label: 'Beijing' },
    ],
  },
  {
    label: 'City name',
    options: [
      { value: 'Chengdu', label: 'Chengdu' },
      { value: 'Shenzhen', label: 'Shenzhen' },
      { value: 'Guangzhou', label: 'Guangzhou' },
      { value: 'Dalian', label: 'Dalian' },
    ],
  },
]

const nativeCity = ref('Beijing')
const panelCity = ref('Chengdu')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrSelect
      v-model="nativeCity"
      :options="groupedOptions"
      placeholder="Pick a city"
      aria-label="Pick a city (native)"
    />

    <GrSelect
      v-model="panelCity"
      optionsView="panel"
      :options="groupedOptions"
      placeholder="Pick a city"
      aria-label="Pick a city (panel)"
    />
  </div>
</template>`,
    note: 'Группы поддерживаются в обоих режимах отображения и смешиваются с плоскими опциями; в panel-режиме фильтрация по custom-value скрывает пустые группы.',
  },
  {
    id: 'select-custom-value',
    title: 'Custom value and value slot',
    description: 'Сложный режим для cases, где пользователь может добавить свой вариант и одновременно кастомизировать отображение выбранного значения.',
    status: 'ready',
    previewKey: 'gr-select-custom-value',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrSelect } from '@feugene/granularity'

const options = [
  { value: 'ru', label: 'Russia' },
  { value: 'kz', label: 'Kazakhstan' },
  { value: 'uz', label: 'Uzbekistan' },
]

const region = ref('')
</script>

<template>
  <GrSelect
    v-model="region"
    optionsView="panel"
    allow-custom-value
    :options="options"
    placeholder="Pick or add region"
    aria-label="Pick or add region"
  >
    <template #value="{ displayLabel, hasSelection, placeholder }">
      <span v-if="hasSelection" class="inline-flex items-center gap-2">
        <GrBadge>custom</GrBadge>
        <span>{{ displayLabel }}</span>
      </span>
      <span v-else>{{ placeholder }}</span>
    </template>
  </GrSelect>
</template>`,
    note: 'Именно этот режим критичен для демо complex-компонента: здесь одновременно видны custom input, panel dropdown и slot-based composition.',
  },
  {
    id: 'select-filter-loading-tags',
    title: 'Filter, loading and tag mode',
    description: 'Три доработки panel-режима: `filterable` добавляет поле поиска над списком (независимо от `allow-custom-value`), `loading` показывает индикатор загрузки вместо опций (для удалённой подгрузки), а `tags` рендерит выбор `multiple` как удаляемые chips вместо строки «a, b, c».',
    status: 'ready',
    previewKey: 'gr-select-filter-loading-tags',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrSelect } from '@feugene/granularity'

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
]

const country = ref('')
const teams = ref<string[]>(['us', 'de'])

const asyncOptions = ref<Array<{ value: string, label: string }>>([])
const loading = ref(false)

function loadOptions() {
  loading.value = true
  asyncOptions.value = []
  setTimeout(() => {
    asyncOptions.value = countries
    loading.value = false
  }, 1200)
}
</script>

<template>
  <!-- Поиск по опциям -->
  <GrSelect
    v-model="country"
    options-view="panel"
    filterable
    clearable
    :options="countries"
    placeholder="Pick a country"
  />

  <!-- Загрузка опций -->
  <GrSelect
    v-model="country"
    options-view="panel"
    filterable
    :loading="loading"
    :options="asyncOptions"
    placeholder="Open to load…"
  />

  <!-- Теги (multiple как chips) -->
  <GrSelect
    v-model="teams"
    multiple
    tags
    filterable
    options-view="panel"
    :close-on-select="false"
    :options="countries"
    placeholder="Pick countries"
  />
</template>`,
    note: 'filterable/loading/tags форсят panel-режим (в нативном `<select>` они невозможны). Поиск и подгрузка комбинируются: пока `loading` — список скрыт, дальше работает клиентская фильтрация.',
  },
]
