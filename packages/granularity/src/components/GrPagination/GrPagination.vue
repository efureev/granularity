<script setup lang="ts">
import { computed, watch } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrButton from '../GrButton/GrButton.vue'
import GrSelect from '../GrSelect/GrSelect.vue'

/**
 * Пропы пагинации.
 *
 * `total` интерпретируется как общее количество элементов; число страниц
 * вычисляется из `total` и `pageSize`. Номера усекаются многоточием
 * (алгоритм boundary/sibling, как у MUI): всегда видны первая/последняя страница
 * и `siblingCount` соседей вокруг текущей.
 */
export interface GrPaginationProps {
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
  /** Сколько соседних страниц показывать вокруг текущей. По умолчанию `1`. */
  siblingCount?: number
  /** Сколько крайних страниц всегда показывать с каждого края. По умолчанию `1`. */
  boundaryCount?: number
}

const { t } = useGranularityTranslations()

const props = withDefaults(defineProps<GrPaginationProps>(), {
  pageSizes: () => [10, 20, 50],
  siblingCount: 1,
  boundaryCount: 1,
})

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

// Контролируемый компонент: если `total`/`pageSize` уменьшились и текущая `page`
// вышла за диапазон — просим родителя подтянуть её к последней странице.
watch(pageCount, (count) => {
  if (props.page > count)
    emit('update:page', count)
})

const pageSizeModel = computed({
  get: () => String(props.pageSize),
  set: (value: string) => emit('update:pageSize', Number(value)),
})

const pageSizeOptions = computed(() =>
  props.pageSizes.map(pageSize => ({
    value: String(pageSize),
    label: String(pageSize),
  })),
)

type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end'

function range(start: number, end: number): number[] {
  const list: number[] = []
  for (let page = start; page <= end; page += 1)
    list.push(page)
  return list
}

// Алгоритм usePagination как в MUI: крайние `boundaryCount` страниц + `siblingCount`
// соседей вокруг текущей, разрывы схлопываются в многоточие. Одиночный «пропущенный»
// номер показываем как номер, а не как «…» (визуально ровнее).
const items = computed<PaginationItem[]>(() => {
  const count = pageCount.value
  const current = props.page
  const boundaryCount = Math.max(0, props.boundaryCount)
  const siblingCount = Math.max(0, props.siblingCount)

  const startPages = range(1, Math.min(boundaryCount, count))
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)

  const siblingsStart = Math.max(
    Math.min(current - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  )

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ['ellipsis-start' as const]
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? ['ellipsis-end' as const]
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ]
})

function goTo(page: number): void {
  emit('update:page', page)
}

function prev(): void {
  goTo(Math.max(1, props.page - 1))
}

function next(): void {
  goTo(Math.min(pageCount.value, props.page + 1))
}

function first(): void {
  goTo(1)
}

function last(): void {
  goTo(pageCount.value)
}
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-end gap-3"
    data-ds-pagination
    role="navigation"
    :aria-label="t('gr.pagination.label', 'Pagination')"
  >
    <div class="min-w-[100px]">
      <GrSelect
        v-model="pageSizeModel"
        :options="pageSizeOptions"
        :aria-label="t('gr.pagination.pageSize', 'Page size')"
      />
    </div>

    <GrButton variant="ghost" size="sm" :disabled="page <= 1" :aria-label="t('gr.pagination.first', 'First page')" data-ds-pagination-first @click="first">
      «
    </GrButton>

    <GrButton variant="ghost" size="sm" :disabled="page <= 1" data-ds-pagination-prev @click="prev">
      {{ t('gr.pagination.prev', 'Prev') }}
    </GrButton>

    <div class="flex items-center gap-1">
      <template v-for="(item, index) in items" :key="index">
        <span
          v-if="item === 'ellipsis-start' || item === 'ellipsis-end'"
          data-ds-pagination-ellipsis
          aria-hidden="true"
          class="h-8 min-w-8 px-1 grid place-items-center text-sm text-[var(--muted-fg)]"
        >…</span>
        <button
          v-else
          type="button"
          data-ds-pagination-page
          :aria-current="item === page ? 'page' : undefined"
          :aria-label="t('gr.pagination.page', 'Page {n}', { n: item })"
          class="h-8 min-w-8 px-2 rounded-md text-sm font-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          :class="item === page ? 'bg-[var(--primary)] text-[var(--primary-fg)]' : 'text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--fg)]'"
          @click="goTo(item)"
        >
          {{ item }}
        </button>
      </template>
    </div>

    <GrButton variant="ghost" size="sm" :disabled="page >= pageCount" data-ds-pagination-next @click="next">
      {{ t('gr.pagination.next', 'Next') }}
    </GrButton>

    <GrButton variant="ghost" size="sm" :disabled="page >= pageCount" :aria-label="t('gr.pagination.last', 'Last page')" data-ds-pagination-last @click="last">
      »
    </GrButton>
  </div>
</template>
