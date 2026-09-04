import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'

import { useDragGesture } from '../../../composables/useDragGesture'
import type { GrDataColumn } from '../GrDataTable.vue'

/** Уже колонки не бывает: в неё перестаёт помещаться даже стрелка сортировки. */
export const MIN_COLUMN_WIDTH = 48

/** Шаг клавиатуры и крупный шаг — как у `GrSplitter`. */
const RESIZE_STEP = 16
const RESIZE_BIG_STEP = 48

/**
 * Ширина колонок `GrDataTable`: протяжка ручки, клавиатура и сброс к авторазметке.
 *
 * Измеренные ширины сюда **приходят снаружи** (`setMeasuredWidths`): замер —
 * дело раскладки, которая ходит в DOM после отрисовки, а здесь они только
 * читаются, чтобы ручка называла значение с первого рендера.
 */
export interface UseDataTableColumnWidthsOptions<TRow extends Record<string, unknown>> {
  /** Колонки в текущем порядке — по ним считается минимальная ширина таблицы. */
  orderedColumns: () => GrDataColumn<TRow>[]
  /** Контролируемые ширины. `undefined` — компонент помнит их сам. */
  columnWidths: () => Record<string, number> | undefined
  resizableColumns: () => boolean
  loading: () => boolean
  /** Заголовочные ячейки: стартовая ширина протяжки берётся замером. */
  headerCellEls: Map<string, HTMLElement>
  onWidthsChange: (widths: Record<string, number>) => void
  onColumnResize: (key: string, width: number) => void
  announceWidth: (label: string, width: number) => void
}

export interface DataTableColumnWidths<TRow extends Record<string, unknown>> {
  columnWidths: ComputedRef<Record<string, number>>
  measuredColumnWidths: Ref<Record<string, number>>
  setMeasuredWidths: (widths: Record<string, number>) => void
  widthOf: (col: GrDataColumn<TRow>) => string | number | undefined
  tableMinWidth: ComputedRef<number | undefined>
  resizingKey: Ref<string | null>
  onResizerPointerDown: (event: PointerEvent, key: string) => void
  onResizerKeydown: (event: KeyboardEvent, key: string) => void
  /** Сброс к авторазметке — двойной клик по ручке в шаблоне. */
  resetColumnWidth: (key: string) => void
  resizerValue: (col: GrDataColumn<TRow>) => number
}

