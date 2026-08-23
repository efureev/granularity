import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DataSourceRequest, DataSourceResult, UseDataSourceOptions } from '../useDataSource'
import { useDataSource } from '../useDataSource'

interface Row { id: number, name: string, role: string, age: number }

const ROWS: Row[] = [
  { id: 1, name: 'Анна', role: 'admin', age: 34 },
  { id: 2, name: 'Борис', role: 'user', age: 41 },
  { id: 3, name: 'Вера', role: 'admin', age: 28 },
  { id: 4, name: 'Глеб', role: 'user', age: 55 },
  { id: 5, name: 'Дина', role: 'owner', age: 23 },
]

/** Композабл живёт в setup: у него `onMounted` и `onScopeDispose`. */
function mountSource<TRow>(options: UseDataSourceOptions<TRow>) {
  const captured = { value: null as ReturnType<typeof useDataSource<TRow>> | null }

  const wrapper = mount(defineComponent({
    setup() {
      captured.value = useDataSource(options)

      return () => h('div')
    },
  }))

  return { wrapper, source: () => captured.value! }
}

async function settle(times = 3) {
  for (let i = 0; i < times; i += 1) await nextTick()
}

describe('useDataSource — клиентская стратегия', () => {
  it('срез считается сам: страница, фильтр, поиск и порядок', async () => {
    const { wrapper, source } = mountSource<Row>({ rows: ROWS, defaults: { perPage: 2 } })
    await settle()

    expect(source().rows.value.map(row => row.id)).toEqual([1, 2])
    expect(source().total.value).toBe(5)
    expect(source().pageCount.value).toBe(3)

    source().setPage(2)
    await settle()
    expect(source().rows.value.map(row => row.id)).toEqual([3, 4])

    source().setFilter('role', 'admin')
    await settle()
    expect(source().rows.value.map(row => row.id)).toEqual([1, 3])
    // Смена фильтра вернула на первую страницу — иначе тут было бы пусто.
    expect(source().state.value.page).toBe(1)

    wrapper.unmount()
  })

  it('поиск по умолчанию — подстрока по текстовым полям', async () => {
    const { wrapper, source } = mountSource<Row>({ rows: ROWS })
    await settle()

    source().setSearch(' owner')
    await settle()
    expect(source().rows.value.map(row => row.id)).toEqual([5])

    wrapper.unmount()
  })

  it('порядок по умолчанию — сравнение значений поля', async () => {
    const { wrapper, source } = mountSource<Row>({ rows: ROWS })
    await settle()

    source().setSort({ key: 'age', dir: 'desc' })
    await settle()
    expect(source().rows.value.map(row => row.age)).toEqual([55, 41, 34, 28, 23])

    wrapper.unmount()
  })

  it('свой `compare` сильнее умолчания', async () => {
    const compare = vi.fn((a: Row, b: Row) => a.id - b.id)
    const { wrapper, source } = mountSource<Row>({ rows: ROWS, compare })
    await settle()

    source().setSort({ key: 'age', dir: 'desc' })
    await settle()

    // Порядок читается первым: срез — computed, и до чтения он не считается.
    expect(source().rows.value.map(row => row.id)).toEqual([1, 2, 3, 4, 5])
    expect(compare).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('источник может быть реактивным', async () => {
    const rows = ref<Row[]>([])
    const { wrapper, source } = mountSource<Row>({ rows })
    await settle()

    expect(source().total.value).toBe(0)
    rows.value = ROWS
    await settle()
    expect(source().total.value).toBe(5)

    wrapper.unmount()
  })
})

describe('useDataSource — серверная стратегия', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  function deferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>((r) => {
      resolve = r
    })

    return { promise, resolve }
  }

  it('запрос уходит сразу и получает текущее состояние', async () => {
    const fetcher = vi.fn(async (_request: DataSourceRequest): Promise<DataSourceResult<Row>> => ({ rows: ROWS, total: 5 }))
    const { wrapper, source } = mountSource<Row>({ fetcher, defaults: { perPage: 25 } })
    await settle()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]![0]).toMatchObject({ page: 1, perPage: 25, search: '', sort: null })
    expect(source().rows.value).toHaveLength(5)
    expect(source().total.value).toBe(5)

    wrapper.unmount()
  })

  /**
   * Классический источник «таблица моргнула чужими данными»: первый запрос
   * отвечает вторым, и без защиты его ответ ложится поверх свежего.
   */
  it('поздний ответ раннего запроса не побеждает', async () => {
    const first = deferred<DataSourceResult<Row>>()
    const second = deferred<DataSourceResult<Row>>()
    const calls = [first, second]
    let index = 0

    const fetcher = vi.fn(async (_request: DataSourceRequest): Promise<DataSourceResult<Row>> => calls[index++]!.promise)
    const { wrapper, source } = mountSource<Row>({ fetcher, debounce: 0 })
    await settle()

    source().setSearch('а')
    await settle()
    expect(fetcher).toHaveBeenCalledTimes(2)

    second.resolve({ rows: [ROWS[0]!], total: 1 })
    await settle()
    expect(source().total.value).toBe(1)

    // Ответ первого запроса приходит последним — и обязан быть выброшен.
    first.resolve({ rows: ROWS, total: 5 })
    await settle()
    expect(source().total.value).toBe(1)

    wrapper.unmount()
  })

  it('набор текста схлопывается в один запрос', async () => {
    const fetcher = vi.fn(async (_request: DataSourceRequest): Promise<DataSourceResult<Row>> => ({ rows: [], total: 0 }))
    const { wrapper, source } = mountSource<Row>({ fetcher, debounce: 300 })
    await settle()
    expect(fetcher).toHaveBeenCalledTimes(1)

    source().setSearch('и')
    source().setSearch('ив')
    source().setSearch('ива')
    await settle()
    expect(fetcher).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(300)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[1]![0]).toMatchObject({ search: 'ива' })

    wrapper.unmount()
  })

  it('клик по странице и по сортировке не откладывается', async () => {
    const fetcher = vi.fn(async (_request: DataSourceRequest): Promise<DataSourceResult<Row>> => ({ rows: [], total: 0 }))
    const { wrapper, source } = mountSource<Row>({ fetcher, debounce: 300 })
    await settle()

    source().setPage(2)
    await settle()
    expect(fetcher).toHaveBeenCalledTimes(2)

    source().setSort({ key: 'name', dir: 'asc' })
    await settle()
    expect(fetcher).toHaveBeenCalledTimes(3)

    wrapper.unmount()
  })

  it('правка, ничего не изменившая, запроса не шлёт', async () => {
    const fetcher = vi.fn(async (_request: DataSourceRequest): Promise<DataSourceResult<Row>> => ({ rows: [], total: 0 }))
    const { wrapper, source } = mountSource<Row>({ fetcher, debounce: 0 })
    await settle()

    source().setFilter('role', '')
    source().setPage(1)
    await settle()

    expect(fetcher).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('ошибка попадает в `error`, а прерывание — нет', async () => {
    const failure = new Error('500')
    const fetcher = vi.fn(async (_request: DataSourceRequest): Promise<DataSourceResult<Row>> => {
      throw failure
    })
    const { wrapper, source } = mountSource<Row>({ fetcher })
    await settle()

    expect(source().error.value).toBe(failure)
    expect(source().loading.value).toBe(false)

    wrapper.unmount()
  })

  it('`immediate: false` откладывает первый запрос до `reload`', async () => {
    const fetcher = vi.fn(async (_request: DataSourceRequest): Promise<DataSourceResult<Row>> => ({ rows: [], total: 0 }))
    const { wrapper, source } = mountSource<Row>({ fetcher, immediate: false })
    await settle()

    expect(fetcher).not.toHaveBeenCalled()
    await source().reload()
    expect(fetcher).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})

describe('useDataSource — связка с таблицей и пагинацией', () => {
  it('`table` отдаёт ровно то, что ждёт GrDataTable', async () => {
    const { wrapper, source } = mountSource<Row>({ rows: ROWS })
    await settle()

    const table = source().table.value

    expect(table).toMatchObject({ externalSort: true, loading: false, sortKey: '', sortDir: 'asc' })
    expect(typeof table['onUpdate:sortKey']).toBe('function')

    table['onUpdate:sortKey']('name')
    await settle()
    expect(source().state.value.sort).toEqual({ key: 'name', dir: 'asc' })

    source().table.value['onUpdate:sortDir']('desc')
    await settle()
    expect(source().state.value.sort).toEqual({ key: 'name', dir: 'desc' })

    wrapper.unmount()
  })

  it('`pagination` отдаёт ровно то, что ждёт GrPagination', async () => {
    const { wrapper, source } = mountSource<Row>({ rows: ROWS, defaults: { perPage: 2 } })
    await settle()

    expect(source().pagination.value).toMatchObject({ page: 1, pageSize: 2, total: 5 })

    source().pagination.value['onUpdate:page'](3)
    await settle()
    expect(source().state.value.page).toBe(3)

    source().pagination.value['onUpdate:pageSize'](50)
    await settle()
    // Размер страницы сменился — номер сбросился, иначе третьей страницы нет.
    expect(source().state.value).toMatchObject({ perPage: 50, page: 1 })

    wrapper.unmount()
  })

  it('снятая сортировка уходит в `null`, а не в пустой ключ', async () => {
    const { wrapper, source } = mountSource<Row>({ rows: ROWS })
    await settle()

    source().setSort({ key: 'name', dir: 'asc' })
    await settle()
    source().table.value['onUpdate:sortKey']('')
    await settle()

    expect(source().state.value.sort).toBeNull()
    wrapper.unmount()
  })
})

describe('useDataSource — без источника', () => {
  it('предупреждает и отдаёт пустой список', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { wrapper, source } = mountSource<Row>({})
    await settle()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('источник данных не задан'))
    expect(source().rows.value).toEqual([])

    warn.mockRestore()
    wrapper.unmount()
  })
})

