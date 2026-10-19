<script setup lang="ts">
import { computed } from 'vue'

import { renderInline, type ComparisonTable } from '../docs'

const props = defineProps<{
  table: ComparisonTable
  /** Заголовок столбца выбранной версии. */
  current: string
}>()

const currentIndex = computed(() => props.table.columns.indexOf(props.current))
</script>

<template>
  <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Сравнение версий">
    <table class="w-full min-w-[720px] border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
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
            :aria-current="index === currentIndex ? 'true' : undefined"
          >
            {{ column }}
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
