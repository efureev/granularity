<script setup lang="ts">
import { computed } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrButton from '../GrButton/GrButton.vue'
import GrSelect from '../GrSelect/GrSelect.vue'

/**
 * Пропы пагинации.
 *
 * `total` интерпретируется как общее количество элементов; число страниц
 * вычисляется из `total` и `pageSize`. Окно отображаемых номеров — 5.
 */
export interface GrPaginationProps {
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
}

const { t } = useGranularityTranslations()

const props = withDefaults(defineProps<GrPaginationProps>(), {
  pageSizes: () => [10, 20, 50],
})

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

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

const pages = computed(() => {
  const max = pageCount.value
  const current = props.page
  const windowSize = 5
  const half = Math.floor(windowSize / 2)

  let start = Math.max(1, current - half)
  const end = Math.min(max, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  const list: number[] = []
  for (let page = start; page <= end; page += 1)
    list.push(page)

  return list
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
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-end gap-3"
    data-ds-pagination
    role="navigation"
    :aria-label="t('gr.pagination.pageSize', 'Pagination')"
  >
    <div class="min-w-[100px]">
      <GrSelect
        v-model="pageSizeModel"
        :options="pageSizeOptions"
        :aria-label="t('gr.pagination.pageSize', 'Page size')"
      />
    </div>

    <GrButton variant="ghost" size="sm" :disabled="page <= 1" @click="prev">
      {{ t('gr.pagination.prev', 'Prev') }}
    </GrButton>

    <div class="flex items-center gap-1">
      <button
        v-for="pageNumber in pages"
        :key="pageNumber"
        type="button"
        data-ds-pagination-page
        :aria-current="pageNumber === page ? 'page' : undefined"
        :aria-label="`Page ${pageNumber}`"
        class="h-8 min-w-8 px-2 rounded-md text-sm font-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        :class="pageNumber === page ? 'bg-[var(--primary)] text-[var(--primary-fg)]' : 'text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--fg)]'"
        @click="goTo(pageNumber)"
      >
        {{ pageNumber }}
      </button>
    </div>

    <GrButton variant="ghost" size="sm" :disabled="page >= pageCount" @click="next">
      {{ t('gr.pagination.next', 'Next') }}
    </GrButton>
  </div>
</template>
