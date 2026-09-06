import type { ComputedRef } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export type GrDataTableDetailState = 'idle' | 'loading' | 'error' | 'ready'

export type GrDataTableRowKey = string | number

/** Подгрузка подробностей строки. `signal` обязателен: строку сворачивают чаще, чем ждут. */
export type GrDataTableLoadDetail<TRow> = (row: TRow, signal: AbortSignal) => Promise<unknown>

/**
 * Раскрытие строк `GrDataTable`: состояние второго яруса и его подгрузка.
 *
 * Всё хранится **по ключу строки**, а не по индексу: сортировка и смена
 * страницы переставляют строки, и привязка к позиции показывала бы подробности
 * соседа.
 *
 * Асинхронность здесь по образцу `GrAutocomplete/useRemoteOptions`, а не
 * `useTree`: у дерева ленивая загрузка живёт колбэком без пути ошибки — не
 * позвал потребитель `resolve`, и узел грузится вечно. Строка обязана уметь
 * показать отказ и дать повтор.
 */
export interface UseDataTableExpansionOptions<TRow extends Record<string, unknown>> {
  /** Контролируемый список. `undefined` — состояние помнит компонент. */
  expandedKeys: () => GrDataTableRowKey[] | undefined
  /** Идентичность набора: её смена сбрасывает кэш подробностей. */
  rows: () => TRow[]
  expandableRow: () => ((row: TRow) => boolean) | undefined
  loadDetail: () => GrDataTableLoadDetail<TRow> | undefined
  /** Раскрыта не больше одной строки. */
  accordion: () => boolean
  rowKeyValue: (row: TRow) => GrDataTableRowKey
  onExpandedChange: (keys: GrDataTableRowKey[]) => void
  onExpand: (row: TRow, key: GrDataTableRowKey) => void
  onCollapse: (row: TRow, key: GrDataTableRowKey) => void
  onDetailLoadError: (row: TRow, key: GrDataTableRowKey, error: unknown) => void
}

export interface DataTableExpansion<TRow extends Record<string, unknown>> {
  expandedKeys: ComputedRef<Set<GrDataTableRowKey>>
  isRowExpandable: (row: TRow) => boolean
  isRowExpanded: (row: TRow) => boolean
  toggleRow: (row: TRow) => void
  collapseAll: () => void
  detailStateOf: (row: TRow) => GrDataTableDetailState
  detailDataOf: (row: TRow) => unknown
  /** Повтор после отказа — и он же ручной перезапрос. */
  retryDetail: (row: TRow) => void
  /** Сбросить загруженное: у ключа либо целиком. */
  invalidateDetail: (key?: GrDataTableRowKey) => void
}

