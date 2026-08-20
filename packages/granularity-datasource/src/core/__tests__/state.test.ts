import { describe, expect, it } from 'vitest'

import { applyPatch, createState, isEmptyFilter, sameFilters, sameState } from '../state'

const base = createState({ perPage: 20, filters: { role: 'admin' } })

describe('состояние списка', () => {
  it('умолчания нормализуются: страница не меньше первой, размер не меньше единицы', () => {
    expect(createState({ page: 0, perPage: 0 })).toMatchObject({ page: 1, perPage: 1 })
    expect(createState({ page: 2.7 })).toMatchObject({ page: 2 })
  })

  /**
   * Отфильтровал список, стоя на пятой странице, — и попал на пустую: нашлось
   * на две. Выглядит это как «ничего не нашлось», хотя нашлось.
   */
  it('смена фильтра, поиска и размера страницы возвращает на первую', () => {
    const fifth = applyPatch(base, { page: 5 })

    expect(applyPatch(fifth, { filters: { role: 'owner' } }).page).toBe(1)
    expect(applyPatch(fifth, { search: 'иванов' }).page).toBe(1)
    expect(applyPatch(fifth, { perPage: 50 }).page).toBe(1)
  })

  it('смена сортировки страницу не сбрасывает: набор тот же, порядок другой', () => {
    const fifth = applyPatch(base, { page: 5 })

    expect(applyPatch(fifth, { sort: { key: 'name', dir: 'asc' } }).page).toBe(5)
  })

  it('правка, ничего не изменившая, страницу не трогает', () => {
    const fifth = applyPatch(base, { page: 5 })

    expect(applyPatch(fifth, { filters: { role: 'admin' } }).page).toBe(5)
  })

  it('явная страница в той же правке сильнее сброса', () => {
    expect(applyPatch(base, { search: 'иванов', page: 3 }).page).toBe(3)
  })

  it('исходное состояние не меняется', () => {
    applyPatch(base, { page: 9, filters: { role: 'owner' } })

    expect(base).toMatchObject({ page: 1, filters: { role: 'admin' } })
  })
})

describe('сравнение состояний', () => {
  it('одинаковое по значению — одинаково', () => {
    expect(sameState(base, createState({ perPage: 20, filters: { role: 'admin' } }))).toBe(true)
    expect(sameState(base, applyPatch(base, { page: 2 }))).toBe(false)
  })

  /** Снятый фильтр приходит четырьмя видами, и все они значат одно. */
  it('пустые фильтры равны между собой, каким бы видом ни пришли', () => {
    expect(sameFilters({ role: '' }, { role: null })).toBe(true)
    expect(sameFilters({ role: [] }, {})).toBe(true)
    expect(sameFilters({ role: 'admin' }, { role: null })).toBe(false)
  })

  it('списки сравниваются по элементам и порядку', () => {
    expect(sameFilters({ tags: ['a', 'b'] }, { tags: ['a', 'b'] })).toBe(true)
    expect(sameFilters({ tags: ['a', 'b'] }, { tags: ['b', 'a'] })).toBe(false)
  })

  it('пустым считается только пустое', () => {
    expect([undefined, null, '', []].every(isEmptyFilter)).toBe(true)
    expect([0, false, 'x', ['x']].some(isEmptyFilter)).toBe(false)
  })
})
