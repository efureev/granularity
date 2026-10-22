<script setup lang="ts">
import { computed, ref } from 'vue'

import IconSearch from '~icons/lucide/search'

import TokenTable from '../parts/TokenTable.vue'
import { THEME_TOKEN_KINDS, themeTokenCount, type ThemeTokenKind, themeTokenSections } from '../themeTokens'
import type { ThemeView } from '../tokens'

/**
 * Токены самой темы — роли, примитивы, производные. Значения компонентов здесь
 * не показываются: они на странице компонента, вкладка «Токены».
 */
const props = defineProps<{
  view: ThemeView
  /** Колонки режимов; у темы вне сборки пар нет — образцов тоже. */
  modes: readonly { name: string, title: string, pair: string }[]
  previews: boolean
}>()

const kind = ref<ThemeTokenKind>('roles')
const kindOptions = THEME_TOKEN_KINDS.map(item => ({ value: item.id, label: `${item.title} · ${themeTokenCount(item.id)}` }))
const lead = computed(() => THEME_TOKEN_KINDS.find(item => item.id === kind.value)!.lead)

const search = ref('')
const query = computed(() => search.value.trim().toLowerCase())

const sections = computed(() => themeTokenSections(props.view, kind.value)
  .map(section => ({
    ...section,
    rows: section.rows
      .filter(row => query.value === '' || row.name.includes(query.value) || row.description.toLowerCase().includes(query.value))
      .map(row => (props.previews ? row : { ...row, preview: undefined })),
  }))
  .filter(section => section.rows.length > 0))
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex max-w-[64ch] flex-col gap-1">
          <h2 class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">
            Токены темы «{{ view.data.title }}»
          </h2>
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            Значения из данных темы с раскрытым наследованием. Образцы посчитаны браузером под парой своего режима.
            Значения компонентов в теме — на странице компонента, вкладка «Токены».
          </p>
        </div>
        <GrFormField label="Поиск" size="sm" class="w-[280px]">
          <GrInput v-model="search" type="search" size="sm" clearable placeholder="имя или описание">
            <template #prefix>
              <GrIcon><IconSearch /></GrIcon>
            </template>
          </GrInput>
        </GrFormField>
      </div>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--gr-brd)] pt-4">
        <GrSegmented v-model="kind" size="sm" aria-label="Вид токенов" :options="kindOptions" />
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ lead }}
        </p>
      </div>
    </div>

    <TokenTable :sections="sections" :modes="modes" :single="kind === 'foundation'" />

    <GrEmptyState
      v-if="sections.length === 0"
      title="Ничего не нашлось"
      :description="`Нет токенов с «${search.trim()}» в имени или описании.`"
    />
  </div>
</template>
