import { describe, expect, it } from 'vitest'

import {
  clampIndex,
  resistOffset,
  resolveSwipeDirection,
  stepIndex,
  SWIPE_RESISTANCE,
  SWIPE_THRESHOLD_PX,
  stripScrollLeft,
  swipeThresholdFor,
} from '../carouselNavigation'

describe('resolveSwipeDirection', () => {
  it('не считает свайпом движение короче порога', () => {
    expect(resolveSwipeDirection(-(SWIPE_THRESHOLD_PX - 1), 0)).toBe(0)
    expect(resolveSwipeDirection(SWIPE_THRESHOLD_PX - 1, 0)).toBe(0)
  })

  it('листает вперёд, когда палец ушёл влево', () => {
    expect(resolveSwipeDirection(-120, 0)).toBe(1)
  })

  it('листает назад, когда палец ушёл вправо', () => {
    expect(resolveSwipeDirection(120, 0)).toBe(-1)
  })

  it('отдаёт вертикальный жест странице', () => {
    // Горизонталь есть и порог пройден, но вертикаль больше — это прокрутка.
    expect(resolveSwipeDirection(-100, 200)).toBe(0)
  })

  it('засчитывает диагональ, где горизонталь ведёт', () => {
    expect(resolveSwipeDirection(-200, 100)).toBe(1)
  })

  it('принимает свой порог', () => {
    expect(resolveSwipeDirection(-80, 0, 200)).toBe(0)
    expect(resolveSwipeDirection(-240, 0, 200)).toBe(1)
  })
})

describe('swipeThresholdFor', () => {
  it('на узкой ленте держит пиксельный минимум', () => {
    expect(swipeThresholdFor(200)).toBe(SWIPE_THRESHOLD_PX)
  })

  it('на широкой ленте растёт долей ширины', () => {
    expect(swipeThresholdFor(1200)).toBe(180)
  })

  it('при нулевой ширине вырождается в минимум — иначе жест не проверить в jsdom', () => {
    expect(swipeThresholdFor(0)).toBe(SWIPE_THRESHOLD_PX)
  })
})

describe('resistOffset', () => {
  it('внутри ленты идёт за пальцем один в один', () => {
    expect(resistOffset(80, false)).toBe(80)
  })

  it('за краем вязнет', () => {
    expect(resistOffset(80, true)).toBe(80 / SWIPE_RESISTANCE)
  })
})

describe('clampIndex', () => {
  it('зажимает в границы', () => {
    expect(clampIndex(-3, 5)).toBe(0)
    expect(clampIndex(9, 5)).toBe(4)
    expect(clampIndex(2, 5)).toBe(2)
  })

  it('на пустой ленте даёт ноль', () => {
    expect(clampIndex(3, 0)).toBe(0)
    expect(clampIndex(-1, 0)).toBe(0)
  })

  it('обрезает дробное и не пропускает NaN', () => {
    expect(clampIndex(2.7, 5)).toBe(2)
    expect(clampIndex(Number.NaN, 5)).toBe(0)
  })
})

describe('stepIndex', () => {
  it('шагает внутри ленты', () => {
    expect(stepIndex(1, 1, 4, false)).toBe(2)
    expect(stepIndex(1, -1, 4, false)).toBe(0)
  })

  it('без loop упирается в край и возвращает тот же индекс', () => {
    expect(stepIndex(3, 1, 4, false)).toBe(3)
    expect(stepIndex(0, -1, 4, false)).toBe(0)
  })

  it('с loop замыкает ленту в обе стороны', () => {
    expect(stepIndex(3, 1, 4, true)).toBe(0)
    expect(stepIndex(0, -1, 4, true)).toBe(3)
  })

  it('на одном слайде никуда не ведёт даже с loop', () => {
    expect(stepIndex(0, 1, 1, true)).toBe(0)
    expect(stepIndex(0, -1, 1, true)).toBe(0)
  })

  it('на пустой ленте даёт ноль', () => {
    expect(stepIndex(0, 1, 0, true)).toBe(0)
  })
})

describe('stripScrollLeft', () => {
  it('видимый кадр полосу не двигает', () => {
    expect(stripScrollLeft(0, 200, 40, 90)).toBe(0)
  })

  it('кадр левее видимой части — подтягивает к нему', () => {
    expect(stripScrollLeft(100, 200, 40, 90)).toBe(40)
  })

  it('кадр правее — подтягивает минимально, а не центрирует', () => {
    expect(stripScrollLeft(0, 200, 260, 300)).toBe(100)
  })

  it('за левый край не уезжает', () => {
    expect(stripScrollLeft(50, 200, 10, 40, 100)).toBe(0)
  })

  it('нулевая ширина полосы — в jsdom она всегда такая — ничего не меняет', () => {
    expect(stripScrollLeft(30, 0, 100, 200)).toBe(30)
  })
})
