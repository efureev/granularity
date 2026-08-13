import { describe, expect, it } from 'vitest'

import type { GrDashboardLayout } from '../layoutModel'
import { collides, compact, resolveCollisions } from '../layoutCollision'

/** Пересечений нет ни у одной пары — инвариант, ради которого всё это и есть. */
function hasOverlap(layout: GrDashboardLayout): boolean {
  return layout.some((item, index) => layout.slice(index + 1).some(other => collides(item, other)))
}

describe('collides', () => {
  it('соприкосновение краями пересечением не считает', () => {
    expect(collides(
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 2, y: 0, w: 2, h: 2 },
    )).toBe(false)

    expect(collides(
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 2, w: 2, h: 2 },
    )).toBe(false)
  })

  it('сам с собой не пересекается', () => {
    const item = { id: 'a', x: 0, y: 0, w: 2, h: 2 }

    expect(collides(item, { ...item })).toBe(false)
  })

  it('находит частичное наложение', () => {
    expect(collides(
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 1, y: 1, w: 2, h: 2 },
    )).toBe(true)
  })
})

describe('compact', () => {
  it('подтягивает виджеты вверх, не оставляя дыр', () => {
    const result = compact([
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 5, w: 2, h: 1 },
      { id: 'c', x: 2, y: 9, w: 2, h: 1 },
    ], 'vertical')

    expect(result).toEqual([
      { id: 'a', x: 0, y: 0, w: 2, h: 2 },
      { id: 'c', x: 2, y: 0, w: 2, h: 1 },
      { id: 'b', x: 0, y: 2, w: 2, h: 1 },
    ])
  })

  it('идемпотентна', () => {
    const layout: GrDashboardLayout = [
      { id: 'a', x: 0, y: 4, w: 2, h: 2 },
      { id: 'b', x: 1, y: 5, w: 2, h: 1 },
      { id: 'c', x: 0, y: 0, w: 4, h: 1 },
    ]
    const once = compact(layout, 'vertical')

    expect(compact(once, 'vertical')).toEqual(once)
  })

  it('разводит пересечения на любом входе', () => {
    const result = compact([
      { id: 'a', x: 0, y: 0, w: 3, h: 2 },
      { id: 'b', x: 1, y: 1, w: 3, h: 2 },
      { id: 'c', x: 2, y: 0, w: 3, h: 2 },
    ], 'vertical')

    expect(hasOverlap(result)).toBe(false)
  })

  it('не двигает статику: под ней виджет останавливается, рядом — доходит до верха', () => {
    const result = compact([
      { id: 'pinned', x: 0, y: 3, w: 2, h: 1, static: true },
      { id: 'under', x: 0, y: 6, w: 2, h: 1 },
      { id: 'beside', x: 2, y: 6, w: 2, h: 1 },
    ], 'vertical')

    expect(result).toContainEqual({ id: 'pinned', x: 0, y: 3, w: 2, h: 1, static: true })
    expect(result.find(item => item.id === 'under')?.y).toBe(4)
    expect(result.find(item => item.id === 'beside')?.y).toBe(0)
  })

  it('режим none оставляет координаты как есть', () => {
    const layout: GrDashboardLayout = [{ id: 'a', x: 0, y: 7, w: 2, h: 1 }]

    expect(compact(layout, 'none')).toEqual(layout)
  })
})

describe('resolveCollisions', () => {
  it('толкает столкнувшегося вниз', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'other', x: 0, y: 1, w: 2, h: 2 },
    ], 'moved')

    expect(result?.find(item => item.id === 'other')?.y).toBe(2)
    expect(hasOverlap(result ?? [])).toBe(false)
  })

  it('распространяет толчок по цепочке', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 1, w: 2, h: 1 },
      { id: 'c', x: 0, y: 2, w: 2, h: 1 },
    ], 'moved')

    expect(hasOverlap(result ?? [])).toBe(false)
    expect(result?.find(item => item.id === 'c')?.y).toBe(3)
  })

  it('отказывает, когда перемещение упирается в статику', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'pinned', x: 0, y: 1, w: 2, h: 2, static: true },
    ], 'moved')

    expect(result).toBeNull()
  })

  it('отказывает при preventCollision', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'other', x: 0, y: 1, w: 2, h: 2 },
    ], 'moved', { preventCollision: true })

    expect(result).toBeNull()
  })

  it('отказывает, когда толчок по цепочке упирается в статику', () => {
    const result = resolveCollisions([
      { id: 'moved', x: 0, y: 0, w: 2, h: 2 },
      { id: 'b', x: 0, y: 1, w: 2, h: 1 },
      { id: 'pinned', x: 0, y: 2, w: 2, h: 1, static: true },
    ], 'moved')

    expect(result).toBeNull()
  })

  it('без пересечений возвращает ту же раскладку', () => {
    const layout: GrDashboardLayout = [
      { id: 'moved', x: 0, y: 0, w: 2, h: 1 },
      { id: 'other', x: 2, y: 0, w: 2, h: 1 },
    ]

    expect(resolveCollisions(layout, 'moved')).toEqual(layout)
  })
})
