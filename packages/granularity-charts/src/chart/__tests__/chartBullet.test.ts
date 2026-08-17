import { describe, expect, it } from 'vitest'

import { bulletLayout } from '../chartBullet'

describe('bulletLayout', () => {
  it('шкала начинается с нуля: bullet без него теряет смысл пропорции', () => {
    expect(bulletLayout({ value: 0.031, max: 0.04 }).domain[0]).toBe(0)
  })

  it('неотсортированные границы нормализуются', () => {
    const model = bulletLayout({ value: 0.5, max: 1.2, ranges: [1, 0.9] })

    expect(model.bands.map(band => [band.from, band.to])).toEqual([[0, 0.9], [0.9, 1], [1, 1.2]])
  })

  it('полос всегда на одну больше, чем границ', () => {
    expect(bulletLayout({ value: 1, max: 10, ranges: [3, 6, 9] }).bands).toHaveLength(4)
  })

  it('граница за краем шкалы зажимается, а не выбрасывается', () => {
    // Выброси её — и цвета из `rangeColors` уехали бы на соседние полосы.
    const model = bulletLayout({ value: 1, max: 10, ranges: [3, 99] })

    expect(model.bands).toHaveLength(3)
    expect(model.bands[2]).toEqual({ index: 2, from: 10, to: 10 })
  })

  it('значение больше верха шкалы помечается переполнением, а не обрезается молча', () => {
    const model = bulletLayout({ value: 15, max: 10 })

    expect(model.overflow).toBe(true)
    expect(model.value).toBe(10)
    expect(model.rawValue).toBe(15)
  })

  it('значение ниже низа шкалы помечается тем же способом', () => {
    const model = bulletLayout({ value: -3, min: 0, max: 10 })

    expect(model.underflow).toBe(true)
    expect(model.value).toBe(0)
    expect(model.rawValue).toBe(-3)
  })

  it('`value: null` — не ноль: величины нет, цель остаётся', () => {
    const model = bulletLayout({ value: null, target: 4, max: 10 })

    expect(model.value).toBeNull()
    expect(model.rawValue).toBeNull()
    expect(model.overflow).toBe(false)
    expect(model.target).toBe(4)
  })

  it('верх шкалы без `max` берётся по данным с запасом', () => {
    const model = bulletLayout({ value: 8, target: 10 })

    expect(model.domain[1]).toBeGreaterThan(10)
  })

  it('`min` ≠ 0 не ломает пропорции: полосы считаются от него', () => {
    const model = bulletLayout({ value: 60, min: 50, max: 100, ranges: [70] })

    expect(model.domain).toEqual([50, 100])
    expect(model.bands.map(band => [band.from, band.to])).toEqual([[50, 70], [70, 100]])
  })

  it('цель за пределами шкалы помечается — засечку рисовать негде', () => {
    expect(bulletLayout({ value: 5, max: 10, target: 50 }).targetOutside).toBe(true)
    expect(bulletLayout({ value: 5, max: 10, target: 8 }).targetOutside).toBe(false)
  })

  it('вырожденная шкала не даёт деления на ноль', () => {
    const model = bulletLayout({ value: 0, min: 0, max: 0 })

    expect(model.domain[1]).toBeGreaterThan(model.domain[0])
  })

  it('пустой вход даёт шкалу, а не падение', () => {
    const model = bulletLayout({ value: null })

    expect(model.domain).toEqual([0, 1])
    expect(model.bands).toEqual([{ index: 0, from: 0, to: 1 }])
  })

  it('нечисловое значение — это отсутствие величины, а не `NaN` на шкале', () => {
    expect(bulletLayout({ value: Number.NaN, max: 10 }).value).toBeNull()
  })
})
