import { describe, expect, it } from 'vitest'

import { cellFromDelta, cellFromPoint, metricsOf, rectOfItem, spanFromDelta } from '../layoutGeometry'

// 1000px, 10 колонок, зазор 10 → колонка 91px, шаг 101px.
const metrics = metricsOf(1000, 10, 60, 10)
const item = { id: 'a', x: 2, y: 1, w: 3, h: 2 }

describe('metricsOf', () => {
  it('раздаёт ширину контейнера между колонками и зазорами', () => {
    expect(metrics.colWidth * 10 + metrics.gap * 9).toBeCloseTo(1000)
  })

  it('не уходит в отрицательную ширину на узком контейнере', () => {
    expect(metricsOf(20, 12, 60, 10).colWidth).toBe(0)
  })
})

describe('rectOfItem', () => {
  it('считает прямоугольник с учётом внутренних зазоров', () => {
    const rect = rectOfItem(item, metrics)

    expect(rect.left).toBeCloseTo(2 * (metrics.colWidth + 10))
    expect(rect.width).toBeCloseTo(3 * metrics.colWidth + 2 * 10)
    expect(rect.top).toBeCloseTo(70)
    expect(rect.height).toBeCloseTo(130)
  })

  it('одна ячейка не получает лишнего зазора', () => {
    const rect = rectOfItem({ id: 'a', x: 0, y: 0, w: 1, h: 1 }, metrics)

    expect(rect.width).toBeCloseTo(metrics.colWidth)
    expect(rect.height).toBe(60)
  })
})

describe('cellFromDelta', () => {
  it('нулевое смещение оставляет виджет в своей ячейке', () => {
    expect(cellFromDelta(item, metrics, 0, 0)).toEqual({ x: 2, y: 1 })
  })

  it('переезд происходит на середине ячейки', () => {
    const step = metrics.colWidth + metrics.gap

    expect(cellFromDelta(item, metrics, step * 0.49, 0).x).toBe(2)
    expect(cellFromDelta(item, metrics, step * 0.51, 0).x).toBe(3)
  })

  it('считает и вертикаль', () => {
    expect(cellFromDelta(item, metrics, 0, 70).y).toBe(2)
  })
})

describe('spanFromDelta', () => {
  it('нулевое растягивание сохраняет размер', () => {
    expect(spanFromDelta(item, metrics, 0, 0)).toEqual({ w: 3, h: 2 })
  })

  it('прибавляет ячейку на полном шаге', () => {
    expect(spanFromDelta(item, metrics, metrics.colWidth + metrics.gap, 0).w).toBe(4)
    expect(spanFromDelta(item, metrics, 0, 70).h).toBe(3)
  })

  it('не даёт схлопнуться меньше ячейки', () => {
    expect(spanFromDelta(item, metrics, -10_000, -10_000)).toEqual({ w: 1, h: 1 })
  })
})

describe('cellFromPoint', () => {
  // colWidth = (1200 - 12 * 11) / 12 = 89 ⇒ colStep = 101, rowStep = 76.
  const metrics = metricsOf(1200, 12, 64, 12)

  it('точка в центре виджета 1×1 даёт его же ячейку', () => {
    expect(cellFromPoint(metrics, 44.5, 32, { w: 1, h: 1 })).toEqual({ x: 0, y: 0 })
  })

  it('со `span` точка считается центром, а не левым верхним углом', () => {
    // Виджет 6×2 шириной 594px: чтобы он встал в третью колонку, курсор должен
    // быть на 297px правее её левого края.
    expect(cellFromPoint(metrics, 3 * 101 + 297, 32, { w: 6, h: 2 })).toMatchObject({ x: 3 })
  })

  it('без `span` точка — это левый верхний угол', () => {
    expect(cellFromPoint(metrics, 303, 76)).toEqual({ x: 3, y: 1 })
  })

  it('переезд в соседнюю ячейку на середине пути', () => {
    expect(cellFromPoint(metrics, 50, 0)).toMatchObject({ x: 0 })
    expect(cellFromPoint(metrics, 51, 0)).toMatchObject({ x: 1 })
  })

  it('за край сетки не выпускает: правая граница считается от ширины виджета', () => {
    expect(cellFromPoint(metrics, 5000, 5000, { w: 4, h: 1 })).toMatchObject({ x: 8 })
    expect(cellFromPoint(metrics, -500, -500, { w: 4, h: 1 })).toEqual({ x: 0, y: 0 })
  })

  it('нулевая ширина контейнера даёт нулевую ячейку, а не NaN', () => {
    expect(cellFromPoint(metricsOf(0, 12, 64, 12), 100, 100, { w: 2, h: 1 })).toEqual({ x: 0, y: 0 })
  })
})
