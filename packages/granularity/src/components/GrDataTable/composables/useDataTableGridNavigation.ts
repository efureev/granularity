import type { ComputedRef } from 'vue'
import { computed, nextTick } from 'vue'

import { useRovingFocus } from '../../../composables/useRovingFocus'

/**
 * Клавиатура по ячейкам: паттерн `grid` из WAI-ARIA APG.
 *
 * Своей арифметики здесь нет — её ведёт `useRovingFocus` в режиме `grid`. Этот
 * модуль отвечает за то, чего примитив знать не может: как адресуется ячейка
 * таблицы, что делать на краю окна виртуализации и куда прокрутить, прежде чем
 * фокусировать.
 *
 * **Кольцо не замкнуто.** У списка зацикливание уместно, у сетки нет: строка
 * ниже последней — это не первая, а «дальше некуда», и в виртуальном списке
 * именно на этом краю начинается подгрузка.
 *
 * **Набор — отрисованное окно, а не вся таблица.** У десяти тысяч строк на шесть
 * колонок ключей было бы шестьдесят тысяч, и пересобирались бы они при каждом
 * чтении. Шаг за край окна разбирается до примитива (`windowStep`): список
 * прокручивается, и фокус уходит в строку, появившуюся следующим кадром.
 */

/** Строка шапки адресуется как `-1`: в наборе она первая, но строкой данных не является. */
export const HEADER_ROW_INDEX = -1

/** Ключ ячейки. Строка вместо пары чисел — примитив сравнивает ключи по `===`. */
export type GrGridCellKey = string

export function gridCellKey(row: number, column: number): GrGridCellKey {
  return `${row}:${column}`
}

export function parseGridCellKey(key: GrGridCellKey): { row: number, column: number } {
  const [row, column] = key.split(':')
  return { row: Number(row), column: Number(column) }
}

export interface UseDataTableGridNavigationOptions {
  /** Включена ли навигация по ячейкам. Выключенная не занимает ни одной клавиши. */
  enabled: () => boolean
  /** Ширина сетки со служебными колонками. */
  columns: () => number
  /** Индексы отрисованных строк в порядке показа. При виртуализации — только окно. */
  renderedRows: () => number[]
  /** Сколько всего строк: по нему считается край при виртуализации. */
  totalRows: () => number
  /** Узлы ячеек по ключу. Заполняется `:ref` самой таблицы. */
  cellEls: Map<GrGridCellKey, HTMLElement>
  /**
   * Прокрутить список к строке. Есть только при виртуализации: без неё строка
   * уже в разметке, и доводить до экрана её незачем.
   */
  scrollToRow?: (index: number) => void
}

/** Что внутри ячейки может принять фокус. Порядок обхода — документный. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export interface DataTableGridNavigation {
  /** Ключ ячейки, держащей остановку `Tab`. */
  rovingKey: ComputedRef<GrGridCellKey | undefined>
  tabindexFor: (row: number, column: number) => 0 | -1
  setActive: (row: number, column: number) => void
  /** Обработчик `keydown` на таблице. Возвращает `true`, если клавиша разобрана. */
  onKeydown: (event: KeyboardEvent) => boolean
}

