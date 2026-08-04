import type { ShowcaseComponentExampleDoc } from '../types'

export const grTableExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'table-basic-rows',
    title: 'Basic row rendering',
    description: 'Для базовой страницы показываем canonical table markup: `#head` slot, body rows и composition с badges.',
    status: 'ready',
    previewKey: 'gr-table-basic-rows',
    code: `<script setup lang="ts">
import { GrBadge, GrTable } from '@feugene/granularity'
</script>

<template>
  <GrTable>
    <template #head>
      <tr>
        <th class="px-4 py-3 text-left font-600">Campaign</th>
        <th class="px-4 py-3 text-left font-600">Status</th>
      </tr>
    </template>

    <tr class="border-t border-[var(--gr-brd)]">
      <td class="px-4 py-3">Spring onboarding</td>
      <td class="px-4 py-3"><GrBadge size="sm" tone="secondary">Ready</GrBadge></td>
    </tr>
  </GrTable>
</template>`,
  },
  {
    id: 'table-loading-state',
    title: 'Loading rows with skeletons',
    description: 'Закрываем data-display edge case: таблица должна выглядеть предсказуемо и в loading-state, когда данные ещё не приехали.',
    status: 'ready',
    previewKey: 'gr-table-loading-state',
    code: `<script setup lang="ts">
import { GrSkeleton, GrTable } from '@feugene/granularity'
</script>

<template>
  <GrTable>
    <template #head>
      <tr>
        <th class="px-4 py-3 text-left font-600">Task</th>
        <th class="px-4 py-3 text-left font-600">State</th>
      </tr>
    </template>

    <tr class="border-t border-[var(--gr-brd)]">
      <td class="px-4 py-3"><GrSkeleton class="h-4 w-32" /></td>
      <td class="px-4 py-3"><GrSkeleton class="h-4 w-24" /></td>
    </tr>
  </GrTable>
</template>`,
  },
  {
    id: 'table-empty-state',
    title: 'Empty state inside tbody',
    description: 'Показываем, как `GrTable` может содержать `GrEmptyState` внутри `tbody`, не теряя table semantics и visual shell.',
    status: 'ready',
    previewKey: 'gr-table-empty-state',
    code: `<script setup lang="ts">
import { GrButton, GrEmptyState, GrTable } from '@feugene/granularity'
</script>

<template>
  <GrTable>
    <template #head>
      <tr>
        <th class="px-4 py-3 text-left font-600">Preset</th>
        <th class="px-4 py-3 text-left font-600">Owner</th>
      </tr>
    </template>

    <tr class="border-t border-[var(--gr-brd)]">
      <td colspan="2" class="px-4 py-6">
        <GrEmptyState title="No preset rows" description="Load sample data to replace the placeholder.">
          <GrButton size="sm">Load sample data</GrButton>
        </GrEmptyState>
      </td>
    </tr>
  </GrTable>
</template>`,
  },
  {
    id: 'table-sizes',
    title: 'Шкала размеров',
    description: '`GrTable` — тонкий контейнер, поэтому `size` задаёт базовый кегль таблицы; паддинги ячеек остаются за потребителем.',
    status: 'ready',
    previewKey: 'gr-table-sizes',
    code: `<script setup lang="ts">
import { GrTable } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const rows = [
  { plan: 'Starter', seats: 3, price: '$12' },
  { plan: 'Team', seats: 25, price: '$79' },
]
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrTable :size="size" aria-label="Plans">
        <template #head>
          <tr>
            <th class="px-4 py-2 text-left">
              Plan
            </th>
            <th class="px-4 py-2 text-right">
              Seats
            </th>
            <th class="px-4 py-2 text-right">
              Price
            </th>
          </tr>
        </template>

        <tr v-for="row in rows" :key="row.plan" class="border-t border-[var(--gr-brd)]">
          <td class="px-4 py-2">
            {{ row.plan }}
          </td>
          <td class="px-4 py-2 text-right">
            {{ row.seats }}
          </td>
          <td class="px-4 py-2 text-right">
            {{ row.price }}
          </td>
        </tr>
      </GrTable>
    </div>
  </div>
</template>`,
  },
]
