<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { grThemeCatalog } from '@feugene/granularity-tokens'

import { renderInline, type ComparisonTable } from '../docs'

const props = defineProps<{
  table: ComparisonTable
  /** id темы адреса: её столбец подсвечен. */
  current: string
}>()

const route = useRoute()
const idByTitle = new Map(grThemeCatalog.map(theme => [theme.title, theme.id]))
const currentIndex = computed(() => props.table.columns.findIndex(column => idByTitle.get(column) === props.current))
</script>

<template>
  <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Сравнение тем">
    <table class="w-full min-w-[760px] border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
      <thead>
        <tr>
          <th class="w-[160px] border-b border-[var(--gr-brd)] px-4 py-3 text-start font-500 text-[var(--gr-muted-fg)]" scope="col">
            <span class="sr-only">Свойство</span>
          </th>
          <th
            v-for="(column, index) in table.columns"
            :key="column"
            scope="col"
            class="border-b border-[var(--gr-brd)] px-4 py-3 text-start text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]"
            :class="index === currentIndex ? 'bg-[var(--gr-accent)] text-[var(--gr-accent-fg)]' : ''"
          >
            <RouterLink
              v-if="idByTitle.has(column)"
              class="comparison-link"
              :to="{ params: { theme: idByTitle.get(column) }, query: route.query }"
            >
              {{ column }}
            </RouterLink>
            <template v-else>
              {{ column }}
            </template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.rows" :key="row.label">
          <th scope="row" class="border-b border-[var(--gr-brd)] px-4 py-3 text-start align-top font-500 text-[var(--gr-muted-fg)]">
            {{ row.label }}
          </th>
          <td
            v-for="(cell, index) in row.cells"
            :key="index"
            class="border-b border-[var(--gr-brd)] px-4 py-3 align-top"
            :class="index === currentIndex ? 'bg-[color-mix(in_srgb,var(--gr-accent)_55%,transparent)]' : ''"
          >
            <!-- eslint-disable-next-line vue/no-v-html -- ячейка документа репозитория: `code` и выделение -->
            <span v-html="renderInline(cell)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.comparison-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
  text-underline-offset: 3px;
}

.comparison-link:hover {
  text-decoration-color: currentColor;
}

.comparison-link:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
  border-radius: var(--gr-radius-xs);
}
</style>