export function useDataTableGridNavigation(
  options: UseDataTableGridNavigationOptions,
): DataTableGridNavigation {
  /**
   * Ячейки окна плюс шапка, по строкам. Порядок обязан совпадать с показом:
   * примитив считает соседа сдвигом по этому массиву.
   */
  const cellKeys = computed<GrGridCellKey[]>(() => {
    if (!options.enabled())
      return []

    const width = options.columns()
    const rows = [HEADER_ROW_INDEX, ...options.renderedRows()]

    return rows.flatMap(row => Array.from({ length: width }, (_, column) => gridCellKey(row, column)))
  })

  const roving = useRovingFocus<GrGridCellKey>({
    items: () => cellKeys.value,
    elementFor: key => options.cellEls.get(key),
    orientation: () => 'grid',
    columns: () => options.columns(),
    // Сетка по краям не зацикливается: строка ниже последней — не первая.
    wrap: () => false,
    // Строка могла появиться в разметке только что — ждём кадр, иначе фокус
    // уйдёт в узел, которого ещё нет.
    beforeFocus: key => (options.cellEls.has(key) ? undefined : nextTick()),
  })

  /**
   * Шаг за край **окна** при виртуализации.
   *
   * Примитиву это доверить нельзя, и не из-за его устройства: шапка всегда
   * стоит в наборе первой, поэтому стрелка вверх из первой отрисованной строки
   * уходит в шапку — а должна уводить к строке выше окна. Край набора и край
   * таблицы здесь разные вещи, и различить их может только тот, кто знает
   * общее число строк.
   *
   * Возвращает строку, к которой надо прокрутить, или `null` — тогда клавишу
   * разбирает примитив.
   */
  function windowStep(event: KeyboardEvent): number | null {
    if (!options.scrollToRow || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp'))
      return null

    const active = roving.rovingKey.value
    if (!active)
      return null

    const { row } = parseGridCellKey(active)
    const rendered = options.renderedRows()
    if (rendered.length === 0)
      return null

    if (event.key === 'ArrowDown') {
      const last = rendered.at(-1)!
      // Не на нижнем крае окна — шаг обычный.
      if (row !== last)
        return null

      return last + 1 < options.totalRows() ? last + 1 : null
    }

    const first = rendered[0]
    // Из шапки вверх идти некуда, и прокручивать список тем более незачем.
    if (row !== first)
      return null

    return first > 0 ? first - 1 : null
  }

  /** Ячейка, в которой сейчас фокус (или которая его держит). */
  function activeCell(): HTMLElement | undefined {
    const key = roving.rovingKey.value
    return key ? options.cellEls.get(key) : undefined
  }

  /**
   * Вход в ячейку: `Enter` или `F2` отдают фокус тому, что внутри.
   *
   * Без этого шага паттерн неполон, а не «упрощён»: сетка забирает `Tab` себе,
   * и кнопка сортировки, чекбокс или ссылка в ячейке иначе становятся
   * недостижимы с клавиатуры вовсе.
   */
  function enterCell(event: KeyboardEvent): boolean {
    if (event.key !== 'Enter' && event.key !== 'F2')
      return false

    const cell = activeCell()
    // Фокус уже внутри — клавиша принадлежит содержимому, а не сетке.
    if (!cell || (document.activeElement && document.activeElement !== cell && cell.contains(document.activeElement)))
      return false

    const target = cell.querySelector<HTMLElement>(FOCUSABLE)
    if (!target)
      return false

    event.preventDefault()
    target.focus()
    return true
  }

  /** Выход из ячейки: `Escape` возвращает фокус самой ячейке. */
  function leaveCell(event: KeyboardEvent): boolean {
    if (event.key !== 'Escape')
      return false

    const cell = activeCell()
    if (!cell || !document.activeElement || document.activeElement === cell || !cell.contains(document.activeElement))
      return false

    event.preventDefault()
    cell.focus()
    return true
  }

  return {
    rovingKey: roving.rovingKey,
    tabindexFor: (row, column) => (options.enabled() ? roving.tabindexFor(gridCellKey(row, column)) : -1),
    setActive: (row, column) => roving.setActive(gridCellKey(row, column)),
    onKeydown: (event) => {
      if (!options.enabled())
        return false

      if (enterCell(event) || leaveCell(event))
        return true

      const row = windowStep(event)
      if (row !== null) {
        event.preventDefault()
        options.scrollToRow?.(row)
        // Строка появится в разметке следующим кадром — тогда и фокусируем.
        const { column } = parseGridCellKey(roving.rovingKey.value!)
        void nextTick(() => roving.focusKey(gridCellKey(row, column)))
        return true
      }

      return roving.handleNavigationKeys(event)
    },
  }
}
