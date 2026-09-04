import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'

/**
 * Выбор строк `GrDataTable`.
 *
 * Считается по **видимым и выбираемым** строкам: они же дают состояние
 * галочки в шапке. Ключи строк, которых сейчас в наборе нет (отфильтрованы,
 * на другой странице), из выбора не выпадают — «снять все» убирает только
 * видимые.
 *
 * Как и сортировка, эмитов не знает: наружу сообщает `onSelectedChange`.
 */
export interface UseDataTableSelectionOptions<TRow extends Record<string, unknown>> {
  /** Строки в текущем порядке — уже отсортированные. */
  rows: () => TRow[]
  /** Контролируемый список ключей. `undefined` — компонент помнит выбор сам. */
  selected: () => Array<string | number> | undefined
  selectableRow: () => ((row: TRow) => boolean) | undefined
  rowKeyValue: (row: TRow) => string | number
  onSelectedChange: (keys: Array<string | number>) => void
}

export interface DataTableSelection<TRow extends Record<string, unknown>> {
  selectedKeys: ComputedRef<Set<string | number>>
  isRowSelectable: (row: TRow) => boolean
  isRowSelected: (row: TRow) => boolean
  /** Видимые выбираемые строки: по их числу шапка гасит «выбрать все». */
  selectableRows: ComputedRef<TRow[]>
  allSelected: ComputedRef<boolean>
  someSelected: ComputedRef<boolean>
  toggleRow: (row: TRow) => void
  toggleAll: () => void
}

export function useDataTableSelection<TRow extends Record<string, unknown>>(
  options: UseDataTableSelectionOptions<TRow>,
): DataTableSelection<TRow> {
  const internalSelected = ref<Array<string | number>>([])
  const isSelectedControlled = computed(() => options.selected() !== undefined)

  const selectedKeys = computed<Set<string | number>>(
    () => new Set(options.selected() ?? internalSelected.value),
  )

  function isRowSelectable(row: TRow): boolean {
    const predicate = options.selectableRow()
    return predicate ? predicate(row) : true
  }

  function isRowSelected(row: TRow): boolean {
    return selectedKeys.value.has(options.rowKeyValue(row))
  }

  /** «Выбрать все» работает по видимым и выбираемым строкам — они же считают состояние шапки. */
  const selectableRows = computed(() => options.rows().filter(isRowSelectable))

  const allSelected = computed(() =>
    selectableRows.value.length > 0 && selectableRows.value.every(isRowSelected),
  )
  const someSelected = computed(() =>
    selectableRows.value.some(isRowSelected) && !allSelected.value,
  )

  function emitSelected(next: Set<string | number>): void {
    if (!isSelectedControlled.value)
      internalSelected.value = [...next]

    options.onSelectedChange([...next])
  }

  function toggleRow(row: TRow): void {
    if (!isRowSelectable(row))
      return

    const key = options.rowKeyValue(row)
    const next = new Set(selectedKeys.value)
    if (next.has(key))
      next.delete(key)
    else
      next.add(key)
    emitSelected(next)
  }

  function toggleAll(): void {
    const next = new Set(selectedKeys.value)

    if (allSelected.value) {
      // Снимаем выбор только с видимых строк, сохраняя внешние ключи.
      for (const row of selectableRows.value) next.delete(options.rowKeyValue(row))
      emitSelected(next)
      return
    }

    for (const row of selectableRows.value) next.add(options.rowKeyValue(row))
    emitSelected(next)
  }

  return {
    selectedKeys,
    isRowSelectable,
    isRowSelected,
    selectableRows,
    allSelected,
    someSelected,
    toggleRow,
    toggleAll,
  }
}
