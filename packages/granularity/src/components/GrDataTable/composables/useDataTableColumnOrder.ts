import type { ComputedRef } from 'vue'
import { computed, nextTick, ref } from 'vue'

import { useDragSort } from '../../../composables/useDragSort'
import { useRovingFocus } from '../../../composables/useRovingFocus'
import { insertionIndex, moveItem } from '../../../composables/internal/dragSortGeometry'
import type { GrDataColumn } from '../GrDataTable.vue'
import { columnDropAfterClass, columnDropBeforeClass } from '../grDataTableStyles'

/**
 * Порядок колонок `GrDataTable`: перестановка указателем и с клавиатуры.
 *
 * Закреплённые колонки стоят своими группами у своих краёв, и перенос через
 * границу группы запрещён — иначе «закреплена слева» перестало бы означать
 * «слева». Отсюда `pinGroupOf` и проверка `sameGroup` в каждом пути переноса.
 *
 * Карты элементов приходят снаружи: их наполняет шаблон, и они же нужны
 * модулям ширины и раскладки — владеть ими единолично этот модуль не может.
 */
export interface UseDataTableColumnOrderOptions<TRow extends Record<string, unknown>> {
  columns: () => GrDataColumn<TRow>[]
  /** Контролируемый порядок. `undefined` — компонент помнит порядок сам. */
  columnOrder: () => string[] | undefined
  reorderableColumns: () => boolean
  loading: () => boolean
  /** Заголовочные ячейки по ключу колонки — цель перетаскивания. */
  headerCellEls: Map<string, HTMLElement>
  /** Ручки переноса по ключу колонки — кольцо роверного фокуса. */
  columnHandleEls: Map<string, HTMLElement>
  onOrderChange: (order: string[], moved: { key: string, from: number, to: number }) => void
  /** Объявление в живой регион: перенос указателем без него беззвучен. */
  announceMove: (label: string, position: number, count: number) => void
}

export interface DataTableColumnOrder<TRow extends Record<string, unknown>> {
  orderedColumns: ComputedRef<GrDataColumn<TRow>[]>
  columnKeys: ComputedRef<string[]>
  pinGroupOf: (col: GrDataColumn<TRow>) => number
  indexOfColumn: (key: string) => number
  draggingColumnKey: ComputedRef<string | null>
  columnDropClass: (index: number) => string
  onColumnHandleKeydown: (event: KeyboardEvent, key: string) => Promise<void>
  /** Жест и кольцо фокуса отдаются целиком: шаблон зовёт их собственный API. */
  columnSort: ReturnType<typeof useDragSort<string, number>>
  columnRoving: ReturnType<typeof useRovingFocus<string>>
}

