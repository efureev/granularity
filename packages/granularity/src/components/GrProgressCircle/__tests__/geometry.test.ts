import { describe, expect, it } from 'vitest'

import { arcGeometry, clampProgress, VIEW_BOX } from '../geometry'

function dashLength(dashArray: string): number {
  return Number(dashArray.split(' ')[0])
}

describe('clampProgress', () => {
  it('держит значение в 0..100', () => {
    expect(clampProgress(42)).toBe(42)
    expect(clampProgress(-10)).toBe(0)
    expect(clampProgress(140)).toBe(100)
    expect(clampProgress(1e9)).toBe(100)
  })

  it('нечисло — это ноль, а не пустая разметка', () => {
    expect(clampProgress(Number.NaN)).toBe(0)
    expect(clampProgress(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('arcGeometry', () => {
  it('радиус учитывает толщину — обводка не срезается границей viewBox', () => {
    for (const thickness of [4, 10, 20]) {
      const { radius } = arcGeometry('circle', thickness, 50)

      expect(radius + thickness / 2).toBeLessThanOrEqual(VIEW_BOX / 2)
    }
  })

  it('толщина клампится: нулевая дала бы радиус в полвьюбокса и срез обводки', () => {
    expect(arcGeometry('circle', 0, 50).radius).toBeLessThan(VIEW_BOX / 2)
    expect(arcGeometry('circle', 1000, 50).radius).toBeGreaterThan(0)
  })

  it('кольцо — вся окружность, «дашборд» — ровно три четверти', () => {
    const circle = arcGeometry('circle', 10, 100)
    const dashboard = arcGeometry('dashboard', 10, 100)

    expect(circle.arcLength).toBeCloseTo(circle.circumference, 6)
    expect(dashboard.arcLength).toBeCloseTo(dashboard.circumference * 0.75, 6)
  })

  it('вырез «дашборда» смотрит строго вниз и симметричен', () => {
    // Дуга стартует с трёх часов; поворот на 135° уводит начало на 7:30, и
    // оставшаяся четверть ложится ровно вокруг шести часов.
    expect(arcGeometry('dashboard', 10, 50).rotation).toBe(135)
    expect(arcGeometry('circle', 10, 50).rotation).toBe(-90)
  })

  it('длина дуги значения — доля от дорожки, а не от окружности', () => {
    const dashboard = arcGeometry('dashboard', 10, 50)

    expect(dashLength(dashboard.valueDashArray)).toBeCloseTo(dashboard.arcLength / 2, 6)
    expect(dashLength(dashboard.trackDashArray)).toBeCloseTo(dashboard.arcLength, 6)
  })

  it('ноль не рисует дуги, сотня замыкает её без просвета', () => {
    expect(dashLength(arcGeometry('circle', 10, 0).valueDashArray)).toBe(0)

    const full = arcGeometry('circle', 10, 100)
    expect(dashLength(full.valueDashArray)).toBeCloseTo(full.circumference, 6)
  })

  it('пробел за штрихом — вся окружность: остаток дорожки не повторяется', () => {
    const { valueDashArray, circumference } = arcGeometry('circle', 10, 25)

    expect(Number(valueDashArray.split(' ')[1])).toBeCloseTo(circumference, 6)
  })

  it('выход за границы клампится так же, как в модели', () => {
    const over = arcGeometry('circle', 10, 140)
    const under = arcGeometry('circle', 10, -5)

    expect(dashLength(over.valueDashArray)).toBeCloseTo(over.circumference, 6)
    expect(dashLength(under.valueDashArray)).toBe(0)
  })
})
