import { describe, expect, it } from 'vitest'

import { clampWindow, smallestGap, windowFromPixels, zoomWindow } from '../chartZoom'
import { linearScale } from '../chartScale'

const scale = linearScale([0, 10], [0, 100])

describe('windowFromPixels', () => {
  it('переводит пиксели протяжки в значения домена', () => {
    expect(windowFromPixels(scale, 20, 80)).toEqual([2, 8])
  })

  it('направление протяжки не важно', () => {
    expect(windowFromPixels(scale, 80, 20)).toEqual(windowFromPixels(scale, 20, 80))
  })
})

describe('zoomWindow', () => {
  it('сужает вокруг якоря, оставляя якорь на месте', () => {
    expect(zoomWindow([0, 10], 0.5, 5)).toEqual([2.5, 7.5])
  })

  it('якорь у края тянет окно только в одну сторону', () => {
    expect(zoomWindow([0, 10], 0.5, 0)).toEqual([0, 5])
  })

  it('множитель больше единицы отдаляет', () => {
    expect(zoomWindow([2, 8], 2, 5)).toEqual([-1, 11])
  })
})

describe('clampWindow', () => {
  it('окно внутри ряда остаётся собой', () => {
    expect(clampWindow([2, 8], [0, 10])).toEqual([2, 8])
  })

  it('окно шире ряда — это весь ряд, то есть `null`', () => {
    expect(clampWindow([-5, 20], [0, 10])).toBeNull()
  })

  it('у края окно сдвигается, а не сжимается', () => {
    // Заказаны четыре единицы ширины, край ряда на десяти: окно обязано
    // остаться четырёх единиц, а не превратиться в две.
    expect(clampWindow([8, 12], [0, 10])).toEqual([6, 10])
    expect(clampWindow([-2, 2], [0, 10])).toEqual([0, 4])
  })

  it('уже минимума не сжимается', () => {
    expect(clampWindow([4, 4.001], [0, 10], 2)).toEqual([4, 6])
  })

  it('вырожденный ряд приближать нечем', () => {
    expect(clampWindow([2, 8], [5, 5])).toBeNull()
    expect(clampWindow([Number.NaN, 8], [0, 10])).toBeNull()
  })
})

describe('smallestGap', () => {
  it('берёт самый плотный участок, а не средний шаг', () => {
    expect(smallestGap([0, 1, 2, 100])).toBe(1)
  })

  it('мерить нечего — пола нет', () => {
    expect(smallestGap([])).toBe(0)
    expect(smallestGap([5])).toBe(0)
    expect(smallestGap([3, 3])).toBe(0)
  })
})
