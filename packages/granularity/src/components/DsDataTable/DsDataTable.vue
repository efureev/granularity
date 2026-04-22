
<script setup lang="ts" generic="TRow extends Record<string, unknown> = Record<string, unknown>">
import { computed, ref } from 'vue'

import DsTable from '../DsTable/DsTable.vue'
import type { DsTableDensity } from '../DsTable'
import DsIcon from '../DsIcon/DsIcon.vue'

import IconArrowUp from '~icons/lucide/arrow-up'
import IconArrowDown from '~icons/lucide/arrow-down'

export type DsDataColumn = {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right'
}

export type DsDataTableRowKey<TRow extends Record<string, unknown> = Record<string, unknown>> =
  | string
  | ((row: TRow) => string | number)

export interface DsDataTableProps<TRow extends Record<string, unknown> = Record<string, unknown>> {
  rows: TRow[]
  columns: DsDataColumn[]
  /** Ключ строки или функция-резолвер. По умолчанию — поле `'id'`. */
  rowKey?: DsDataTableRowKey<TRow>
  /** Ключ колонки для начальной сортировки. */
  initialSortKey?: string
  /** Направление начальной сортировки. */
  initialSortDir?: 'asc' | 'desc'
  // Прокси к DsTable:
  density?: DsTableDensity
  caption?: string
  ariaLabel?: string
  ariaLabelledby?: string
  regionLabel?: string
}

/**
 * `DsDataTable` — data-таблица поверх `DsTable` с сортировкой по клику
 * на заголовок и scoped-слотами ячеек (`#cell-<key>`), `#caption`, `#foot`, `#empty`.
 *
 * Сортировка: если оба значения в колонке — числа (или парсятся как числа), сравнение
 * идёт численное; иначе — локальное строковое `localeCompare` с `sensitivity: 'base'`.
 */
const props = withDefaults(defineProps<DsDataTableProps<TRow>>(), {
  rowKey: 'id' as never,
  initialSortKey: undefined,
  initialSortDir: 'asc',
  density: 'regular',
  caption: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  regionLabel: undefined,
})

const sortKey = ref<string>(props.initialSortKey ?? '')
const sortDir = ref<'asc' | 'desc'>(props.initialSortDir)

const sortedRows = computed(() => {
  const items = [...props.rows]
  if (!sortKey.value)
    return items

  const key = sortKey.value
  const dir = sortDir.value

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

function toggleSort(col: DsDataColumn): void {
  if (!col.sortable)
    return

  if (sortKey.value !== col.key) {
    sortKey.value = col.key
    sortDir.value = 'asc'
    return
  }

  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

function cellAlign(col: DsDataColumn): string {
  return col.align === 'right' ? 'text-right' : 'text-left'
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

function ariaSortFor(col: DsDataColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable)
    return undefined
  if (sortKey.value !== col.key)
    return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

function sortButtonLabel(col: DsDataColumn): string {
  if (sortKey.value !== col.key)
    return `Sort by ${col.label}`
  return sortDir.value === 'asc'
    ? `Sorted by ${col.label} ascending, activate to sort descending`
    : `Sorted by ${col.label} descending, activate to sort ascending`
}

const tableProps = computed(() => ({
  density: props.density,
  caption: props.caption,
  ariaLabel: props.ariaLabel,
  ariaLabelledby: props.ariaLabelledby,
  regionLabel: props.regionLabel,
}))

const isEmpty = computed(() => sortedRows.value.length === 0)

function cellValue(row: TRow, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}
</script>

<template>
  <DsTable v-bind="tableProps" data-ds-datatable>
    <template v-if="$slots.caption" #caption>
      <slot name="caption" />
    </template>

    <template #head>
      <tr data-ds-datatable-header>
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
              class="inline-flex items-center gap-2 text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded"
              :aria-label="sortButtonLabel(col)"
              @click="toggleSort(col)"
            >
              <span>{{ col.label }}</span>
              <span class="inline-flex">
                <DsIcon v-if="sortKey === col.key && sortDir === 'asc'" size="sm" aria-hidden="true">
                  <IconArrowUp />
                </DsIcon>
                <DsIcon v-else-if="sortKey === col.key && sortDir === 'desc'" size="sm" aria-hidden="true">
                  <IconArrowDown />
                </DsIcon>
              </span>
            </button>
            <span v-else class="text-[var(--muted-fg)]">{{ col.label }}</span>
          </div>
        </th>
      </tr>
    </template>

    <template v-if="isEmpty">
      <tr data-ds-datatable-empty>
        <td :colspan="columns.length" class="px-4 py-6 text-center text-[var(--muted-fg)]">
          <slot name="empty">Нет данных</slot>
        </td>
      </tr>
    </template>
    <tr
      v-for="row in sortedRows"
      v-else
      :key="rowKeyValue(row)"
      class="border-t border-[var(--brd)]"
      data-ds-datatable-row
    >
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
  </DsTable>
</template>
