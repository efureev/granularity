import type { ComputedRef, MaybeRefOrGetter, Ref, WritableComputedRef } from 'vue'
import { computed, getCurrentInstance, onMounted, onScopeDispose, ref, shallowRef, toValue, watch } from 'vue'

import type { DataSourceDefaults, DataSourceSort, DataSourceState, FilterValue, SortDir } from './core/state'
import { applyPatch, createState, isEmptyFilter, sameState } from './core/state'
import { readStateFromQuery, writeStateToQuery } from './core/query'
import type { DataSourceUrlAdapter } from './url'
import { historyUrlAdapter } from './url'

/** Запрос, который уходит в `fetcher`. Форма по умолчанию — она же адаптер. */
export interface DataSourceRequest {
  page: number
  perPage: number
  sort: DataSourceSort | null
  filters: Readonly<Record<string, FilterValue>>
  search: string
}

export interface DataSourceResult<TRow> {
  rows: readonly TRow[]
  total: number
}

export interface DataSourceUrlOptions {
  /** Разводит два списка на одной странице: `?users.page=2&orders.page=1`. */
  prefix?: string
  /** Своя точка сопряжения с адресом. Не задана — History API. */
  adapter?: DataSourceUrlAdapter
}

export interface UseDataSourceOptions<TRow> {
  /**
   * Серверная стратегия. Получает запрос и `signal`; пробрасывать `signal` в
   * транспорт стоит, но не обязательно — от гонки защищает не только он.
   */
  fetcher?: (request: DataSourceRequest, context: { signal: AbortSignal }) => Promise<DataSourceResult<TRow>>
  /** Клиентская стратегия: весь набор сразу, фильтр и срез считаются здесь. */
  rows?: MaybeRefOrGetter<readonly TRow[]>
  /** Совпадает ли строка с поиском. Не задан — подстрока по текстовым полям. */
  match?: (row: TRow, search: string) => boolean
  /** Проходит ли строка фильтры. Не задан — равенство по имени поля. */
  filter?: (row: TRow, filters: Readonly<Record<string, FilterValue>>) => boolean
  /** Порядок двух строк. Не задан — сравнение значений поля `sort.key`. */
  compare?: (a: TRow, b: TRow, sort: DataSourceSort) => number
  defaults?: DataSourceDefaults
  /**
   * Задержка перед запросом при правке поиска и фильтров, мс. `0` выключает.
   * Клики по странице и сортировке не откладываются: это разовые действия, а
   * не набор текста.
   */
  debounce?: number
  /** Запросить сразу. `false` — ждать первого `reload()`. */
  immediate?: boolean
  /** Синхронизация с адресной строкой. Не задана — состояние живёт в памяти. */
  url?: DataSourceUrlOptions
}

/**
 * Пропсы и обработчики таблицы. Тип точный, а не `Record<string, unknown>`:
 * `v-bind` со слабым типом прячет от `vue-tsc` обязательные пропсы, и у
 * потребителя с проверкой типов страница краснеет на ровном месте.
 */
export interface DataSourceTableBinding<TRow> {
  rows: TRow[]
  loading: boolean
  externalSort: true
  sortKey: string
  sortDir: SortDir
  'onUpdate:sortKey': (key: string) => void
  'onUpdate:sortDir': (dir: SortDir) => void
}

export interface DataSourcePaginationBinding {
  page: number
  pageSize: number
  total: number
  'onUpdate:page': (page: number) => void
  'onUpdate:pageSize': (pageSize: number) => void
}

export interface UseDataSourceReturn<TRow> {
  state: ComputedRef<DataSourceState>
  rows: ComputedRef<TRow[]>
  total: ComputedRef<number>
  pageCount: ComputedRef<number>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<unknown>>

  /**
   * Писуемые ссылки под `v-model` — основной способ связать композабл с
   * компонентами:
   *
   * ```vue
   * <GrDataTable :rows="rows" :loading="loading" external-sort
   *              v-model:sort-key="sortKey" v-model:sort-dir="sortDir" :columns="columns" />
   * <GrPagination v-model:page="page" v-model:page-size="perPage" :total="total" />
   * ```
   *
   * Длиннее, чем `v-bind`, ровно на имена пропов — зато `vue-tsc` их видит.
   */
  page: WritableComputedRef<number>
  perPage: WritableComputedRef<number>
  sortKey: WritableComputedRef<string>
  sortDir: WritableComputedRef<SortDir>
  search: WritableComputedRef<string>
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  setSort: (sort: DataSourceSort | null) => void
  setSearch: (search: string) => void
  setFilter: (name: string, value: FilterValue) => void
  setFilters: (filters: Readonly<Record<string, FilterValue>>) => void
  /** Вернуть всё к умолчаниям. */
  reset: () => void
  /** Повторить запрос текущего состояния — например после правки строки. */
  reload: () => Promise<void>
  /**
   * Те же значения одним объектом: `<GrDataTable v-bind="table" :columns="columns" />`.
   *
   * Короче ссылок, но у строгой проверки шаблонов есть цена: `vue-tsc` не
   * засчитывает `v-bind`-спред в обязательные пропсы, и `rows` придётся указать
   * ещё и явно. В проекте без проверки шаблонов это самый короткий путь.
   */
  table: ComputedRef<DataSourceTableBinding<TRow>>
  /** То же для `GrPagination`; та же оговорка про `vue-tsc`. */
  pagination: ComputedRef<DataSourcePaginationBinding>
}

