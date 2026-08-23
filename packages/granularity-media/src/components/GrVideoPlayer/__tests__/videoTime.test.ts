import { describe, expect, it } from 'vitest'

import { bufferedPercent, clampTime, formatTime, progressPercent } from '../videoTime'

describe('formatTime', () => {
  it('секунды всегда двузначные: `1:5` читается как «час пять»', () => {
    expect(formatTime(65)).toBe('1:05')
  })

  it('часы появляются только когда они есть', () => {
    // `0:00:07` у ролика на семь секунд читается как ошибка.
    expect(formatTime(7)).toBe('0:07')
    expect(formatTime(3723)).toBe('1:02:03')
  })

  it('до готовности метаданных длительность — не число', () => {
    expect(formatTime(Number.NaN)).toBe('0:00')
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('0:00')
    expect(formatTime(-4)).toBe('0:00')
  })
})

describe('clampTime', () => {
  it('перемотка не выходит за края', () => {
    expect(clampTime(-5, 30)).toBe(0)
    expect(clampTime(45, 30)).toBe(30)
  })

  it('без длительности перемотки нет', () => {
    expect(clampTime(10, Number.NaN)).toBe(0)
  })
})

describe('progressPercent', () => {
  it('считает долю просмотренного', () => {
    expect(progressPercent(15, 60)).toBe(25)
  })

  it('на нулевой длительности не делит на ноль', () => {
    expect(progressPercent(15, 0)).toBe(0)
  })
})

describe('bufferedPercent', () => {
  const ranges = (pairs: [number, number][]) => ({
    length: pairs.length,
    start: (index: number) => pairs[index]![0],
    end: (index: number) => pairs[index]![1],
  })

  it('берёт диапазон вокруг текущей позиции, а не последний', () => {
    // После перемотки назад последний диапазон относится к другому куску:
    // полоса буфера прыгнула бы вперёд на пустом месте.
    expect(bufferedPercent(ranges([[0, 20], [50, 90]]), 5, 100)).toBe(20)
  })

  it('позиция вне загруженного даёт ноль', () => {
    expect(bufferedPercent(ranges([[0, 20]]), 40, 100)).toBe(0)
  })

  it('без диапазонов и без длительности — ноль', () => {
    expect(bufferedPercent(null, 0, 100)).toBe(0)
    expect(bufferedPercent(ranges([[0, 20]]), 5, 0)).toBe(0)
  })
})
