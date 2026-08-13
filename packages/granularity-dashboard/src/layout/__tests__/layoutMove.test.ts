import { describe, expect, it } from 'vitest'

import type { GrDashboardLayout } from '../layoutModel'
import { addItem, moveItem, removeItem, resizeItem } from '../layoutMove'

const options = { cols: 12 } as const

function base(): GrDashboardLayout {
  return [
    { id: 'a', x: 0, y: 0, w: 4, h: 2 },
    { id: 'b', x: 4, y: 0, w: 4, h: 2 },
    { id: 'c', x: 0, y: 2, w: 8, h: 2 },
  ]
}

describe('moveItem', () => {
  it('не мутирует вход', () => {
    const layout = base()
    moveItem(layout, 'a', { x: 8, y: 0 }, options)

    expect(layout[0]).toEqual({ id: 'a', x: 0, y: 0, w: 4, h: 2 })
  })

  it('ставит виджет в ячейку и подтягивает раскладку', () => {
    const result = moveItem(base(), 'a', { x: 8, y: 0 }, options)

    expect(result.find(item => item.id === 'a')).toMatchObject({ x: 8, y: 0 })
    expect(result.find(item => item.id === 'c')?.y).toBe(2)
  })

  it('не выпускает виджет за правый край', () => {
    const result = moveItem(base(), 'a', { x: 11, y: 0 }, options)

    expect(result.find(item => item.id === 'a')?.x).toBe(8)
  })

  it('статику не двигает', () => {
    const layout: GrDashboardLayout = [{ id: 'pinned', x: 0, y: 0, w: 2, h: 1, static: true }]

    expect(moveItem(layout, 'pinned', { x: 4, y: 4 }, options)).toEqual(layout)
  })

  it('при preventCollision оставляет раскладку прежней', () => {
    const layout = base()
    const result = moveItem(layout, 'a', { x: 4, y: 0 }, { ...options, preventCollision: true })

    expect(result).toEqual(layout)
  })

  it('в режиме none не подтягивает соседей вверх', () => {
    const layout: GrDashboardLayout = [
      { id: 'a', x: 0, y: 0, w: 2, h: 1 },
      { id: 'b', x: 0, y: 5, w: 2, h: 1 },
    ]
    const result = moveItem(layout, 'a', { x: 4, y: 0 }, { ...options, compact: 'none' })

    expect(result.find(item => item.id === 'b')?.y).toBe(5)
  })
})

describe('resizeItem', () => {
  it('растит виджет вправо и вниз, не двигая левый верхний угол', () => {
    const result = resizeItem(base(), 'a', { w: 6, h: 3 }, options)

    expect(result.find(item => item.id === 'a')).toMatchObject({ x: 0, y: 0, w: 6, h: 3 })
  })

  it('не даёт вылезти за правый край', () => {
    const result = resizeItem(base(), 'b', { w: 12, h: 2 }, options)

    expect(result.find(item => item.id === 'b')?.w).toBe(8)
  })

  it('уважает minH', () => {
    const layout: GrDashboardLayout = [{ id: 'a', x: 0, y: 0, w: 2, h: 3, minH: 2 }]
    const result = resizeItem(layout, 'a', { w: 2, h: 1 }, options)

    expect(result.find(item => item.id === 'a')?.h).toBe(2)
  })

  it('толкает соседа вниз при росте', () => {
    const result = resizeItem(base(), 'a', { w: 4, h: 4 }, options)

    expect(result.find(item => item.id === 'c')?.y).toBe(4)
  })
})

describe('addItem и removeItem', () => {
  it('без указанной ячейки кладёт новый виджет под низ сетки', () => {
    const result = addItem(base(), { id: 'd', x: 0, y: 0, w: 3, h: 2 }, options)

    expect(result.find(item => item.id === 'd')).toMatchObject({ x: 0, y: 4 })
  })

  it('кладёт в указанную ячейку, разводя соседей', () => {
    const result = addItem(base(), { id: 'd', x: 0, y: 0, w: 3, h: 1 }, options, { x: 0, y: 0 })

    expect(result.find(item => item.id === 'd')).toMatchObject({ x: 0, y: 0 })
    expect(result.find(item => item.id === 'a')?.y).toBe(1)
  })

  it('после удаления раскладка подтягивается вверх', () => {
    const result = removeItem(base(), 'a', options)

    expect(result.map(item => item.id)).toEqual(['b', 'c'])
    expect(result.find(item => item.id === 'c')?.y).toBe(2)
  })
})