function isAbortError(value: unknown): boolean {
  return value instanceof Error && value.name === 'AbortError'
}

/** Текстовое представление значения строки — для поиска по умолчанию. */
function searchable(row: unknown): string {
  if (row === null || typeof row !== 'object') return String(row ?? '')

  return Object.values(row as Record<string, unknown>)
    .filter(value => typeof value === 'string' || typeof value === 'number')
    .join(' ')
}

function defaultMatch(row: unknown, search: string): boolean {
  return searchable(row).toLowerCase().includes(search.toLowerCase())
}

function defaultFilter(row: unknown, filters: Readonly<Record<string, FilterValue>>): boolean {
  const record = (row ?? {}) as Record<string, unknown>

  return Object.entries(filters).every(([name, value]) => {
    if (isEmptyFilter(value)) return true
    if (Array.isArray(value)) return value.some(item => String(item) === String(record[name]))

    return String(value) === String(record[name])
  })
}

function defaultCompare(a: unknown, b: unknown, sort: DataSourceSort): number {
  const left = (a as Record<string, unknown>)?.[sort.key]
  const right = (b as Record<string, unknown>)?.[sort.key]
  const sign = sort.dir === 'desc' ? -1 : 1

  if (typeof left === 'number' && typeof right === 'number') return (left - right) * sign

  return String(left ?? '').localeCompare(String(right ?? '')) * sign
}

/** Правки, при которых запрос откладывается: их вводят, а не нажимают. */
function isTyped(before: DataSourceState, after: DataSourceState): boolean {
  return before.page === after.page && before.perPage === after.perPage && before.sort === after.sort
}

/**
 * Состояние списка одним композаблом: сортировка, фильтры, страница, поиск,
 * адресная строка и запрос без гонок.
 *
 * Пакет не импортирует ядро ни разу — `table` и `pagination` это обычные
 * объекты пропов, которые потребитель раскрывает через `v-bind`. Граница
 * намеренная: состояние списка не обязано знать, чем этот список нарисован.
 */
