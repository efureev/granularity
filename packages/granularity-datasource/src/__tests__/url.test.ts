import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { DataSourceUrlAdapter } from '../url'
import { historyUrlAdapter } from '../url'
import { useDataSource } from '../useDataSource'

interface Row { id: number, name: string }

const ROWS: Row[] = [
  { id: 1, name: 'Анна' },
  { id: 2, name: 'Борис' },
  { id: 3, name: 'Вера' },
]

/** Двойник адреса: те же три метода, но без настоящей истории браузера. */
function fakeAdapter(initial = '') {
  let search = initial
  const listeners = new Set<() => void>()

  const adapter: DataSourceUrlAdapter = {
    read: () => search,
    write: (next) => { search = next },
    subscribe: (listener) => {
      listeners.add(listener)

      return () => listeners.delete(listener)
    },
  }

  return {
    adapter,
    get search() { return search },
    /** Внешняя смена адреса: «назад», «вперёд», чужая навигация. */
    navigate(next: string) {
      search = next
      listeners.forEach(listener => listener())
    },
  }
}

function mountSource(options: Parameters<typeof useDataSource<Row>>[0]) {
  const captured = { value: null as ReturnType<typeof useDataSource<Row>> | null }

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

describe('синхронизация с адресом', () => {
  /** Умолчание — состояние в памяти: без спроса в чужую навигацию не лезем. */
  it('без опции `url` адрес не трогается вовсе', async () => {
    window.history.replaceState(null, '', '/list')
    const { wrapper, source } = mountSource({ rows: ROWS })
    await settle()

    source().setPage(2)
    await settle()

    expect(window.location.search).toBe('')
    wrapper.unmount()
    window.history.replaceState(null, '', '/')
  })

  it('состояние уходит в адрес', async () => {
    const url = fakeAdapter()
    const { wrapper, source } = mountSource({ rows: ROWS, url: { adapter: url.adapter } })
    await settle()

    source().setSort({ key: 'name', dir: 'desc' })
    await settle()

    expect(url.search).toBe('?sort=-name')
    wrapper.unmount()
  })

  it('адрес читается на монтировании и задаёт начальное состояние', async () => {
    const url = fakeAdapter('?page=3&perPage=1')
    const { wrapper, source } = mountSource({ rows: ROWS, url: { adapter: url.adapter } })
    await settle()

    expect(source().state.value).toMatchObject({ page: 3, perPage: 1 })
    expect(source().rows.value.map(row => row.id)).toEqual([3])

    wrapper.unmount()
  })

  it('внешняя смена адреса («назад») возвращает состояние', async () => {
    const url = fakeAdapter('?page=3&perPage=1')
    const { wrapper, source } = mountSource({ rows: ROWS, url: { adapter: url.adapter } })
    await settle()

    url.navigate('?page=1&perPage=1')
    await settle()

    expect(source().state.value.page).toBe(1)
    wrapper.unmount()
  })

  it('префикс разводит два списка на одной странице', async () => {
    const url = fakeAdapter()
    const users = mountSource({ rows: ROWS, url: { adapter: url.adapter, prefix: 'users' } })
    await settle()
    users.source().setPage(2)
    await settle()

    const orders = mountSource({ rows: ROWS, url: { adapter: url.adapter, prefix: 'orders' } })
    await settle()
    orders.source().setPage(3)
    await settle()

    expect(url.search).toContain('users.page=2')
    expect(url.search).toContain('orders.page=3')

    users.wrapper.unmount()
    orders.wrapper.unmount()
  })

  it('отписка снимается вместе с компонентом', async () => {
    const url = fakeAdapter()
    const unsubscribe = vi.fn()
    const adapter: DataSourceUrlAdapter = { ...url.adapter, subscribe: () => unsubscribe }

    const { wrapper } = mountSource({ rows: ROWS, url: { adapter } })
    await settle()
    wrapper.unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })
})

describe('historyUrlAdapter', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('читает и пишет строку запроса, не плодя историю', () => {
    const adapter = historyUrlAdapter()
    const before = window.history.length

    adapter.write('?page=2', { replace: true })

    expect(adapter.read()).toBe('?page=2')
    expect(window.history.length).toBe(before)
  })

  it('путь и хеш переживают запись', () => {
    window.history.replaceState(null, '', '/users#list')
    const adapter = historyUrlAdapter()

    adapter.write('?page=2', { replace: true })

    expect(window.location.pathname).toBe('/users')
    expect(window.location.hash).toBe('#list')
  })

  it('подписка на «назад» снимается', () => {
    const adapter = historyUrlAdapter()
    const listener = vi.fn()
    const stop = adapter.subscribe(listener)

    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(listener).toHaveBeenCalledTimes(1)

    stop()
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
