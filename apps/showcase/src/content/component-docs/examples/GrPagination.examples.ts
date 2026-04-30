import type { ShowcaseComponentExampleDoc } from '../types'

export const grPaginationExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'pagination-basic-flow',
    title: 'Basic paging feedback loop',
    description: 'Минимальный сценарий для `GrPagination`: меняем страницу и размер выдачи, а рядом показываем, какой диапазон элементов реально видит пользователь.',
    status: 'ready',
    previewKey: 'ds-pagination-basic-flow',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrPagination } from '@feugene/granularity'

const total = ref(137)
const page = ref(3)
const pageSize = ref(10)

const visibleRange = computed(() => {
  const start = (page.value - 1) * pageSize.value + 1
  const end = Math.min(total.value, page.value * pageSize.value)

  return [start, end].join('-')
})
</script>

<template>
  <div class="grid gap-3">
    <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />

    <div class="flex flex-wrap gap-2">
      <GrBadge>Page {{ page }}</GrBadge>
      <GrBadge>Page size {{ pageSize }}</GrBadge>
      <GrBadge>Showing {{ visibleRange }} of {{ total }}</GrBadge>
    </div>
  </div>
</template>`,
  },
  {
    id: 'pagination-page-size-guard',
    title: 'Page-size changes with page clamping',
    description: 'Отдельно показываем защиту от типичного UX-багa: когда после смены `pageSize` текущая страница выходит за пределы нового количества страниц.',
    status: 'ready',
    previewKey: 'ds-pagination-page-size-guard',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrPagination } from '@feugene/granularity'

const total = ref(58)
const page = ref(5)
const pageSize = ref(12)
const pageSizes = [6, 12, 24]

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function clampPage() {
  page.value = Math.min(page.value, pageCount.value)
}

function setTotal(nextTotal: number) {
  total.value = nextTotal
  clampPage()
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" :variant="total === 58 ? 'primary' : 'outline'" @click="setTotal(58)">58 items</GrButton>
      <GrButton size="sm" :variant="total === 23 ? 'primary' : 'outline'" @click="setTotal(23)">23 items</GrButton>
      <GrButton size="sm" :variant="total === 8 ? 'primary' : 'outline'" @click="setTotal(8)">8 items</GrButton>
    </div>

    <GrPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      @update:page-size="clampPage"
    />

    <div class="flex flex-wrap gap-2">
      <GrBadge>Total {{ total }}</GrBadge>
      <GrBadge>Last available page {{ pageCount }}</GrBadge>
      <GrBadge>Active page {{ page }}</GrBadge>
    </div>
  </div>
</template>`,
    note: 'Компонент сознательно не «чинит» внешнее состояние сам — страницу лучше нормализовать в owning-контейнере.',
  },
  {
    id: 'pagination-data-table-composition',
    title: 'Composition with GrDataTable',
    description: 'Практический сценарий: `GrPagination` остаётся контролом навигации, а slicing данных и действия по строкам живут в page-level orchestration.',
    status: 'ready',
    previewKey: 'ds-pagination-table-composition',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrDataTable, GrPagination } from '@feugene/granularity'

const page = ref(1)
const pageSize = ref(5)
const pageSizes = [5, 10, 20]
const lastAction = ref('No row action yet')

const rows = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  customer: 'Customer ' + (index + 1),
  plan: index % 2 === 0 ? 'Scale' : 'Starter',
  status: index % 3 === 0 ? 'attention' : 'healthy',
}))

const columns = [
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return rows.slice(start, start + pageSize.value)
})

const pageCount = computed(() => Math.max(1, Math.ceil(rows.length / pageSize.value)))

function clampPage() {
  page.value = Math.min(page.value, pageCount.value)
}
</script>

<template>
  <div class="grid gap-4">
    <GrDataTable :rows="pagedRows" :columns="columns" row-key="id">
      <template #cell-status="{ row }">
        <GrBadge :tone="row.status === 'healthy' ? 'success' : 'warning'">
          {{ row.status }}
        </GrBadge>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex justify-end">
          <GrButton size="sm" variant="ghost" @click="lastAction = 'Opened ' + row.customer">Open</GrButton>
        </div>
      </template>
    </GrDataTable>

    <GrPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="rows.length"
      @update:page-size="clampPage"
    />

    <GrBadge>{{ lastAction }}</GrBadge>
  </div>
</template>`,
    note: 'Этот пример полезен как recipe: пагинация не знает о таблице, а таблица не знает о page-size логике — связка собирается наверху.',
  },
]
