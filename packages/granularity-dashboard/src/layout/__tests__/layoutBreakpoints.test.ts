import { describe, expect, it } from 'vitest'

import type { GrDashboardLayout, GrDashboardResponsiveLayout } from '../layoutModel'
import { GR_DASHBOARD_BREAKPOINTS, GR_DASHBOARD_COLS } from '../layoutModel'
import { colsFor, deriveLayout, layoutFor, resolveBreakpoint } from '../layoutBreakpoints'
import { collides, compact } from '../layoutCollision'

const options = { breakpoints: GR_DASHBOARD_BREAKPOINTS, cols: GR_DASHBOARD_COLS }

describe('resolveBreakpoint', () => {
  it('выбирает брейкпоинт по нижнему порогу', () => {
    expect(resolveBreakpoint(1440, GR_DASHBOARD_BREAKPOINTS)).toBe('lg')
    expect(resolveBreakpoint(1200, GR_DASHBOARD_BREAKPOINTS)).toBe('lg')
    expect(resolveBreakpoint(1199, GR_DASHBOARD_BREAKPOINTS)).toBe('md')
    expect(resolveBreakpoint(800, GR_DASHBOARD_BREAKPOINTS)).toBe('sm')
  })

  it('ниже самого узкого порога отдаёт самый узкий', () => {
    expect(resolveBreakpoint(320, GR_DASHBOARD_BREAKPOINTS)).toBe('xs')
  })
})

describe('colsFor', () => {
  it('читает число колонок по брейкпоинту', () => {
    expect(colsFor('md', GR_DASHBOARD_COLS)).toBe(10)
  })

  it('число вместо мапы означает одинаковую сетку везде', () => {
    expect(colsFor('xs', 8)).toBe(8)
  })
})

describe('deriveLayout', () => {
  const source: GrDashboardLayout = [
    { id: 'a', x: 0, y: 0, w: 6, h: 2 },
    { id: 'b', x: 6, y: 0, w: 6, h: 2 },
    { id: 'c', x: 0, y: 2, w: 12, h: 1 },
  ]

  it('не теряет и не дублирует виджеты', () => {
    const derived = deriveLayout(source, 12, 2)

    expect(derived.map(item => item.id).sort()).toEqual(['a', 'b', 'c'])
  })

  it('не оставляет пересечений', () => {
    const derived = deriveLayout(source, 12, 6)
    const overlap = derived.some((item, i) => derived.slice(i + 1).some(other => collides(item, other)))

    expect(overlap).toBe(false)
  })

  it('сжимает ширину пропорционально', () => {
    const derived = deriveLayout(source, 12, 6)

    expect(derived.find(item => item.id === 'a')?.w).toBe(3)
    expect(derived.find(item => item.id === 'c')?.w).toBe(6)
  })

  it('не выпускает виджеты за правый край узкой сетки', () => {
    for (const item of deriveLayout(source, 12, 2)) {
      expect(item.x + item.w).toBeLessThanOrEqual(2)
    }
  })

  it('на той же сетке ничего не меняет', () => {
    expect(deriveLayout(source, 12, 12)).toEqual(source)
  })

  // Режим уплотнения принадлежит потребителю. Приложение, отключившее его,
  // получало вертикальное уплотнение на каждом брейкпоинте без своей раскладки.
  it('compact=none не уплотняет выведенную раскладку', () => {
    const gapped: GrDashboardLayout = [
      { id: 'a', x: 0, y: 0, w: 6, h: 2 },
      { id: 'b', x: 0, y: 5, w: 6, h: 2 },
    ]

    expect(deriveLayout(gapped, 12, 12, 'none').find(item => item.id === 'b')?.y).toBe(5)
    expect(deriveLayout(gapped, 12, 6, 'none').find(item => item.id === 'b')?.y).toBe(5)
  })

  it('без указания режима уплотняет по вертикали, как и раньше', () => {
    const gapped: GrDashboardLayout = [
      { id: 'a', x: 0, y: 0, w: 6, h: 2 },
      { id: 'b', x: 0, y: 5, w: 6, h: 2 },
    ]

    expect(deriveLayout(gapped, 12, 6).find(item => item.id === 'b')?.y).toBe(2)
  })
})

describe('layoutFor', () => {
  const responsive: GrDashboardResponsiveLayout = {
    lg: [
      { id: 'a', x: 0, y: 0, w: 6, h: 2 },
      { id: 'b', x: 6, y: 0, w: 6, h: 2 },
    ],
  }

  it('отдаёт объявленную раскладку как есть', () => {
    expect(layoutFor(responsive, 'lg', options)).toEqual(responsive.lg)
  })

  // Раскладка выводится молча, и режим уплотнения обязан доехать до вывода:
  // иначе `compact="none"` действует только на том брейкпоинте, который
  // приложение объявило руками.
  it('доносит режим уплотнения до выведенной раскладки', () => {
    const gapped: GrDashboardResponsiveLayout = {
      lg: [
        { id: 'a', x: 0, y: 0, w: 6, h: 2 },
        { id: 'b', x: 0, y: 5, w: 6, h: 2 },
      ],
    }

    const kept = layoutFor(gapped, 'sm', { ...options, compact: 'none' })
    const packed = layoutFor(gapped, 'sm', options)

    expect(kept.find(item => item.id === 'b')?.y).toBe(5)
    expect(packed.find(item => item.id === 'b')?.y).toBe(2)
  })

  it('недостающую выводит из ближайшей более широкой', () => {
    const derived = layoutFor(responsive, 'sm', options)

    expect(derived.map(item => item.id).sort()).toEqual(['a', 'b'])
    expect(derived.every(item => item.x + item.w <= 6)).toBe(true)
  })

  it('донора сверху нет — берёт снизу', () => {
    const narrowOnly: GrDashboardResponsiveLayout = { xs: [{ id: 'a', x: 0, y: 0, w: 2, h: 1 }] }

    expect(layoutFor(narrowOnly, 'lg', options).map(item => item.id)).toEqual(['a'])
  })

  it('пустая модель даёт пустую раскладку, а не исключение', () => {
    expect(layoutFor({}, 'md', options)).toEqual([])
  })
})

describe('вывод раскладки в горизонтальных режимах', () => {
  const source: GrDashboardLayout = [
    { id: 'a', x: 0, y: 0, w: 6, h: 2 },
    { id: 'b', x: 6, y: 0, w: 6, h: 2 },
    { id: 'c', x: 3, y: 2, w: 6, h: 1 },
  ]

  it('deriveLayout с horizontal не теряет виджеты и не оставляет пересечений', () => {
    const derived = deriveLayout(source, 12, 2, 'horizontal')

    expect(derived.map(item => item.id).sort()).toEqual(['a', 'b', 'c'])
    expect(derived.some((item, index) => derived.slice(index + 1).some(other => collides(item, other)))).toBe(false)
  })

  it('deriveLayout с both отдаёт раскладку, неподвижную под повторным уплотнением', () => {
    const derived = deriveLayout(source, 12, 6, 'both')

    expect(compact(derived, 'both')).toEqual(derived)
  })

  it('layoutFor доносит horizontal до выведенной раскладки', () => {
    const responsive: GrDashboardResponsiveLayout = {
      lg: [
        { id: 'a', x: 4, y: 0, w: 2, h: 1 },
        { id: 'b', x: 8, y: 0, w: 2, h: 1 },
      ],
    }

    const derived = layoutFor(responsive, 'sm', { ...options, compact: 'horizontal' })

    expect(derived.map(item => item.x)).toEqual([0, 1])
    expect(derived.every(item => item.y === 0)).toBe(true)
  })
})