export function useDataTableExpansion<TRow extends Record<string, unknown>>(
  options: UseDataTableExpansionOptions<TRow>,
): DataTableExpansion<TRow> {
  const internalExpanded = ref<GrDataTableRowKey[]>([])
  const isExpandedControlled = computed(() => options.expandedKeys() !== undefined)

  const expandedKeys = computed<Set<GrDataTableRowKey>>(
    () => new Set(options.expandedKeys() ?? internalExpanded.value),
  )

  const states = ref(new Map<GrDataTableRowKey, GrDataTableDetailState>())
  const data = ref(new Map<GrDataTableRowKey, unknown>())

  /**
   * Летящие запросы по ключу. Счётчик поколений отдельно от контроллера: ответ,
   * стартовавший раньше и пришедший позже, обязан проиграть последнему, а
   * `abort()` сам по себе этого не гарантирует — промис уже мог разрешиться.
   */
  const inflight = new Map<GrDataTableRowKey, AbortController>()
  const generation = new Map<GrDataTableRowKey, number>()

  function setState(key: GrDataTableRowKey, state: GrDataTableDetailState): void {
    const next = new Map(states.value)
    next.set(key, state)
    states.value = next
  }

  function cancel(key: GrDataTableRowKey): void {
    inflight.get(key)?.abort()
    inflight.delete(key)
    // Поколение сдвигается вместе с отменой: иначе `finally` уже летящего
    // запроса вернул бы строку из `idle` обратно в `ready`.
    generation.set(key, (generation.get(key) ?? 0) + 1)
  }

  function isRowExpandable(row: TRow): boolean {
    const predicate = options.expandableRow()
    return predicate ? predicate(row) : true
  }

  function isRowExpanded(row: TRow): boolean {
    return expandedKeys.value.has(options.rowKeyValue(row))
  }

  function detailStateOf(row: TRow): GrDataTableDetailState {
    return states.value.get(options.rowKeyValue(row)) ?? 'idle'
  }

  function detailDataOf(row: TRow): unknown {
    return data.value.get(options.rowKeyValue(row))
  }

  async function load(row: TRow, key: GrDataTableRowKey): Promise<void> {
    const loadDetail = options.loadDetail()
    if (!loadDetail)
      return

    cancel(key)
    const controller = new AbortController()
    inflight.set(key, controller)
    const seq = generation.get(key) ?? 0
    setState(key, 'loading')

    try {
      const result = await loadDetail(row, controller.signal)
      if (seq !== generation.get(key))
        return

      const next = new Map(data.value)
      next.set(key, result)
      data.value = next
      setState(key, 'ready')
    }
    catch (error) {
      if (seq !== generation.get(key) || controller.signal.aborted)
        return

      setState(key, 'error')
      options.onDetailLoadError(row, key, error)
    }
    finally {
      if (inflight.get(key) === controller)
        inflight.delete(key)
    }
  }

  function commit(keys: GrDataTableRowKey[]): void {
    if (!isExpandedControlled.value)
      internalExpanded.value = keys

    options.onExpandedChange(keys)
  }

  function toggleRow(row: TRow): void {
    if (!isRowExpandable(row))
      return

    const key = options.rowKeyValue(row)

    if (expandedKeys.value.has(key)) {
      // Свернули до ответа — запрос больше не нужен: строки, которой он
      // предназначался, на экране нет.
      cancel(key)
      if (states.value.get(key) === 'loading')
        setState(key, 'idle')

      commit([...expandedKeys.value].filter(item => item !== key))
      options.onCollapse(row, key)
      return
    }

    const next = options.accordion() ? [key] : [...expandedKeys.value, key]
    commit(next)
    options.onExpand(row, key)

    // Загруженное держится, пока строка жива: повторное раскрытие запроса не шлёт.
    if (options.loadDetail() && states.value.get(key) !== 'ready')
      void load(row, key)
  }

  function collapseAll(): void {
    for (const key of expandedKeys.value) cancel(key)
    commit([])
  }

  function retryDetail(row: TRow): void {
    void load(row, options.rowKeyValue(row))
  }

  function invalidateDetail(key?: GrDataTableRowKey): void {
    if (key === undefined) {
      for (const item of inflight.keys()) cancel(item)
      states.value = new Map()
      data.value = new Map()
      return
    }

    cancel(key)
    const nextStates = new Map(states.value)
    nextStates.delete(key)
    states.value = nextStates

    const nextData = new Map(data.value)
    nextData.delete(key)
    data.value = nextData
  }

  /**
   * Смена идентичности набора сбрасывает загруженное — то же правило, что у
   * виртуализатора: мутация массива на месте сохраняет, замена сбрасывает.
   * Иначе строка показывала бы подробности прошлого набора данных.
   */
  watch(() => options.rows(), () => invalidateDetail())

  onBeforeUnmount(() => {
    for (const key of inflight.keys()) cancel(key)
  })

  return {
    expandedKeys,
    isRowExpandable,
    isRowExpanded,
    toggleRow,
    collapseAll,
    detailStateOf,
    detailDataOf,
    retryDetail,
    invalidateDetail,
  }
}
