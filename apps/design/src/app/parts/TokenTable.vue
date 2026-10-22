<script setup lang="ts">
import type { TokenTableSection } from '../themeTokens'
import DocSection from './DocSection.vue'
import TokenValue from './TokenValue.vue'

/** Токены по разделам: имя с описанием и значения по режимам темы — текстом и образцом. */
defineProps<{
  sections: readonly TokenTableSection[]
  modes: readonly { name: string, title: string, pair: string }[]
  /** Значения от режима не зависят: одна колонка «значение» вместо колонок режимов. */
  single?: boolean
}>()
</script>

<template>
  <DocSection v-for="section in sections" :key="section.id" :title="`${section.title} · ${section.rows.length}`">
    <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" :aria-label="section.title">
      <table class="w-full table-fixed border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]" :class="single ? 'min-w-[640px]' : 'min-w-[820px]'">
        <colgroup>
          <col class="w-[42%]">
          <col v-if="single">
          <template v-else>
            <col v-for="mode in modes" :key="mode.name">
          </template>
        </colgroup>
        <thead>
          <tr class="text-[var(--gr-muted-fg)]">
            <th scope="col" class="px-4 py-2.5 text-start font-500">
              токен
            </th>
            <th v-if="single" scope="col" class="border-s border-[var(--gr-brd)] px-4 py-2.5 text-start font-500">
              значение
            </th>
            <template v-else>
              <th v-for="mode in modes" :key="mode.name" scope="col" class="border-s border-[var(--gr-brd)] px-4 py-2.5 text-start font-500">
                {{ mode.title }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in section.rows" :key="row.name" class="border-t border-[var(--gr-brd)]">
            <th scope="row" class="px-4 py-3 text-start align-top font-400">
              <code class="block break-all font-[var(--gr-font-mono)] text-[var(--gr-fg)]">{{ row.name }}</code>
              <span class="mt-1 block text-[var(--gr-muted-fg)]">{{ row.description }}</span>
            </th>
            <td v-if="row.value !== undefined" :colspan="single ? 1 : modes.length" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
              <TokenValue :name="row.name" :value="row.value" :preview="row.preview" :modes="modes" />
              <span v-if="!single && modes.length > 1" class="mt-1 block text-[var(--gr-muted-fg)]">во всех режимах</span>
            </td>
            <template v-else-if="!single">
              <td v-for="mode in modes" :key="mode.name" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
                <template v-if="row.modes?.[mode.name] !== undefined">
                  <TokenValue :name="row.name" :value="row.modes[mode.name]!" :preview="row.preview" :modes="[mode]" />
                  <span v-if="row.modeNotes?.[mode.name]" class="mt-1 block text-[var(--gr-muted-fg)]">{{ row.modeNotes[mode.name] }}</span>
                </template>
                <span v-else class="text-[var(--gr-danger-text)]">тема не задаёт</span>
              </td>
            </template>
            <td v-else class="border-s border-[var(--gr-brd)] px-4 py-3 align-top text-[var(--gr-danger-text)]">
              тема не задаёт
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DocSection>
</template>
