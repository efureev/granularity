import { describe, expect, it } from 'vitest'

import { bandScale, createScale, linearScale, nearestIndex, timeScale } from '../chartScale'

describe('linearScale', () => {
  it('переводит домен в диапазон и обратно', () => {
    const scale = linearScale([0, 100], [0, 400])

    expect(scale.scale(0)).toBe(0)
    expect(scale.scale(50)).toBe(200)
    expect(scale.scale(100)).toBe(400)
    expect(scale.invert(200)).toBeCloseTo(50, 9)
  })

  it('invert обратен scale на произвольных значениях', () => {
    const scale = linearScale([-17.5, 233.25], [12, 512])

    for (const value of [-17.5, 0, 1.125, 99, 233.25])
      expect(scale.invert(scale.scale(value))).toBeCloseTo(value, 9)
  })

  it('работает с инвертированным диапазоном — это ось значений', () => {
    const scale = linearScale([0, 10], [200, 0])

    expect(scale.scale(0)).toBe(200)
    expect(scale.scale(10)).toBe(0)
    expect(scale.scale(5)).toBe(100)
  })

  it('вырожденный домен не даёт деления на ноль', () => {
    const scale = linearScale([7, 7], [0, 300])

    expect(scale.scale(7)).toBe(150)
    expect(scale.scale(99)).toBe(150)
    expect(Number.isNaN(scale.invert(0))).toBe(false)
    expect(scale.invert(0)).toBe(7)
  })
})

describe('timeScale', () => {
  it('отличается от линейной только маркером типа', () => {
    const domain: [number, number] = [Date.UTC(2026, 0, 1), Date.UTC(2026, 0, 31)]
    const time = timeScale(domain, [0, 300])
    const linear = linearScale(domain, [0, 300])

    expect(time.kind).toBe('time')
    expect(time.scale(domain[0])).toBe(linear.scale(domain[0]))
    expect(time.scale(domain[1])).toBe(linear.scale(domain[1]))
  })
})

describe('bandScale', () => {
  it('отдаёт центр полосы, а не левый край', () => {
    const scale = bandScale(2, [0, 100], { paddingInner: 0, paddingOuter: 0 })

    expect(scale.bandwidth).toBe(50)
    expect(scale.scale(0)).toBe(25)
    expect(scale.scale(1)).toBe(75)
  })

  it('полосы и промежутки укладываются в диапазон', () => {
    const scale = bandScale(5, [0, 500])
    const first = scale.scale(0) - scale.bandwidth / 2
    const last = scale.scale(4) + scale.bandwidth / 2

    expect(first).toBeGreaterThanOrEqual(0)
    expect(last).toBeLessThanOrEqual(500)
  })

  it('invert возвращает индекс ближайшей полосы и не выходит за края', () => {
    const scale = bandScale(3, [0, 300])

    expect(scale.invert(scale.scale(1))).toBe(1)
    expect(scale.invert(-1000)).toBe(0)
    expect(scale.invert(1000)).toBe(2)
  })

  it('пустой набор категорий не даёт NaN', () => {
    const scale = bandScale(0, [0, 100])

    expect(Number.isNaN(scale.scale(0))).toBe(false)
    expect(scale.bandwidth).toBe(0)
    expect(scale.step).toBe(0)
  })
})

describe('createScale', () => {
  it('выводит число полос из домена', () => {
    const scale = createScale('band', [0, 3], [0, 400])

    expect(scale.kind).toBe('band')
    expect(scale.invert(scale.scale(3))).toBe(3)
  })
})

describe('nearestIndex', () => {
  const positions = [0, 10, 20, 30, 40]
  const scale = linearScale([0, 40], [0, 400])

  it('находит ближайшую позицию', () => {
    expect(nearestIndex(positions, scale, 0)).toBe(0)
    expect(nearestIndex(positions, scale, 106)).toBe(1)
    expect(nearestIndex(positions, scale, 400)).toBe(4)
  })

  it('за пределами холста прижимается к краю', () => {
    expect(nearestIndex(positions, scale, -500)).toBe(0)
    expect(nearestIndex(positions, scale, 5000)).toBe(4)
  })

  it('на пустом наборе отдаёт -1, а не бросает', () => {
    expect(nearestIndex([], scale, 100)).toBe(-1)
  })
})