export function useDataTableColumnWidths<TRow extends Record<string, unknown>>(
  options: UseDataTableColumnWidthsOptions<TRow>,
): DataTableColumnWidths<TRow> {
  const internalColumnWidths = ref<Record<string, number>>({})
  const columnWidths = computed(() => options.columnWidths() ?? internalColumnWidths.value)

  /** Фактические ширины шапки: заполняются замером раскладки. */
  const measuredColumnWidths = ref<Record<string, number>>({})

  function setMeasuredWidths(widths: Record<string, number>): void {
    measuredColumnWidths.value = widths
  }

  /** Ширина колонки: заданная пользователем сильнее объявленной в `columns`. */
  function widthOf(col: GrDataColumn<TRow>): string | number | undefined {
    return columnWidths.value[String(col.key)] ?? col.width
  }

  /**
   * Сумма заданных ширин — минимальная ширина таблицы.
   *
   * Без неё фиксированная раскладка вписывает таблицу в контейнер и делит место
   * пропорционально: колонка, которую пользователь растянул, ужимается обратно, а
   * горизонтальной прокрутки — той самой, ради которой закрепляют колонки, — не
   * возникает. Считается, только когда ширина известна у **всех** колонок: с
   * одной неизвестной сумма врала бы.
   */
  const tableMinWidth = computed<number | undefined>(() => {
    const cols = options.orderedColumns()
    if (cols.length === 0)
      return undefined

    let total = 0
    for (const col of cols) {
      const width = widthOf(col)
      if (typeof width !== 'number')
        return undefined

      total += width
    }

    return total
  })

  const resizingKey = ref<string | null>(null)
  let pendingResizeKey: string | null = null
  let resizeStartX = 0
  let resizeStartWidth = 0
  let widthBeforeResize: number | undefined

  function commitWidths(next: Record<string, number>): void {
    internalColumnWidths.value = next
    options.onWidthsChange(next)
  }

  function setColumnWidth(key: string, width: number): void {
    commitWidths({ ...columnWidths.value, [key]: Math.max(MIN_COLUMN_WIDTH, Math.round(width)) })
  }

  function announceWidth(key: string): void {
    const col = options.orderedColumns().find(item => String(item.key) === key)
    if (!col)
      return

    options.announceWidth(col.label, columnWidths.value[key] ?? 0)
  }

  const resizeGesture = useDragGesture({
    disabled: () => !options.resizableColumns() || options.loading(),
    onStart: (event) => {
      const key = pendingResizeKey
      const el = key === null ? null : options.headerCellEls.get(key)
      if (key === null || !el)
        return false

      resizeStartX = event.clientX
      // Стартовая ширина — измеренная, а не объявленная: колонка могла жить на
      // авторазметке, и тянуть её надо от того, что видно.
      resizeStartWidth = el.getBoundingClientRect().width
      widthBeforeResize = columnWidths.value[key]
      resizingKey.value = key
    },
    onMove: (event) => {
      if (resizingKey.value === null)
        return

      // Против выделения текста заголовка во время протяжки.
      event.preventDefault()
      setColumnWidth(resizingKey.value, resizeStartWidth + (event.clientX - resizeStartX))
    },
    onEnd: () => {
      const key = resizingKey.value
      resizingKey.value = null
      if (key === null)
        return

      options.onColumnResize(key, columnWidths.value[key] ?? Math.round(resizeStartWidth))
      announceWidth(key)
    },
    onCancel: () => {
      const key = resizingKey.value
      resizingKey.value = null
      if (key === null)
        return

      // Оборванный жест возвращает ширину, которая была до нажатия.
      const next = { ...columnWidths.value }
      if (widthBeforeResize === undefined)
        delete next[key]
      else next[key] = widthBeforeResize

      commitWidths(next)
    },
  })

  function onResizerPointerDown(event: PointerEvent, key: string): void {
    pendingResizeKey = key
    resizeGesture.start(event)
  }

  /** Сброс к авторазметке: колонка снова считается по содержимому. */
  function resetColumnWidth(key: string): void {
    if (columnWidths.value[key] === undefined)
      return

    const next = { ...columnWidths.value }
    delete next[key]

    commitWidths(next)
    options.onColumnResize(key, 0)
  }

  function resizeByKeyboard(key: string, delta: number): void {
    const measured = options.headerCellEls.get(key)?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH
    const current = columnWidths.value[key] ?? measured

    setColumnWidth(key, current + delta)
    options.onColumnResize(key, columnWidths.value[key] ?? current)
    announceWidth(key)
  }

  function onResizerKeydown(event: KeyboardEvent, key: string): void {
    if (!options.resizableColumns() || options.loading())
      return

    const step = event.shiftKey ? RESIZE_BIG_STEP : RESIZE_STEP

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      resizeByKeyboard(key, event.key === 'ArrowLeft' ? -step : step)
      return
    }

    // Отдельной клавиши «авто» в паттерне нет, поэтому её роль берёт `Enter` —
    // тот же смысл, что двойной клик по ручке.
    if (event.key === 'Enter') {
      event.preventDefault()
      resetColumnWidth(key)
    }
  }

  /**
   * Ручка ресайза — фокусируемый `separator`, а значит обязана называть текущее
   * значение с первого рендера, до всякого перетаскивания. Заданной ширины у
   * колонки может не быть вовсе (авторазметка), поэтому за значением идём к
   * измеренной; до замера остаётся объявленная в `columns`, а её тоже может не
   * быть — тогда минимум.
   */
  function resizerValue(col: GrDataColumn<TRow>): number {
    const key = String(col.key)
    const declared = typeof col.width === 'number' ? col.width : undefined

    return columnWidths.value[key] ?? measuredColumnWidths.value[key] ?? declared ?? MIN_COLUMN_WIDTH
  }

  return {
    columnWidths,
    measuredColumnWidths,
    setMeasuredWidths,
    widthOf,
    tableMinWidth,
    resizingKey,
    onResizerPointerDown,
    onResizerKeydown,
    resetColumnWidth,
    resizerValue,
  }
}
