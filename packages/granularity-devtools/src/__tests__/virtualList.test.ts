import { describe, expect, it } from 'vitest'

import type { GrVirtualListSnapshot } from '../internal/devChannel'
import { virtualListFor, virtualListState } from '../resolve/virtualList'

function list(patch: Partial<GrVirtualListSnapshot> = {}): GrVirtualListSnapshot {
  return {
    owner: 'GrDataTable',
    uid: 1,
    total: 1000,
    rendered: 12,
    range: { start: 40, end: 52 },
    estimated: 44,
    measured: 45,
    ...patch,
  }
}

function value(entries: { key: string, value: unknown }[], key: string): unknown {
  return entries.find(entry => entry.key === key)?.value
}

describe('поиск списка компонента', () => {
  it('находит свой по uid инстанса', () => {
    const lists = [list({ uid: 1 }), list({ uid: 2, owner: 'GrTree' })]

    expect(virtualListFor(lists, 2)?.owner).toBe('GrTree')
  })

  it('компонент без виртуализатора секции не получает', () => {
    expect(virtualListFor([list()], 99)).toBeNull()
    expect(virtualListFor([list()], undefined)).toBeNull()
  })
})

describe('состояние виртуализатора', () => {
  it('показывает окно и долю отрисованного', () => {
    const state = virtualListState(list())

    expect(value(state, 'rendered')).toBe('12 of 1000')
    expect(value(state, 'window')).toBe('[40, 52)')
  })

  it('пока ничего не измерено, так и говорит', () => {
    const state = virtualListState(list({ measured: null }))

    expect(value(state, 'measured item size')).toContain('nothing measured yet')
    expect(value(state, 'estimate drift')).toBe('within tolerance')
  })

  it('небольшая разница оценки и замера тревоги не вызывает', () => {
    expect(value(virtualListState(list({ estimated: 44, measured: 47 })), 'estimate drift')).toBe('within tolerance')
  })

  it('заметное расхождение помечено: так выглядит прыгающий список', () => {
    const state = virtualListState(list({ estimated: 44, measured: 96 }))

    expect(value(state, 'estimate drift')).toContain('check scrolling')
  })

  it('замер округляется до десятых: пиксельная точность тут шум', () => {
    expect(value(virtualListState(list({ measured: 47.5312 })), 'measured item size')).toBe('47.5 px')
  })
})
