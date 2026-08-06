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
import { ref } from 'vue'

import { GrButton, GrTable } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const loading = ref(true)

const rows = [
  { title: 'Ledger export', state: 'Completed', updated: '2 min ago' },
  { title: 'Reconciliation', state: 'Processing', updated: '5 min ago' },
  { title: 'Fraud review', state: 'Queued', updated: '12 min ago' },
]
</script>

<template>
  <div class="grid gap-3">
    <div>
      <GrButton size="sm" variant="outline" @click="loading = !loading">
        {{ loading ? t('components.GrTable.loading.showResolved') : t('components.GrTable.loading.showLoading') }}
      </GrButton>
    </div>

    <!-- Скелетоны рисует сама таблица, контейнер при этом помечен \`aria-busy\`. -->
    <GrTable :loading="loading" :loading-rows="3" :column-count="3">
      <template #head>
        <tr>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.loading.headTask') }}</th>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.loading.headState') }}</th>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.loading.headUpdated') }}</th>
        </tr>
      </template>

      <tr v-for="row in rows" :key="row.title" class="border-t border-[var(--gr-brd)]">
        <td class="px-4 py-3">{{ row.title }}</td>
        <td class="px-4 py-3">{{ row.state }}</td>
        <td class="px-4 py-3 text-[var(--gr-muted-fg)]">{{ row.updated }}</td>
      </tr>
    </GrTable>
  </div>
</template>`,
  },
  {
    id: 'table-empty-state',
    title: 'Empty state inside tbody',
    description: 'Показываем, как `GrTable` может содержать `GrEmptyState` внутри `tbody`, не теряя table semantics и visual shell.',
    status: 'ready',
    previewKey: 'gr-table-empty-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrTable } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const empty = ref(true)

const rows = [
  { name: 'Risk alerts', owner: 'Ops team', value: 'Enabled' },
  { name: 'Approval SLA', owner: 'Finance', value: '24 hours' },
]
</script>

<template>
  <div class="grid gap-3">
    <div>
      <GrButton size="sm" variant="outline" @click="empty = !empty">
        {{ empty ? t('components.GrTable.empty.showRows') : t('components.GrTable.empty.showEmpty') }}
      </GrButton>
    </div>

    <!-- Ни \`v-if\` вокруг строк, ни ручного \`colspan\`: пустоту таблица видит по слоту сама. -->
    <GrTable :column-count="3" striped hoverable>
      <template #head>
        <tr>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headPreset') }}</th>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headOwner') }}</th>
          <th class="px-4 py-3 text-left font-600">{{ t('components.GrTable.empty.headValue') }}</th>
        </tr>
      </template>

      <tr v-for="row in (empty ? [] : rows)" :key="row.name" class="border-t border-[var(--gr-brd)]">
        <td class="px-4 py-3">{{ row.name }}</td>
        <td class="px-4 py-3 text-[var(--gr-muted-fg)]">{{ row.owner }}</td>
        <td class="px-4 py-3">{{ row.value }}</td>
      </tr>

      <template #empty>
        <div class="grid justify-items-center gap-2">
          <span>{{ t('components.GrTable.empty.emptyTitle') }}</span>
          <GrButton size="sm" @click="empty = false">
            {{ t('components.GrTable.empty.loadSample') }}
          </GrButton>
        </div>
      </template>
    </GrTable>
  </div>
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
