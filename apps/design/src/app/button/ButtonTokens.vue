<script setup lang="ts">
import { computed, ref } from 'vue'

import { grComponentTokens } from '@feugene/granularity/tokens'
import themeManifest from 'virtual:granum/themes'
import IconSearch from '~icons/lucide/search'

import { groupTokenRows, type ThemeTokenRow, themeTokenRows } from '../componentTokens'
import TokenTable from '../parts/TokenTable.vue'
import { plural } from '../plural'
import type { TokenTableSection } from '../themeTokens'
import { modeColumns } from '../themes'
import { useViewedTheme } from '../viewedTheme'
import { buttonTokenGroups, tokenTone, tones } from './model'

const OWNERS = ['GrButton', 'GrButtonGroup']

const theme = useViewedTheme()
const tokens = grComponentTokens.filter(token => OWNERS.includes(token.owner))

const modes = computed(() => modeColumns(themeManifest, theme.value.id))
const rows = computed(() => themeTokenRows(tokens, theme.value.data))

const search = ref('')
const tone = ref('primary')
const toneOptions = tones.filter(item => item.id !== 'neutral').map(item => ({ value: item.id, label: item.id }))

const query = computed(() => search.value.trim().toLowerCase())
function matches(row: ThemeTokenRow): boolean {
  return query.value === ''
    || row.token.name.includes(query.value)
    || row.token.description.toLowerCase().includes(query.value)
}

/** Тоновые токены — по одному тону: семь одинаковых наборов подряд читать незачем. Поиск ищет по всем. */
const visible = computed(() => rows.value.filter((row) => {
  const rowTone = tokenTone(row.token.name)
  return matches(row) && (query.value !== '' || rowTone === undefined || rowTone === tone.value)
}))

const sections = computed<TokenTableSection[]>(() => {
  const grouped = groupTokenRows(visible.value, buttonTokenGroups).groups
  return buttonTokenGroups
    .map(group => ({
      id: group.id,
      title: group.id === 'tone' && query.value === '' ? `${group.title}: ${tone.value}` : group.title,
      rows: (grouped.get(group.id) ?? []).map(row => ({ name: row.token.name, description: row.token.description, value: row.root, modes: row.modes, preview: row.preview })),
    }))
    .filter(section => section.rows.length > 0)
})

const themeCount = computed(() => plural(rows.value.length, ['токен', 'токена', 'токенов']))
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="flex max-w-[64ch] flex-col gap-1">
        <h2 class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">
          Значения темы «{{ theme.data.title }}»
        </h2>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ themeCount }} вида <code class="font-[var(--gr-font-mono)]">theme</code>: имена — контракт кнопки,
          значения — у темы. Образцы посчитаны браузером под парой своего режима.
        </p>
      </div>
      <div class="flex flex-wrap items-end gap-3">
        <GrFormField label="Поиск" size="sm" class="w-[260px]">
          <GrInput v-model="search" type="search" size="sm" clearable placeholder="имя или описание">
            <template #prefix>
              <GrIcon><IconSearch /></GrIcon>
            </template>
          </GrInput>
        </GrFormField>
        <GrFormField label="Тон" size="sm" class="w-[160px]">
          <GrSelect v-model="tone" size="sm" :options="toneOptions" :disabled="query !== ''" />
        </GrFormField>
      </div>
    </div>

    <TokenTable :sections="sections" :modes="modes" />

    <GrEmptyState
      v-if="sections.length === 0"
      title="Ничего не нашлось"
      :description="`Нет токенов темы с «${search.trim()}» в имени или описании.`"
    />
  </div>
</template>