export function useDataSource<TRow>(options: UseDataSourceOptions<TRow> = {}): UseDataSourceReturn<TRow> {
  const defaults = createState(options.defaults)
  const state = ref<DataSourceState>({ ...defaults })

  const serverRows = shallowRef<TRow[]>([])
  const serverTotal = ref(0)
  const loading = ref(false)
  const error = shallowRef<unknown>(null)

  const isServer = typeof options.fetcher === 'function'

  if (__GR_DEV__ && !isServer && options.rows === undefined) {
    console.warn(
      '[granularity-datasource] useDataSource вызван без `fetcher` и без `rows`: '
      + 'источник данных не задан, список останется пустым.',
    )
  }

  // ————— Клиентская стратегия: фильтр, порядок и срез считаются здесь.

  const source = computed<readonly TRow[]>(() => toValue(options.rows) ?? [])

  const clientMatched = computed<TRow[]>(() => {
    const { filters, search } = state.value
    const match = options.match ?? defaultMatch
    const filter = options.filter ?? defaultFilter

    return source.value
      .filter(row => filter(row, filters))
      .filter(row => (search ? match(row, search) : true))
  })

  const clientSorted = computed<TRow[]>(() => {
    const { sort } = state.value
    if (!sort) return clientMatched.value

    const compare = options.compare ?? defaultCompare

    return [...clientMatched.value].sort((a, b) => compare(a, b, sort))
  })

  const clientRows = computed<TRow[]>(() => {
    const { page, perPage } = state.value
    const start = (page - 1) * perPage

    return clientSorted.value.slice(start, start + perPage)
  })

  const rows = computed<TRow[]>(() => (isServer ? serverRows.value : clientRows.value))
  const total = computed(() => (isServer ? serverTotal.value : clientMatched.value.length))
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / state.value.perPage)))

  // ————— Серверная стратегия: запрос и защита от гонок.

  let inflight: AbortController | null = null
  let seq = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function toRequest(current: DataSourceState): DataSourceRequest {
    return {
      page: current.page,
      perPage: current.perPage,
      sort: current.sort,
      filters: { ...current.filters },
      search: current.search,
    }
  }

  async function run(): Promise<void> {
    const { fetcher } = options
    if (!fetcher) return

    inflight?.abort()
    const controller = new AbortController()
    inflight = controller

    /**
     * Счётчик, а не только `AbortController`.
     *
     * `fetcher` принадлежит потребителю и вправе не пробросить `signal` — тогда
     * прерванный запрос всё равно вернётся и перезапишет собой свежие данные.
     * Гонку закрывает именно номер: ответ не своего номера выбрасывается, чем
     * бы он ни был. Тот же приём стоит в `GrAutocomplete` ядра.
     */
    const current = ++seq

    loading.value = true
    error.value = null

    try {
      const result = await fetcher(toRequest(state.value), { signal: controller.signal })
      if (current !== seq) return

      // Копия, а не ссылка: наружу уходит изменяемый массив, какой ждёт таблица.
      serverRows.value = [...result.rows]
      serverTotal.value = result.total
    }
    catch (raised) {
      // Прерванный запрос — не ошибка: его прервали мы сами.
      if (current !== seq || isAbortError(raised)) return

      error.value = raised
    }
    finally {
      if (current === seq) loading.value = false
    }
  }

  function schedule(delay: number): void {
    if (!isServer) return
    if (timer !== null) clearTimeout(timer)

    if (delay <= 0) {
      void run()
      return
    }

    timer = setTimeout(() => {
      timer = null
      void run()
    }, delay)
  }

  function patch(next: Partial<DataSourceState>): void {
    const applied = applyPatch(state.value, next)
    if (sameState(applied, state.value)) return

    const delay = isTyped(state.value, applied) ? (options.debounce ?? 300) : 0

    state.value = applied
    schedule(delay)
  }

  // ————— Адресная строка.

  const url = options.url
  const adapter = url ? url.adapter ?? historyUrlAdapter() : null

  function readFromUrl(): void {
    if (!adapter) return

    const next = readStateFromQuery(adapter.read(), { prefix: url?.prefix, defaults })
    if (sameState(next, state.value)) return

    state.value = next
    schedule(0)
  }

  function writeToUrl(): void {
    if (!adapter) return

    // `replace`, а не запись в историю: перелистывание и правка фильтра — не
    // навигация. Иначе «назад» перестанет уводить со страницы и начнёт
    // отматывать чужие клики по сортировке.
    adapter.write(writeStateToQuery(adapter.read(), state.value, { prefix: url?.prefix, defaults }), { replace: true })
  }

  if (adapter) {
    watch(state, writeToUrl, { deep: true })

    const stop = adapter.subscribe(readFromUrl)
    onScopeDispose(stop)
  }

  // ————— Первый запрос.

  const immediate = options.immediate ?? true

  function start(): void {
    // Адрес читается **после** монтирования: прочитай его в setup, и серверная
    // разметка (умолчания) разошлась бы с первым клиентским рендером (страница
    // из ссылки) — гидрация об этом сообщит предупреждением.
    readFromUrl()
    if (immediate) schedule(0)
  }

  if (getCurrentInstance()) onMounted(start)
  else start()

  onScopeDispose(() => {
    if (timer !== null) clearTimeout(timer)
    inflight?.abort()
  })

  return {
    state: computed(() => state.value),
    rows,
    total,
    pageCount,
    loading,
    error,

    page: computed({
      get: () => state.value.page,
      set: value => patch({ page: Math.max(1, Math.trunc(value)) }),
    }),
    perPage: computed({
      get: () => state.value.perPage,
      set: value => patch({ perPage: Math.max(1, Math.trunc(value)) }),
    }),
    sortKey: computed({
      get: () => state.value.sort?.key ?? '',
      set: key => patch({ sort: key ? { key, dir: state.value.sort?.dir ?? 'asc' } : null }),
    }),
    sortDir: computed({
      get: () => state.value.sort?.dir ?? 'asc',
      set: dir => patch({ sort: state.value.sort ? { key: state.value.sort.key, dir } : null }),
    }),
    search: computed({
      get: () => state.value.search,
      set: value => patch({ search: value }),
    }),

    setPage: page => patch({ page: Math.max(1, Math.trunc(page)) }),
    setPerPage: perPage => patch({ perPage: Math.max(1, Math.trunc(perPage)) }),
    setSort: sort => patch({ sort }),
    setSearch: search => patch({ search }),
    setFilter: (name, value) => patch({ filters: { ...state.value.filters, [name]: value } }),
    setFilters: filters => patch({ filters }),

    reset: () => patch({ ...defaults, page: defaults.page }),
    reload: async () => {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }

      await run()
    },

    table: computed<DataSourceTableBinding<TRow>>(() => ({
      rows: rows.value,
      loading: loading.value,
      externalSort: true,
      sortKey: state.value.sort?.key ?? '',
      sortDir: state.value.sort?.dir ?? 'asc',
      'onUpdate:sortKey': (key: string) => {
        patch({ sort: key ? { key, dir: state.value.sort?.dir ?? 'asc' } : null })
      },
      'onUpdate:sortDir': (dir: SortDir) => {
        patch({ sort: state.value.sort ? { key: state.value.sort.key, dir } : null })
      },
    })),

    pagination: computed<DataSourcePaginationBinding>(() => ({
      page: state.value.page,
      pageSize: state.value.perPage,
      total: total.value,
      'onUpdate:page': (page: number) => patch({ page }),
      'onUpdate:pageSize': (pageSize: number) => patch({ perPage: pageSize }),
    })),
  }
}
