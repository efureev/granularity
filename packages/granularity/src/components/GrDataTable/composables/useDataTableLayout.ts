import type { ComputedRef } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import type { GrDataColumn } from '../GrDataTable.vue'
import {
  columnPinnedClass,
  columnPinnedLeftEdgeClass,
  columnPinnedRightEdgeClass,
} from '../grDataTableStyles'

/** Служебная колонка выбора в реестре ячеек: своего ключа у неё нет. */
export const SELECT_COLUMN_KEY = '__select__'

/**
 * Раскладка закреплённых колонок: смещения липких ячеек и замер шапки.
 *
 * Единственный модуль таблицы, который целиком про DOM. Смещения нельзя
 * вычислить из пропов: колонка может жить на авторазметке, и её ширина
 * известна только после отрисовки — отсюда замер, а не `computed`.
 */
export interface UseDataTableLayoutOptions<TRow extends Record<string, unknown>> {
  orderedColumns: () => GrDataColumn<TRow>[]
  columnKeys: () => string[]
  selectable: () => boolean
  resizableColumns: () => boolean
  headerCellEls: Map<string, HTMLElement>
  /** Пересчитать раскладку заново при смене этих значений. */
  watchSources: () => unknown
  /** Измеренные ширины уезжают модулю ширин: ручка ресайза называет по ним значение. */
  onMeasuredWidths: (widths: Record<string, number>) => void
}

export interface DataTableLayout<TRow extends Record<string, unknown>> {
  hasPinnedLeft: ComputedRef<boolean>
  pinnedStyleOf: (col: GrDataColumn<TRow>) => Record<string, string> | undefined
  pinnedCellClass: (col: GrDataColumn<TRow>, index: number) => string[]
  measureLayout: () => void
}

export function useDataTableLayout<TRow extends Record<string, unknown>>(
  options: UseDataTableLayoutOptions<TRow>,
): DataTableLayout<TRow> {
  const hasPinnedLeft = computed(() => options.orderedColumns().some(col => col.pinned === 'left'))
  const pinnedOffsets = ref<Record<string, number>>({})

  /**
   * Смещения липких колонок считаются по **измеренным** ширинам соседей: колонка
   * может жить на авторазметке, и тогда взять смещение больше неоткуда. Отсюда же
   * порядок: замер после отрисовки, а не в вычислении.
   */
  function measurePinnedOffsets(): void {
    const next: Record<string, number> = {}
    const cols = options.orderedColumns()

    let left = options.selectable() && hasPinnedLeft.value
      ? options.headerCellEls.get(SELECT_COLUMN_KEY)?.getBoundingClientRect().width ?? 0
      : 0

    for (const col of cols) {
      if (col.pinned !== 'left')
        continue

      next[String(col.key)] = left
      left += options.headerCellEls.get(String(col.key))?.getBoundingClientRect().width ?? 0
    }

    let right = 0
    for (let index = cols.length - 1; index >= 0; index -= 1) {
      const col = cols[index]
      if (col.pinned !== 'right')
        continue

      next[String(col.key)] = right
      right += options.headerCellEls.get(String(col.key))?.getBoundingClientRect().width ?? 0
    }

    pinnedOffsets.value = next
  }

  function measureColumnWidths(): void {
    if (!options.resizableColumns())
      return

    const next: Record<string, number> = {}

    for (const col of options.orderedColumns()) {
      const key = String(col.key)
      const width = options.headerCellEls.get(key)?.getBoundingClientRect().width

      if (width)
        next[key] = Math.round(width)
    }

    options.onMeasuredWidths(next)
  }

  function measureLayout(): void {
    measurePinnedOffsets()
    measureColumnWidths()
  }

  function pinnedStyleOf(col: GrDataColumn<TRow>): Record<string, string> | undefined {
    if (!col.pinned)
      return undefined

    const offset = pinnedOffsets.value[String(col.key)] ?? 0

    return col.pinned === 'left' ? { left: `${offset}px` } : { right: `${offset}px` }
  }

  /** Тень рисует только крайняя колонка группы — иначе полос было бы столько же, сколько колонок. */
  function pinnedEdgeClass(col: GrDataColumn<TRow>, index: number): string {
    const cols = options.orderedColumns()
    if (col.pinned === 'left')
      return cols[index + 1]?.pinned === 'left' ? '' : columnPinnedLeftEdgeClass
    if (col.pinned === 'right')
      return cols[index - 1]?.pinned === 'right' ? '' : columnPinnedRightEdgeClass

    return ''
  }

  function pinnedCellClass(col: GrDataColumn<TRow>, index: number): string[] {
    if (!col.pinned)
      return []

    return [columnPinnedClass, pinnedEdgeClass(col, index)]
  }

  /**
   * Ширину колонки меняет не только правка пропов: окно, шрифт и содержимое
   * ячейки двигают её сами. `ResizeObserver` — единственный способ узнать об этом;
   * в jsdom и на сервере его нет, там хватает пересчёта по изменению данных.
   */
  let layoutObserver: ResizeObserver | null = null

  onMounted(() => {
    measureLayout()

    if (typeof ResizeObserver === 'undefined')
      return

    layoutObserver = new ResizeObserver(() => measureLayout())
    const el = options.headerCellEls.get(SELECT_COLUMN_KEY)
      ?? options.headerCellEls.get(options.columnKeys()[0])
    if (el?.parentElement)
      layoutObserver.observe(el.parentElement)
  })

  onUnmounted(() => {
    layoutObserver?.disconnect()
    layoutObserver = null
  })

  watch(options.watchSources, () => void nextTick(measureLayout))

  return { hasPinnedLeft, pinnedStyleOf, pinnedCellClass, measureLayout }
}
