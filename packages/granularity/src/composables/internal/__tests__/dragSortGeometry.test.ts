import { describe, expect, it } from 'vitest'

import type { DragSortSpan } from '../dragSortGeometry'
import { autoScrollDelta, hitTest, insertionIndex, moveItem } from '../dragSortGeometry'

/** Три строки по 20px подряд, как в обычном списке. */
const rows: DragSortSpan[] = [
  { start: 0, end: 20 },
  { start: 20, end: 40 },
  { start: 40, end: 60 },
]

describe('hitTest', () => {
  it('пустой набор целей не даёт', () => {
    expect(hitTest([], 10)).toBeNull()
  })

  it('находит строку под указателем и долю внутри неё', () => {
    expect(hitTest(rows, 5)).toEqual({ index: 0, fraction: 0.25 })
    expect(hitTest(rows, 30)).toEqual({ index: 1, fraction: 0.5 })
    expect(hitTest(rows, 55)).toEqual({ index: 2, fraction: 0.75 })
  })

  it('за краями набора отдаёт крайнюю строку, а не промах', () => {
    expect(hitTest(rows, -100)).toEqual({ index: 0, fraction: 0 })
    expect(hitTest(rows, 500)).toEqual({ index: 2, fraction: 1 })
  })

  it('в зазоре между строками берёт ближайшую', () => {
    const gapped: DragSortSpan[] = [
      { start: 0, end: 20 },
      { start: 40, end: 60 },
    ]

    expect(hitTest(gapped, 25)?.index).toBe(0)
    expect(hitTest(gapped, 35)?.index).toBe(1)
  })

  it('строка нулевой высоты не даёт `NaN`', () => {
    const collapsed: DragSortSpan[] = [{ start: 10, end: 10 }]

    expect(hitTest(collapsed, 10)).toEqual({ index: 0, fraction: 0 })
  })

  it('порядок отрезков не обязан совпадать с порядком координат', () => {
    const reversed: DragSortSpan[] = [
      { start: 40, end: 60 },
      { start: 0, end: 20 },
    ]

    expect(hitTest(reversed, 5)?.index).toBe(1)
  })
})

describe('insertionIndex', () => {
  it('верхняя половина — до строки, нижняя — после', () => {
    expect(insertionIndex({ index: 2, fraction: 0.2 }, 0, 3)).toBe(1)
    expect(insertionIndex({ index: 2, fraction: 0.8 }, 0, 3)).toBe(2)
  })

  it('перенос вниз на одну позицию сдвигает элемент, а не оставляет на месте', () => {
    // Без поправки на вынутый элемент здесь получилось бы 1 — то есть ничего.
    expect(insertionIndex({ index: 1, fraction: 0.9 }, 0, 3)).toBe(1)
    expect(insertionIndex({ index: 2, fraction: 0.9 }, 0, 3)).toBe(2)
  })

  it('перенос вверх поправки не требует', () => {
    expect(insertionIndex({ index: 0, fraction: 0.1 }, 2, 3)).toBe(0)
    expect(insertionIndex({ index: 0, fraction: 0.9 }, 2, 3)).toBe(1)
  })

  it('не выходит за границы набора', () => {
    expect(insertionIndex({ index: 2, fraction: 1 }, 2, 3)).toBe(2)
    expect(insertionIndex({ index: 0, fraction: 0 }, 0, 3)).toBe(0)
    expect(insertionIndex({ index: 0, fraction: 0 }, 0, 0)).toBe(0)
  })
})

describe('autoScrollDelta', () => {
  const viewport: DragSortSpan = { start: 100, end: 300 }

  it('в середине не прокручивает', () => {
    expect(autoScrollDelta(viewport, 200)).toBe(0)
  })

  it('у краёв тянет в свою сторону, и тем сильнее, чем ближе край', () => {
    const nearStart = autoScrollDelta(viewport, 110)
    const atStart = autoScrollDelta(viewport, 100)

    expect(nearStart).toBeLessThan(0)
    expect(atStart).toBeLessThanOrEqual(nearStart)

    const nearEnd = autoScrollDelta(viewport, 290)
    const atEnd = autoScrollDelta(viewport, 300)

    expect(nearEnd).toBeGreaterThan(0)
    expect(atEnd).toBeGreaterThanOrEqual(nearEnd)
  })

  it('за пределами вьюпорта молчит: там уже не автопрокрутка, а уход мимо списка', () => {
    expect(autoScrollDelta(viewport, 50)).toBe(0)
    expect(autoScrollDelta(viewport, 400)).toBe(0)
  })

  it('короткий вьюпорт не прокручивается вовсе: зоны наложились бы', () => {
    expect(autoScrollDelta({ start: 0, end: 40 }, 5)).toBe(0)
  })

  it('нулевая скорость или зона выключают автопрокрутку', () => {
    expect(autoScrollDelta(viewport, 105, { speed: 0 })).toBe(0)
    expect(autoScrollDelta(viewport, 105, { zone: 0 })).toBe(0)
  })
})

describe('moveItem', () => {
  it('переставляет, не трогая исходный массив', () => {
    const source = ['a', 'b', 'c']
    const next = moveItem(source, 0, 2)

    expect(next).toEqual(['b', 'c', 'a'])
    expect(source).toEqual(['a', 'b', 'c'])
  })

  it('перенос на своё же место отдаёт копию без изменений', () => {
    expect(moveItem(['a', 'b'], 1, 1)).toEqual(['a', 'b'])
  })

  it('индекс вне набора ничего не ломает', () => {
    expect(moveItem(['a', 'b'], 5, 0)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], 0, 99)).toEqual(['b', 'a'])
  })
})
