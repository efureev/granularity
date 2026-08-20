import { describe, expect, it } from 'vitest'

import type { PlainTime } from '../plainTime'
import {
  addHours,
  addMinutes,
  addSeconds,
  clampPlainTime,
  comparePlainTimes,
  ceilToStep,
  floorToStep,
  fromSecondsOfDay,
  fromTwelveHour,
  isPlainTimeWithin,
  isSamePlainTime,
  plainTime,
  SECONDS_IN_DAY,
  toSecondsOfDay,
  toTwelveHour,
} from '../plainTime'

function at(value: string): PlainTime {
  const [h, min, s] = value.split(':').map(Number) as [number, number, number?]
  return { h, min, s: s ?? 0 }
}

function fmt({ h, min, s }: PlainTime): string {
  return [h, min, s].map(part => String(part).padStart(2, '0')).join(':')
}

describe('секунды суток', () => {
  it.each([
    ['00:00:00', 0],
    ['00:01:00', 60],
    ['01:00:00', 3600],
    ['23:59:59', 86_399],
    ['12:34:56', 45_296],
  ])('%s ↔ %i', (value, seconds) => {
    expect(toSecondsOfDay(at(value))).toBe(seconds)
    expect(fmt(fromSecondsOfDay(seconds))).toBe(value)
  })

  it('преобразование обратимо на всех секундах суток', () => {
    for (let second = 0; second < SECONDS_IN_DAY; second += 97)
      expect(toSecondsOfDay(fromSecondsOfDay(second))).toBe(second)
  })
})

describe('шаг с кольцеванием', () => {
  it('через полночь вперёд и назад', () => {
    // Без кольцевания стрелка вверх на 23:59 упиралась бы и молчала.
    expect(fmt(addMinutes(at('23:59'), 1))).toBe('00:00:00')
    expect(fmt(addMinutes(at('00:00'), -1))).toBe('23:59:00')
    expect(fmt(addHours(at('23:00'), 1))).toBe('00:00:00')
    expect(fmt(addHours(at('00:00'), -1))).toBe('23:00:00')
  })

  it('переносит разряды', () => {
    expect(fmt(addSeconds(at('10:59:59'), 1))).toBe('11:00:00')
    expect(fmt(addMinutes(at('10:59'), 1))).toBe('11:00:00')
  })

  it('сдвиг больше суток заворачивается, а не накапливается', () => {
    expect(fmt(addHours(at('10:00'), 25))).toBe('11:00:00')
    expect(fmt(addHours(at('10:00'), -25))).toBe('09:00:00')
    expect(fmt(addSeconds(at('10:00'), SECONDS_IN_DAY * 3))).toBe('10:00:00')
  })

  it('нулевой шаг возвращает тот же объект', () => {
    const time = at('10:00')
    expect(addSeconds(time, 0)).toBe(time)
  })
})

describe('клампинг — в отличие от шага, без кольцевания', () => {
  it('останавливается на границе, а не перепрыгивает на другой конец суток', () => {
    const min = at('09:00')
    const max = at('18:00')

    expect(fmt(clampPlainTime(at('08:00'), min, max))).toBe('09:00:00')
    expect(fmt(clampPlainTime(at('19:00'), min, max))).toBe('18:00:00')
    expect(fmt(clampPlainTime(at('12:00'), min, max))).toBe('12:00:00')
  })

  it('незаданная граница не ограничивает', () => {
    expect(fmt(clampPlainTime(at('03:00'), undefined, at('18:00')))).toBe('03:00:00')
    expect(fmt(clampPlainTime(at('23:00'), at('09:00'), undefined))).toBe('23:00:00')
  })

  it('попадание в диапазон включает границы', () => {
    const min = at('09:00')
    const max = at('18:00')

    expect(isPlainTimeWithin(at('09:00'), min, max)).toBe(true)
    expect(isPlainTimeWithin(at('18:00'), min, max)).toBe(true)
    expect(isPlainTimeWithin(at('08:59:59'), min, max)).toBe(false)
    expect(isPlainTimeWithin(at('18:00:01'), min, max)).toBe(false)
  })
})

describe('сравнение', () => {
  it('лексикографично по часам, минутам, секундам', () => {
    expect(comparePlainTimes(at('09:00'), at('10:00'))).toBe(-1)
    expect(comparePlainTimes(at('10:01'), at('10:00'))).toBe(1)
    expect(comparePlainTimes(at('10:00:01'), at('10:00:00'))).toBe(1)
    expect(comparePlainTimes(at('10:00'), plainTime(10))).toBe(0)
    expect(isSamePlainTime(at('10:00:00'), plainTime(10, 0, 0))).toBe(true)
  })
})

describe('округление к шагу', () => {
  it('вниз, а не к ближайшему: колонка с шагом 5 не показывает 07', () => {
    expect(fmt(floorToStep(at('10:07'), 300))).toBe('10:05:00')
    expect(fmt(floorToStep(at('10:05'), 300))).toBe('10:05:00')
    expect(fmt(floorToStep(at('10:59'), 900))).toBe('10:45:00')
  })

  /**
   * Вверх, а не к ближайшему: «сейчас» в подвале значит «начиная с этого
   * момента», и округлённое вниз время уже прошло.
   */
  it('вверх — для «сейчас» в подвале', () => {
    expect(fmt(ceilToStep(at('14:37'), 900))).toBe('14:45:00')
    expect(fmt(ceilToStep(at('10:01'), 300))).toBe('10:05:00')
    expect(fmt(ceilToStep(at('10:46'), 900))).toBe('11:00:00')
  })

  it('время ровно на шаге не двигается', () => {
    const time = at('10:45')
    expect(ceilToStep(time, 900)).toBe(time)
  })

  /** Про дни пикер времени не знает и сместить их не может. */
  it('конец суток не заворачивается на следующий день', () => {
    expect(fmt(ceilToStep(at('23:58'), 300))).toBe('23:59:59')
    expect(fmt(ceilToStep(at('23:59:59'), 900))).toBe('23:59:59')
  })

  it('шаг в секунду и меньше ничего не меняет', () => {
    const time = at('10:07:33')
    expect(floorToStep(time, 1)).toBe(time)
    expect(floorToStep(time, 0)).toBe(time)
    expect(ceilToStep(time, 1)).toBe(time)
    expect(ceilToStep(time, 0)).toBe(time)
  })
})

describe('12-часовой вид', () => {
  it.each([
    [0, 12, 'am'],
    [1, 1, 'am'],
    [11, 11, 'am'],
    [12, 12, 'pm'],
    [13, 1, 'pm'],
    [23, 11, 'pm'],
  ])('%i часов → %i %s', (hour, twelve, period) => {
    // Полночь — 12 am, а не 0 am: наивное `h % 12` рисует «0:30 AM».
    expect(toTwelveHour(hour)).toEqual({ hour: twelve, period })
  })

  it('обратное преобразование возвращает исходный час на всех сутках', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const { hour: twelve, period } = toTwelveHour(hour)
      expect(fromTwelveHour(twelve, period)).toBe(hour)
    }
  })
})