export function useDataTableColumnOrder<TRow extends Record<string, unknown>>(
  options: UseDataTableColumnOrderOptions<TRow>,
): DataTableColumnOrder<TRow> {
  /** Uncontrolled-состояние; в controlled-режиме перекрывается пропом `columnOrder`. */
  const internalColumnOrder = ref<string[]>(options.columns().map(col => String(col.key)))

  /**
   * Колонки в пользовательском порядке.
   *
   * Состав задаёт `columns`, порядок — только порядок: ключ, которого в наборе
   * нет, игнорируется, а колонка, которой нет в порядке (её только что
   * добавили), встаёт в конец. Иначе правка `columns` теряла бы колонки молча.
   */
  const orderedColumns = computed<GrDataColumn<TRow>[]>(() => {
    const order = options.columnOrder() ?? internalColumnOrder.value
    const remaining = new Map(options.columns().map(col => [String(col.key), col]))
    const ordered: GrDataColumn<TRow>[] = []

    for (const key of order) {
      const col = remaining.get(key)
      if (!col)
        continue

      remaining.delete(key)
      ordered.push(col)
    }

    for (const col of options.columns()) {
      if (remaining.has(String(col.key)))
        ordered.push(col)
    }

    // Закреплённые колонки стоят своими группами у своих краёв — иначе
    // «закреплена слева» не означало бы «слева». Сортировка устойчивая, поэтому
    // внутри группы порядок остаётся пользовательским.
    return ordered.sort((a, b) => pinGroupOf(a) - pinGroupOf(b))
  })

  /** Группа закрепления: 0 — слева, 1 — обычная колонка, 2 — справа. */
  function pinGroupOf(col: GrDataColumn<TRow>): number {
    if (col.pinned === 'left')
      return 0
    if (col.pinned === 'right')
      return 2

    return 1
  }

  const columnKeys = computed(() => orderedColumns.value.map(col => String(col.key)))

  function indexOfColumn(key: string): number {
    return columnKeys.value.indexOf(key)
  }

  function sameGroup(from: number, to: number): boolean {
    const cols = orderedColumns.value
    if (!cols[from] || !cols[to])
      return false

    return pinGroupOf(cols[from]) === pinGroupOf(cols[to])
  }

  function applyColumnMove(from: number, to: number): void {
    const keys = columnKeys.value
    if (from < 0 || to < 0 || to >= keys.length || from === to)
      return
    if (!sameGroup(from, to))
      return

    const key = keys[from]
    // Подпись берётся до перестановки: `orderedColumns` — computed, и после
    // записи порядка по индексу `from` стоит уже другая колонка.
    const label = orderedColumns.value[from]?.label ?? key
    const next = moveItem(keys, from, to)

    internalColumnOrder.value = next
    options.onOrderChange(next, { key, from, to })
    options.announceMove(label, to + 1, keys.length)
  }

  const columnSort = useDragSort<string, number>({
    items: () => columnKeys.value,
    elementFor: key => options.headerCellEls.get(key) ?? null,
    orientation: () => 'horizontal',
    disabled: () => !options.reorderableColumns() || options.loading(),
    resolveTarget: (hit, source) => {
      const to = insertionIndex(hit, indexOfColumn(source), columnKeys.value.length)

      // Через границу закрепления не переносим: группы у краёв постоянны.
      return sameGroup(indexOfColumn(source), to) ? to : null
    },
    onDrop: (source, to) => applyColumnMove(indexOfColumn(source), to),
  })

  /**
   * Кольцо роверного фокуса по ручкам: одна остановка `Tab` на всю шапку.
   * Иначе таблица из десяти колонок добавляла бы десять таб-стопов подряд.
   */
  const columnRoving = useRovingFocus<string>({
    items: () => (options.reorderableColumns() ? columnKeys.value : []),
    elementFor: key => options.columnHandleEls.get(key) ?? null,
    orientation: () => 'horizontal',
    wrap: () => false,
  })

  async function onColumnHandleKeydown(event: KeyboardEvent, key: string): Promise<void> {
    if (!options.reorderableColumns())
      return

    // `Shift` со стрелкой двигает колонку, голая стрелка — фокус между ручками.
    // Раскладка та же, что у переноса узла в `GrTree`.
    if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault()

      const from = indexOfColumn(key)
      applyColumnMove(from, event.key === 'ArrowLeft' ? from - 1 : from + 1)

      // Шапка перерисовывается: без возврата фокуса следующий `Shift` было бы
      // некуда адресовать.
      await nextTick()
      await columnRoving.focusKey(key)
      return
    }

    columnRoving.handleNavigationKeys(event)
  }

  const draggingColumnKey = computed(() => (columnSort.mode.value === null ? null : columnSort.source.value))

  /** Полоса места вставки — на колонке-соседе, со стороны движения. */
  function columnDropClass(index: number): string {
    const target = columnSort.target.value
    if (!columnSort.isActive.value || target === null || target !== index)
      return ''

    const active = columnSort.source.value === null ? -1 : indexOfColumn(columnSort.source.value)
    if (index === active)
      return ''

    return target < active ? columnDropBeforeClass : columnDropAfterClass
  }

  return {
    orderedColumns,
    columnKeys,
    pinGroupOf,
    indexOfColumn,
    draggingColumnKey,
    columnDropClass,
    onColumnHandleKeydown,
    columnSort,
    columnRoving,
  }
}
