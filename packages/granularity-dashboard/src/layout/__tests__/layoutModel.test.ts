import { describe, expect, it } from 'vitest'

import type { GrDashboardLayout } from '../layoutModel'
import { clampItem, maxWidthOf, normalizeLayout, rowsOf, sortLayout } from '../layoutModel'

describe('clampItem', () => {
  it('приводит дробные координаты к целым ячейкам', () => {
    const item = clampItem({ id: 'a', x: 1.4, y: 2.6, w: 2.5, h: 1.2 }, 12)

    expect(item).toMatchObject({ x: 1, y: 3, w: 3, h: 1 })
  })

  it('не даёт виджету свисать за правый край', () => {
    const item = clampItem({ id: 'a', x: 11, y: 0, w: 4, h: 1 }, 12)

    expect(item.x + item.w).toBeLessThanOrEqual(12)
  })

  it('уважает minW, пока тот помещается в сетку', () => {
    const item = clampItem({ id: 'a', x: 0, y: 0, w: 1, h: 1, minW: 4 }, 12)

    expect(item.w).toBe(4)
  })

  it('сетка сильнее minW: виджет занимает её целиком, а не вылезает за край', () => {
    // Иначе CSS Grid послушно заводит лишнюю колонку нулевой ширины, и вся
    // раскладка съезжает — без единой ошибки в консоли.
    const item = clampItem({ id: 'a', x: 0, y: 0, w: 1, h: 1, minW: 4 }, 2)

    expect(item.w).toBe(2)
    expect(item.x + item.w).toBeLessThanOrEqual(2)
  })

  it('разрешает противоречие maxW < minW в пользу minW', () => {
    expect(maxWidthOf({ id: 'a', x: 0, y: 0, w: 1, h: 1, minW: 4, maxW: 2 }, 12)).toBe(4)
  })

  it('возвращает ту же ссылку, когда менять нечего', () => {
    const item = { id: 'a', x: 1, y: 1, w: 2, h: 2 }

    expect(clampItem(item, 12)).toBe(item)
  })
})

describe('sortLayout', () => {
  it('раскладывает сверху вниз, слева направо', () => {
    const layout: GrDashboardLayout = [
      { id: 'c', x: 0, y: 2, w: 1, h: 1 },
      { id: 'b', x: 4, y: 0, w: 1, h: 1 },
      { id: 'a', x: 0, y: 0, w: 1, h: 1 },
    ]

    expect(sortLayout(layout).map(item => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('не мутирует вход', () => {
    const layout: GrDashboardLayout = [
      { id: 'b', x: 0, y: 1, w: 1, h: 1 },
      { id: 'a', x: 0, y: 0, w: 1, h: 1 },
    ]
    sortLayout(layout)

    expect(layout[0]?.id).toBe('b')
  })
})

describe('normalizeLayout и rowsOf', () => {
  it('приводит всю раскладку к инвариантам разом', () => {
    const layout = normalizeLayout([
      { id: 'a', x: -3, y: -1, w: 0, h: 0 },
      { id: 'b', x: 20, y: 1, w: 30, h: 2 },
    ], 6)

    expect(layout).toEqual([
      { id: 'a', x: 0, y: 0, w: 1, h: 1 },
      { id: 'b', x: 0, y: 1, w: 6, h: 2 },
    ])
  })

  it('считает высоту раскладки по нижнему краю', () => {
    expect(rowsOf([
      { id: 'a', x: 0, y: 0, w: 1, h: 2 },
      { id: 'b', x: 1, y: 3, w: 1, h: 1 },
    ])).toBe(4)
  })
})
