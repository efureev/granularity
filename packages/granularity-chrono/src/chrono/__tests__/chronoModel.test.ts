import { describe, expect, it } from 'vitest'

import { plainDateKey } from '../plainDate'
import {
  dateAdapter,
  fromPlainParts,
  isoDateAdapter,
  isoDateTimeAdapter,
  isValidDate,
  resolveChronoAdapter,
  timestampAdapter,
  toPlainDate,
  toPlainTime,
} from '../chronoModel'

describe('граница с Date', () => {
  it('разбор берёт локальные поля, а не UTC', () => {
    // Прогон в `America/New_York`: 12 августа в локальном календаре обязано
    // остаться 12-м, каким бы ни было смещение зоны.
    const date = new Date(2026, 7, 12, 14, 30, 45)

    expect(toPlainDate(date)).toEqual({ y: 2026, m: 7, d: 12 })
    expect(toPlainTime(date)).toEqual({ h: 14, min: 30, s: 45 })
  })

  it('сборка без времени даёт локальную полночь', () => {
    const date = fromPlainParts({ y: 2026, m: 7, d: 12 })

    expect(date.getHours()).toBe(0)
    expect(date.getMinutes()).toBe(0)
    expect(toPlainDate(date)).toEqual({ y: 2026, m: 7, d: 12 })
  })

  it('туда-обратно не сдвигает дату ни в один день года', () => {
    for (let day = 0; day < 366; day += 1) {
      const source = new Date(2026, 0, 1 + day)
      const plain = toPlainDate(source)

      expect(plainDateKey(toPlainDate(fromPlainParts(plain))), plainDateKey(plain)).toBe(plainDateKey(plain))
    }
  })

  it('однозначный год не превращается в 19xx', () => {
    // `new Date(50, 0, 1)` — это 1950 год; год выставляется отдельно.
    const date = fromPlainParts({ y: 50, m: 0, d: 1 })

    expect(date.getFullYear()).toBe(50)
  })

  it('валидность даты проверяется, а не предполагается', () => {
    expect(isValidDate(new Date(2026, 7, 12))).toBe(true)
    expect(isValidDate(new Date('нет такой даты'))).toBe(false)
    expect(isValidDate('2026-08-12')).toBe(false)
    expect(isValidDate(null)).toBe(false)
  })
})

describe('адаптер date', () => {
  it('тождественный, но невалидную дату не пропускает', () => {
    const date = new Date(2026, 7, 12)

    expect(dateAdapter.parse(date)).toBe(date)
    expect(dateAdapter.serialize(date)).toBe(date)
    expect(dateAdapter.parse(new Date('мусор'))).toBeNull()
    expect(dateAdapter.parse(null)).toBeNull()
  })
})

describe('адаптер isoDate', () => {
  it('туда-обратно сохраняет календарную дату', () => {
    const parsed = isoDateAdapter.parse('2026-08-12')!

    expect(toPlainDate(parsed)).toEqual({ y: 2026, m: 7, d: 12 })
    expect(isoDateAdapter.serialize(parsed)).toBe('2026-08-12')
  })

  it('несуществующая дата отклоняется, а не «исправляется»', () => {
    // `2026-02-31` собралось бы в 3 марта — молчаливая подмена значения.
    expect(isoDateAdapter.parse('2026-02-31')).toBeNull()
    expect(isoDateAdapter.parse('2026-13-01')).toBeNull()
    expect(isoDateAdapter.parse('2024-02-29')).not.toBeNull() // високосный — существует
  })

  it('мусор на входе даёт null, а не исключение', () => {
    for (const raw of ['', '12.08.2026', '2026-8-12', '2026-08-12T10:00', null, 42 as never])
      expect(isoDateAdapter.parse(raw as never)).toBeNull()
  })
})

describe('адаптер isoDateTime', () => {
  it('туда-обратно сохраняет и дату, и время', () => {
    const parsed = isoDateTimeAdapter.parse('2026-08-12T14:30:45')!

    expect(toPlainTime(parsed)).toEqual({ h: 14, min: 30, s: 45 })
    expect(isoDateTimeAdapter.serialize(parsed)).toBe('2026-08-12T14:30:45')
  })

  it('секунды необязательны, пробел вместо T допускается', () => {
    expect(toPlainTime(isoDateTimeAdapter.parse('2026-08-12T14:30')!)).toEqual({ h: 14, min: 30, s: 0 })
    expect(toPlainTime(isoDateTimeAdapter.parse('2026-08-12 14:30')!)).toEqual({ h: 14, min: 30, s: 0 })
  })

  it('несуществующее локальное время отклоняется', () => {
    // 8 марта 2026 в `America/New_York` часы прыгают с 02:00 на 03:00 —
    // времени 02:30 в этот день не существует, и `Date` тихо сдвинет его.
    expect(isoDateTimeAdapter.parse('2026-03-08T02:30')).toBeNull()
  })

  it('смещения в формате нет намеренно', () => {
    expect(isoDateTimeAdapter.serialize(new Date(2026, 7, 12, 9, 5, 0))).toBe('2026-08-12T09:05:00')
  })
})

describe('адаптер timestamp', () => {
  it('туда-обратно сохраняет момент', () => {
    const date = new Date(2026, 7, 12, 14, 30)
    const raw = timestampAdapter.serialize(date)

    expect(typeof raw).toBe('number')
    expect(timestampAdapter.parse(raw)!.getTime()).toBe(date.getTime())
  })

  it('не-число и нечисловые значения отклоняются', () => {
    expect(timestampAdapter.parse(Number.NaN)).toBeNull()
    expect(timestampAdapter.parse(Number.POSITIVE_INFINITY)).toBeNull()
    expect(timestampAdapter.parse('1786000000000' as never)).toBeNull()
  })
})

describe('выбор адаптера', () => {
  it('по имени', () => {
    expect(resolveChronoAdapter('isoDate')).toBe(isoDateAdapter)
    expect(resolveChronoAdapter('timestamp')).toBe(timestampAdapter)
  })

  it('без указания — тождественный', () => {
    expect(resolveChronoAdapter(undefined)).toBe(dateAdapter)
  })

  it('свой адаптер проходит как есть', () => {
    const custom = { parse: () => null, serialize: () => 'x' }

    expect(resolveChronoAdapter(custom)).toBe(custom)
  })
})
