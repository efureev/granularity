
<script setup lang="ts" generic="TRow extends Record<string, unknown> = Record<string, unknown>">
import { computed, ref } from 'vue'

import GrTable from '../GrTable/GrTable.vue'
import type { GrTableDensity } from '../GrTable'
import GrIcon from '../GrIcon/GrIcon.vue'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import IconArrowUp from '~icons/lucide/arrow-up'
import IconArrowDown from '~icons/lucide/arrow-down'

export type GrDataColumn = {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

export type GrDataTableRowKey<TRow extends Record<string, unknown> = Record<string, unknown>> =
  | string
  | ((row: TRow) => string | number)

export interface GrDataTableProps<TRow extends Record<string, unknown> = Record<string, unknown>> {
  rows: TRow[]
  columns: GrDataColumn[]
  /** Ключ строки или функция-резолвер. По умолчанию — поле `'id'`. */
  rowKey?: GrDataTableRowKey<TRow>
  /** Ключ колонки для начальной сортировки (uncontrolled-режим). */
  initialSortKey?: string
  /** Направление начальной сортировки (uncontrolled-режим). */
  initialSortDir?: 'asc' | 'desc'
  /** Контролируемый ключ сортировки: `v-model:sortKey`. Задаёт controlled-режим. */
  sortKey?: string
  /** Контролируемое направление сортировки: `v-model:sortDir`. */
  sortDir?: 'asc' | 'desc'
  /**
   * Внешняя сортировка (например серверная): компонент НЕ сортирует `rows`
   * сам, а только сообщает о смене через `update:sortKey`/`update:sortDir`/
   * `sort-change`. `rows` при этом должны приходить уже отсортированными.
   */
  externalSort?: boolean
  /**
   * Выбор строк: добавляет ведущую колонку с чекбоксами (+ «выбрать все» в шапке).
   * Выбранные ключи строк — через `v-model:selected`.
   */
  selectable?: boolean
  /** Контролируемый список выбранных ключей строк: `v-model:selected`. */
  selected?: Array<string | number>
  /**
   * Состояние загрузки: тело таблицы заменяется строкой-индикатором.
   * `empty`-состояние при этом не показывается.
   */
  loading?: boolean
  /** Текст индикатора загрузки. i18n: fallback `gr.dataTable.loading`. */
  loadingText?: string
  // Прокси к GrTable:
  density?: GrTableDensity
  caption?: string
  ariaLabel?: string
  ariaLabelledby?: string
  regionLabel?: string
  /** Прилипающий заголовок при вертикальном скролле (нужен `maxHeight`). */
  stickyHeader?: boolean
  /** Максимальная высота таблицы (вертикальный скролл). Число — в пикселях. */
  maxHeight?: string | number
}

/**
 * `GrDataTable` — data-таблица поверх `GrTable` с сортировкой по клику
 * на заголовок и scoped-слотами ячеек (`#cell-<key>`), `#caption`, `#foot`, `#empty`.
 *
 * Сортировка: если оба значения в колонке — числа (или парсятся как числа), сравнение
 * идёт численное; иначе — локальное строковое `localeCompare` с `sensitivity: 'base'`.
 */
const props = withDefaults(defineProps<GrDataTableProps<TRow>>(), {
  rowKey: 'id' as never,
  initialSortKey: undefined,
  initialSortDir: 'asc',
  sortKey: undefined,
  sortDir: undefined,
  externalSort: false,
  selectable: false,
  selected: undefined,
  loading: false,
  loadingText: undefined,
  density: 'regular',
  caption: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  regionLabel: undefined,
  stickyHeader: false,
  maxHeight: undefined,
})

const emit = defineEmits<{
  (e: 'update:sortKey', value: string): void
  (e: 'update:sortDir', value: 'asc' | 'desc'): void
  (e: 'sort-change', value: { key: string, dir: 'asc' | 'desc' }): void
  (e: 'update:selected', value: Array<string | number>): void
}>()

const { t } = useGranularityTranslations()
const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.dataTable.loading', 'Loading…'))

// Uncontrolled-состояние; в controlled-режиме перекрывается пропами `sortKey`/`sortDir`.
const internalSortKey = ref<string>(props.initialSortKey ?? '')
const internalSortDir = ref<'asc' | 'desc'>(props.initialSortDir)

const isSortKeyControlled = computed(() => props.sortKey !== undefined)
const isSortDirControlled = computed(() => props.sortDir !== undefined)

const currentSortKey = computed(() => props.sortKey ?? internalSortKey.value)
const currentSortDir = computed<'asc' | 'desc'>(() => props.sortDir ?? internalSortDir.value)

function applySort(key: string, dir: 'asc' | 'desc'): void {
  if (!isSortKeyControlled.value)
    internalSortKey.value = key
  if (!isSortDirControlled.value)
    internalSortDir.value = dir

  emit('update:sortKey', key)
  emit('update:sortDir', dir)
  emit('sort-change', { key, dir })
}

const sortedRows = computed(() => {
  const items = [...props.rows]
  // Внешняя сортировка: `rows` уже отсортированы потребителем — не трогаем.
  if (props.externalSort)
    return items

  const key = currentSortKey.value
  if (!key)
    return items

  const dir = currentSortDir.value

  items.sort((a, b) => {
    const av = (a as Record<string, unknown>)[key]
    const bv = (b as Record<string, unknown>)[key]

    const aNum = typeof av === 'number' ? av : Number(av)
    const bNum = typeof bv === 'number' ? bv : Number(bv)
    const bothNumbers = Number.isFinite(aNum) && Number.isFinite(bNum)

    const res = bothNumbers
      ? aNum - bNum
      : String(av ?? '').localeCompare(String(bv ?? ''), undefined, { sensitivity: 'base' })

    return dir === 'asc' ? res : -res
  })

  return items
})

function toggleSort(col: GrDataColumn): void {
  if (!col.sortable)
    return

  if (currentSortKey.value !== col.key) {
    applySort(col.key, 'asc')
    return
  }

  applySort(col.key, currentSortDir.value === 'asc' ? 'desc' : 'asc')
}

function cellAlign(col: GrDataColumn): string {
  if (col.align === 'right')
    return 'text-right'
  if (col.align === 'center')
    return 'text-center'
  return 'text-left'
}

function rowKeyValue(row: TRow): string | number {
  const rk = props.rowKey
  if (typeof rk === 'function')
    return rk(row)
  const v = (row as Record<string, unknown>)[rk as string]
  if (typeof v === 'string' || typeof v === 'number')
    return v
  return String(v ?? '')
}

function ariaSortFor(col: GrDataColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable)
    return undefined
  if (currentSortKey.value !== col.key)
    return 'none'
  return currentSortDir.value === 'asc' ? 'ascending' : 'descending'
}

