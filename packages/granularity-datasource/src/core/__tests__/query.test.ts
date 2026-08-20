import { describe, expect, it } from 'vitest'

import { queryKeys, readStateFromQuery, writeStateToQuery } from '../query'
import { applyPatch, createState } from '../state'

const defaults = createState({ perPage: 20 })
const options = { defaults }

function write(patch: Parameters<typeof applyPatch>[1], search = ''): string {
  return writeStateToQuery(search, applyPatch(defaults, patch), options)
}

describe('запись состояния в адрес', () => {
  /** Ссылка на список по умолчанию обязана выглядеть как адрес страницы. */
  it('умолчания не пишутся вовсе', () => {
    expect(writeStateToQuery('', defaults, options)).toBe('')
  })

  it('страница, размер, поиск и сортировка — читаемыми параметрами', () => {
    expect(write({ page: 3 })).toBe('?page=3')
    expect(write({ perPage: 50 })).toBe('?perPage=50')
    expect(write({ search: 'иванов' })).toContain('q=')
    expect(write({ sort: { key: 'created', dir: 'desc' } })).toBe('?sort=-created')
    expect(write({ sort: { key: 'name', dir: 'asc' } })).toBe('?sort=name')
  })

  it('список уходит повторяющимся параметром, а не через запятую', () => {
    expect(write({ filters: { role: ['admin', 'owner'] } })).toBe('?f.role=admin&f.role=owner')
  })

  /** Запятая внутри значения превратила бы один фильтр в два. */
  it('значение с запятой переживает круг', () => {
    const state = applyPatch(defaults, { filters: { company: 'Рога, копыта и Ко' } })
    const back = readStateFromQuery(writeStateToQuery('', state, options), options)

    expect(back.filters.company).toBe('Рога, копыта и Ко')
  })

  it('чужие параметры не трогаются', () => {
    expect(write({ page: 2 }, '?tab=archive')).toBe('?tab=archive&page=2')
  })

  it('префикс разводит два списка на одной странице', () => {
    const users = writeStateToQuery('', applyPatch(defaults, { page: 2 }), { defaults, prefix: 'users' })
    const both = writeStateToQuery(users, applyPatch(defaults, { page: 7 }), { defaults, prefix: 'orders' })

    expect(both).toBe('?users.page=2&orders.page=7')
    expect(queryKeys('users').filter).toBe('users.f.')
  })

  it('возврат к умолчанию убирает параметр из адреса', () => {
    expect(writeStateToQuery('?page=3', defaults, options)).toBe('')
  })
})

describe('чтение состояния из адреса', () => {
  it('круг сходится', () => {
    const state = applyPatch(defaults, {
      page: 4,
      perPage: 50,
      sort: { key: 'created', dir: 'desc' },
      search: 'иванов',
      filters: { role: ['admin'], active: true },
    })
    const typed = { defaults: { ...defaults, filters: { active: false, role: [] as string[] } } }
    const query = writeStateToQuery('', state, typed)
    const back = readStateFromQuery(query, typed)

    expect(back).toMatchObject({ page: 4, perPage: 50, search: 'иванов' })
    expect(back.sort).toEqual({ key: 'created', dir: 'desc' })
    expect(back.filters).toMatchObject({ role: ['admin'], active: true })
  })

  /** Адрес приходит из закладки, из чужого письма и из руки пользователя. */
  it('битое значение не роняет разбор, а откатывается к умолчанию', () => {
    expect(readStateFromQuery('?page=абв', options).page).toBe(1)
    expect(readStateFromQuery('?page=0', options).page).toBe(1)
    expect(readStateFromQuery('?page=2.5', options).page).toBe(1)
    expect(readStateFromQuery('?perPage=-3', options).perPage).toBe(20)
  })

  it('пустая сортировка в адресе значит снятую, а не умолчание', () => {
    const withDefault = { defaults: applyPatch(defaults, { sort: { key: 'name', dir: 'asc' } }) }

    expect(readStateFromQuery('?sort=', withDefault).sort).toBeNull()
    expect(readStateFromQuery('', withDefault).sort).toEqual({ key: 'name', dir: 'asc' })
  })

  it('тип фильтра восстанавливается по умолчанию с тем же именем', () => {
    const typed = { defaults: applyPatch(defaults, { filters: { age: 0, active: false, tags: [] as string[] } }) }
    const state = readStateFromQuery('?f.age=42&f.active=true&f.tags=a&f.tags=b', typed)

    expect(state.filters).toMatchObject({ age: 42, active: true, tags: ['a', 'b'] })
  })

  it('без умолчания значение остаётся строкой: артикул `0012` — не число', () => {
    expect(readStateFromQuery('?f.sku=0012', options).filters.sku).toBe('0012')
  })

  /**
   * Список из одного элемента в адресе неотличим от скаляра: `?f.role=admin` —
   * это и `'admin'`, и `['admin']`. Форму задаёт умолчание, и списочный фильтр
   * обязан быть в нём объявлен пустым списком — иначе круг вернёт строку.
   */
  it('списочный фильтр без умолчания возвращается строкой', () => {
    expect(readStateFromQuery('?f.role=admin', options).filters.role).toBe('admin')

    const typed = { defaults: applyPatch(defaults, { filters: { role: [] as string[] } }) }
    expect(readStateFromQuery('?f.role=admin', typed).filters.role).toEqual(['admin'])
  })

  it('снятый фильтр читается пустым, а не нулём', () => {
    const typed = { defaults: applyPatch(defaults, { filters: { age: 30 } }) }

    expect(readStateFromQuery('?f.age=', typed).filters.age).toBeNull()
  })

  it('неизвестные параметры разбор не смущают', () => {
    expect(readStateFromQuery('?tab=archive&utm_source=mail', options)).toMatchObject({ page: 1, perPage: 20 })
  })
})
