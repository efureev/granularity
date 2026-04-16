import type { ShowcaseComponentExampleDoc } from '../types'

export const dsTableExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'table-basic-rows',
    title: 'Basic row rendering',
    description: 'Для базовой страницы показываем canonical table markup: `#head` slot, body rows и composition с badges.',
    status: 'ready',
    previewKey: 'ds-table-basic-rows',
    code: `<script setup lang="ts">
import { DsBadge, DsTable } from '@feugene/granularity'
</script>

<template>
  <DsTable>
    <template #head>
      <tr>
        <th class="px-4 py-3 text-left font-600">Campaign</th>
        <th class="px-4 py-3 text-left font-600">Status</th>
      </tr>
    </template>

    <tr class="border-t border-[var(--brd)]">
      <td class="px-4 py-3">Spring onboarding</td>
      <td class="px-4 py-3"><DsBadge size="sm" tone="secondary">Ready</DsBadge></td>
    </tr>
  </DsTable>
</template>`,
  },
  {
    id: 'table-loading-state',
    title: 'Loading rows with skeletons',
    description: 'Закрываем data-display edge case: таблица должна выглядеть предсказуемо и в loading-state, когда данные ещё не приехали.',
    status: 'ready',
    previewKey: 'ds-table-loading-state',
    code: `<script setup lang="ts">
import { DsSkeleton, DsTable } from '@feugene/granularity'
</script>

<template>
  <DsTable>
    <template #head>
      <tr>
        <th class="px-4 py-3 text-left font-600">Task</th>
        <th class="px-4 py-3 text-left font-600">State</th>
      </tr>
    </template>

    <tr class="border-t border-[var(--brd)]">
      <td class="px-4 py-3"><DsSkeleton class="h-4 w-32" /></td>
      <td class="px-4 py-3"><DsSkeleton class="h-4 w-24" /></td>
    </tr>
  </DsTable>
</template>`,
  },
  {
    id: 'table-empty-state',
    title: 'Empty state inside tbody',
    description: 'Показываем, как `DsTable` может содержать `DsEmptyState` внутри `tbody`, не теряя table semantics и visual shell.',
    status: 'ready',
    previewKey: 'ds-table-empty-state',
    code: `<script setup lang="ts">
import { DsButton, DsEmptyState, DsTable } from '@feugene/granularity'
</script>

<template>
  <DsTable>
    <template #head>
      <tr>
        <th class="px-4 py-3 text-left font-600">Preset</th>
        <th class="px-4 py-3 text-left font-600">Owner</th>
      </tr>
    </template>

    <tr class="border-t border-[var(--brd)]">
      <td colspan="2" class="px-4 py-6">
        <DsEmptyState title="No preset rows" description="Load sample data to replace the placeholder.">
          <DsButton size="sm">Load sample data</DsButton>
        </DsEmptyState>
      </td>
    </tr>
  </DsTable>
</template>`,
  },
]
