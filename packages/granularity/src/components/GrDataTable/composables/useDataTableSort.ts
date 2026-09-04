import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'

import type { GrDataColumn, GrDataTableSortCycle } from '../GrDataTable.vue'
import type { GrDataTableSortDir } from '../grDataTableSort'
import { sortRows } from '../grDataTableSort'

/**
 * Сортировка `GrDataTable`: состояние, порядок строк и обход состояний по клику.
 *
 * Модель эмитов не знает — о смене сообщает колбэком `onSortChange`, а
 * `update:sortKey`/`update:sortDir`/`sortChange` остаются заботой компонента.
 * Так же устроен `GrTree`: модель отдельно, эмиты связывает SFC.
 *
 * Сравнение значений, включая пустые и смешанные типы, живёт в
 * `grDataTableSort.ts` и здесь только вызывается.
 */
export interface UseDataTableSortOptions<TRow extends Record<string, unknown>> {
  rows: () => TRow[]
  /** Контролируемый ключ. `undefined` — компонент помнит порядок сам. */
  sortKey: () => string | undefined
  /** Контролируемое направление. */
  sortDir: () => GrDataTableSortDir | undefined
  initialSortKey: () => string | undefined
  initialSortDir: () => GrDataTableSortDir
  /** Внешняя сортировка: `rows` приходят уже отсортированными. */
  externalSort: () => boolean
  sortCycle: () => GrDataTableSortCycle
  /** Язык сравнения строк; не задан — сравнение по умолчанию рантайма. */
  locale: () => string | undefined
  onSortChange: (key: string, dir: GrDataTableSortDir) => void
}

export interface DataTableSort<TRow extends Record<string, unknown>> {
  currentSortKey: ComputedRef<string>
  currentSortDir: ComputedRef<GrDataTableSortDir>
  sortedRows: ComputedRef<TRow[]>
  toggleSort: (col: GrDataColumn<TRow>) => void
  clearSort: () => void
  ariaSortFor: (col: GrDataColumn<TRow>) => 'ascending' | 'descending' | 'none' | undefined
}

export function useDataTableSort<TRow extends Record<string, unknown>>(
  options: UseDataTableSortOptions<TRow>,
): DataTableSort<TRow> {
  // Uncontrolled-состояние; в controlled-режиме перекрывается пропами.
  const internalSortKey = ref<string>(options.initialSortKey() ?? '')
  const internalSortDir = ref<GrDataTableSortDir>(options.initialSortDir())

  const isSortKeyControlled = computed(() => options.sortKey() !== undefined)
  const isSortDirControlled = computed(() => options.sortDir() !== undefined)

  const currentSortKey = computed(() => options.sortKey() ?? internalSortKey.value)
  const currentSortDir = computed<GrDataTableSortDir>(() => options.sortDir() ?? internalSortDir.value)

  function applySort(key: string, dir: GrDataTableSortDir): void {
    if (!isSortKeyControlled.value)
      internalSortKey.value = key
    if (!isSortDirControlled.value)
      internalSortDir.value = dir

    options.onSortChange(key, dir)
  }

  const sortedRows = computed(() => {
    // Внешняя сортировка: `rows` уже отсортированы потребителем — не трогаем.
    if (options.externalSort())
      return [...options.rows()]

    const key = currentSortKey.value
    if (!key)
      return [...options.rows()]

    return sortRows(options.rows(), key, currentSortDir.value, options.locale())
  })

  function toggleSort(col: GrDataColumn<TRow>): void {
    if (!col.sortable)
      return

    if (currentSortKey.value !== col.key) {
      applySort(col.key, 'asc')
      return
    }

    if (currentSortDir.value === 'asc') {
      applySort(col.key, 'desc')
      return
    }

    // Третье состояние: сортировка снимается, порядок возвращается к исходному.
    if (options.sortCycle() === 'asc-desc-none') {
      applySort('', 'asc')
      return
    }

    applySort(col.key, 'asc')
  }

  function clearSort(): void {
    applySort('', 'asc')
  }

  function ariaSortFor(col: GrDataColumn<TRow>): 'ascending' | 'descending' | 'none' | undefined {
    if (!col.sortable)
      return undefined
    if (currentSortKey.value !== col.key)
      return 'none'
    return currentSortDir.value === 'asc' ? 'ascending' : 'descending'
  }

  return { currentSortKey, currentSortDir, sortedRows, toggleSort, clearSort, ariaSortFor }
}