describe('useDataSource — писуемые ссылки', () => {
  /**
   * Основной способ связки: `vue-tsc` не засчитывает `v-bind`-спред в
   * обязательные пропсы, поэтому таблица и пагинация подключаются `v-model`.
   */
  it('`page`, `perPage`, `sortKey`, `sortDir` и `search` пишутся и читаются', async () => {
    const { wrapper, source } = mountSource<Row>({ rows: ROWS, defaults: { perPage: 2 } })
    await settle()

    source().page.value = 2
    expect(source().state.value.page).toBe(2)

    source().sortKey.value = 'age'
    expect(source().state.value.sort).toEqual({ key: 'age', dir: 'asc' })

    source().sortDir.value = 'desc'
    expect(source().state.value.sort).toEqual({ key: 'age', dir: 'desc' })

    source().sortKey.value = ''
    expect(source().state.value.sort).toBeNull()

    source().perPage.value = 50
    expect(source().state.value).toMatchObject({ perPage: 50, page: 1 })

    source().search.value = 'Анна'
    expect(source().state.value.search).toBe('Анна')

    wrapper.unmount()
  })

  it('ссылки и объекты для `v-bind` показывают одно и то же', async () => {
    const { wrapper, source } = mountSource<Row>({ rows: ROWS, defaults: { perPage: 2 } })
    await settle()

    source().page.value = 3
    source().sortKey.value = 'name'
    await settle()

    expect(source().pagination.value).toMatchObject({ page: 3, pageSize: 2 })
    expect(source().table.value).toMatchObject({ sortKey: 'name', sortDir: 'asc', externalSort: true })

    wrapper.unmount()
  })
})