function sortButtonLabel(col: GrDataColumn): string {
  if (currentSortKey.value !== col.key)
    return `Sort by ${col.label}`
  return currentSortDir.value === 'asc'
    ? `Sorted by ${col.label} ascending, activate to sort descending`
    : `Sorted by ${col.label} descending, activate to sort ascending`
}

const tableProps = computed(() => ({
  density: props.density,
  caption: props.caption,
  ariaLabel: props.ariaLabel,
  ariaLabelledby: props.ariaLabelledby,
  regionLabel: props.regionLabel,
  stickyHeader: props.stickyHeader,
  maxHeight: props.maxHeight,
}))

const isEmpty = computed(() => sortedRows.value.length === 0)

// Общее число колонок с учётом ведущей чекбокс-колонки — для `colspan`
// строк loading/empty.
const totalColumns = computed(() => props.columns.length + (props.selectable ? 1 : 0))

function cellValue(row: TRow, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

// ————— Выбор строк.
const selectedKeys = computed<Set<string | number>>(() => new Set(props.selected ?? []))

function isRowSelected(row: TRow): boolean {
  return selectedKeys.value.has(rowKeyValue(row))
}

const allSelected = computed(() =>
  sortedRows.value.length > 0 && sortedRows.value.every(isRowSelected),
)
const someSelected = computed(() =>
  sortedRows.value.some(isRowSelected) && !allSelected.value,
)

function emitSelected(next: Set<string | number>): void {
  emit('update:selected', [...next])
}

function toggleRow(row: TRow): void {
  const key = rowKeyValue(row)
  const next = new Set(selectedKeys.value)
  if (next.has(key))
    next.delete(key)
  else
    next.add(key)
  emitSelected(next)
}

function toggleAll(): void {
  if (allSelected.value) {
    // Снимаем выбор только с видимых строк, сохраняя внешние ключи.
    const next = new Set(selectedKeys.value)
    for (const row of sortedRows.value) next.delete(rowKeyValue(row))
    emitSelected(next)
    return
  }
  const next = new Set(selectedKeys.value)
  for (const row of sortedRows.value) next.add(rowKeyValue(row))
  emitSelected(next)
}
</script>

<template>
  <GrTable v-bind="tableProps" data-gr-datatable>
    <template v-if="$slots.caption" #caption>
      <slot name="caption" />
    </template>

    <template #head>
      <tr data-gr-datatable-header>
        <th
          v-if="selectable"
          class="w-10 px-4 py-3 text-left"
          scope="col"
        >
          <input
            type="checkbox"
            data-gr-datatable-select-all
            class="h-4 w-4 cursor-pointer accent-[var(--gr-primary)] align-middle"
            :checked="allSelected"
            :indeterminate="someSelected"
            :aria-label="t('gr.dataTable.selectAll', 'Select all rows')"
            :disabled="loading || isEmpty"
            @change="toggleAll"
          >
        </th>
        <th
          v-for="col in columns"
          :key="col.key"
          class="font-700 text-xs px-4 py-3"
          :class="cellAlign(col)"
          :aria-sort="ariaSortFor(col)"
          scope="col"
        >
          <div class="inline-flex items-center gap-2">
            <button
              v-if="col.sortable"
              type="button"
              class="inline-flex items-center gap-2 text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded"
              :aria-label="sortButtonLabel(col)"
              @click="toggleSort(col)"
            >
              <span>{{ col.label }}</span>
              <span class="inline-flex">
                <GrIcon v-if="currentSortKey === col.key && currentSortDir === 'asc'" size="sm" aria-hidden="true">
                  <IconArrowUp />
                </GrIcon>
                <GrIcon v-else-if="currentSortKey === col.key && currentSortDir === 'desc'" size="sm" aria-hidden="true">
                  <IconArrowDown />
                </GrIcon>
              </span>
            </button>
            <span v-else class="text-[var(--gr-muted-fg)]">{{ col.label }}</span>
          </div>
        </th>
      </tr>
    </template>

    <template v-if="loading">
      <tr data-gr-datatable-loading>
        <td :colspan="totalColumns" class="px-4 py-6 text-center text-[var(--gr-muted-fg)]">
          <span class="inline-flex items-center gap-2" role="status">
            <span class="i-lucide-loader-circle block h-4 w-4 animate-spin" aria-hidden="true" />
            <span>{{ resolvedLoadingText }}</span>
          </span>
        </td>
      </tr>
    </template>
    <template v-else-if="isEmpty">
      <tr data-gr-datatable-empty>
        <td :colspan="totalColumns" class="px-4 py-6 text-center text-[var(--gr-muted-fg)]">
          <slot name="empty">
            {{ t('gr.dataTable.empty', 'No data') }}
          </slot>
        </td>
      </tr>
    </template>
    <tr
      v-for="row in sortedRows"
      v-else
      :key="rowKeyValue(row)"
      class="border-t border-[var(--gr-brd)]"
      :class="isRowSelected(row) ? 'bg-[color-mix(in_srgb,var(--gr-primary)_8%,transparent)]' : ''"
      data-gr-datatable-row
      :data-selected="selectable && isRowSelected(row) ? 'true' : undefined"
    >
      <td v-if="selectable" class="w-10 px-4 py-3 text-left">
        <input
          type="checkbox"
          data-gr-datatable-select-row
          class="h-4 w-4 cursor-pointer accent-[var(--gr-primary)] align-middle"
          :checked="isRowSelected(row)"
          :aria-label="t('gr.dataTable.selectRow', 'Select row')"
          @change="toggleRow(row)"
        >
      </td>
      <td
        v-for="col in columns"
        :key="col.key"
        class="px-4 py-3"
        :class="cellAlign(col)"
      >
        <slot :name="`cell-${col.key}`" :row="row">
          <span>{{ cellValue(row, col.key) }}</span>
        </slot>
      </td>
    </tr>

    <template v-if="$slots.foot" #foot>
      <slot name="foot" />
    </template>
  </GrTable>
</template>
