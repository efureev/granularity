import { describe, expect, it } from 'vitest'

import { alignedTicks, bandTicks, linearTicks, niceNumber, timeTicks } from '../chartTicks'

/** Шаг обязан быть 1, 2 или 5 на своём порядке — это и есть Heckbert. */
function mantissa(step: number): number {
  const exponent = Math.floor(Math.log10(step))

  return Number((step / 10 ** exponent).toFixed(6))
}

describe('niceNumber', () => {
  it('округляет к 1 / 2 / 5 / 10', () => {
    expect(niceNumber(1, true)).toBe(1)
    expect(niceNumber(2.4, true)).toBe(2)
    expect(niceNumber(6, true)).toBe(5)
    expect(niceNumber(9, true)).toBe(10)
  })

  it('на непозитивном размахе отдаёт ноль, а не NaN', () => {
    expect(niceNumber(0, true)).toBe(0)
    expect(niceNumber(-5, false)).toBe(0)
    expect(niceNumber(Number.POSITIVE_INFINITY, false)).toBe(0)
  })
})

describe('linearTicks', () => {
  it('шаг всегда из семейства {1,2,5}×10^k', () => {
    const domains: [number, number][] = [[0, 1], [0, 97], [-3, 3], [0.3, 7.1], [1200, 98_000], [0, 0.0007]]

    for (const domain of domains) {
      const { step } = linearTicks(domain, 5)

      expect([1, 2, 5, 10], `домен ${domain.join('…')}`).toContain(mantissa(step))
    }
  })

  it('число делений держится в допуске от запрошенного', () => {
    for (const desired of [3, 5, 8]) {
      const { values } = linearTicks([0, 97], desired)

      expect(values.length).toBeGreaterThanOrEqual(Math.floor(desired / 2))
      expect(values.length).toBeLessThanOrEqual(desired * 2)
    }
  })

  it('домен расширяется наружу, а не внутрь', () => {
    const { niceDomain } = linearTicks([3, 97], 5)

    expect(niceDomain[0]).toBeLessThanOrEqual(3)
    expect(niceDomain[1]).toBeGreaterThanOrEqual(97)
  })

  it('не оставляет хвостов двоичной арифметики', () => {
    // Без округления по разрядности шага здесь приехало бы
    // `0.30000000000000004` и `0.7000000000000001`.
    expect(linearTicks([0, 1], 5).values).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    expect(linearTicks([0, 0.0007], 4).values.every(value => String(value).length <= 7)).toBe(true)
  })

  it('домен через ноль и полностью отрицательный', () => {
    expect(linearTicks([-40, 60], 5).values).toContain(0)
    expect(linearTicks([-90, -10], 4).values.every(v => v <= 0)).toBe(true)
  })

  it('вырожденный домен даёт одно деление, а не выдуманный разброс', () => {
    const { values, niceDomain } = linearTicks([5, 5], 5)

    expect(values).toEqual([5])
    expect(niceDomain).toEqual([4.5, 5.5])
  })

  it('нечисловой домен не роняет ось', () => {
    expect(linearTicks([Number.NaN, 10], 5).values).toEqual([])
  })
})

describe('timeTicks', () => {
  it('выбирает единицу по размаху', () => {
    const day = timeTicks([Date.UTC(2026, 0, 1), Date.UTC(2026, 0, 6)], 5)
    const month = timeTicks([Date.UTC(2026, 0, 1), Date.UTC(2026, 11, 31)], 6)
    const year = timeTicks([Date.UTC(2000, 0, 1), Date.UTC(2026, 0, 1)], 5)

    expect(day.unit).toBe('day')
    expect(month.unit).toBe('month')
    expect(year.unit).toBe('year')
  })

  it('деления идут по возрастанию, без дублей и внутри домена', () => {
    const from = Date.UTC(2026, 2, 1)
    const to = Date.UTC(2026, 2, 31)
    const { values } = timeTicks([from, to], 6)

    expect(values.length).toBeGreaterThan(1)
    expect([...new Set(values)]).toEqual(values)
    expect([...values].sort((a, b) => a - b)).toEqual(values)
    expect(values[0]).toBeGreaterThanOrEqual(from)
    expect(values[values.length - 1]).toBeLessThanOrEqual(to)
  })

  it('переход на летнее время не даёт дубля и не теряет деление', () => {
    // 2026-03-08 — переход в America/New_York (зона задана в setup.ts).
    const from = new Date(2026, 2, 6).getTime()
    const to = new Date(2026, 2, 11).getTime()
    const { values, unit } = timeTicks([from, to], 6)

    expect(unit).toBe('day')
    expect([...new Set(values)]).toEqual(values)
    // Полночь каждого дня — ровно полночь, а не 23:00 предыдущего.
    for (const value of values)
      expect(new Date(value).getHours()).toBe(0)
  })

  it('месяцы шагаются календарём, а не фиксированным числом миллисекунд', () => {
    const { values, unit } = timeTicks([new Date(2026, 0, 1).getTime(), new Date(2026, 11, 31).getTime()], 6)

    expect(unit).toBe('month')
    for (const value of values)
      expect(new Date(value).getDate()).toBe(1)
  })

  it('перевёрнутый домен не вешает генерацию', () => {
    expect(timeTicks([Date.UTC(2026, 5, 1), Date.UTC(2026, 0, 1)], 5).values).toEqual([])
  })
})

describe('bandTicks', () => {
  it('до потолка показывает все категории', () => {
    expect(bandTicks(4, 8)).toEqual([0, 1, 2, 3])
  })

  it('прореживает и всегда оставляет первую и последнюю', () => {
    const indices = bandTicks(30, 6)

    expect(indices.length).toBeLessThanOrEqual(7)
    expect(indices[0]).toBe(0)
    expect(indices[indices.length - 1]).toBe(29)
  })

  it('пустой набор — пустой список', () => {
    expect(bandTicks(0, 6)).toEqual([])
  })
})

describe('alignedTicks', () => {
  it('число делений задаётся снаружи и соблюдается', () => {
    // Иначе сетка двух осей двоилась бы: у каждой лестницы свой счёт.
    for (const count of [3, 5, 8])
      expect(alignedTicks([0, 97], count).values).toHaveLength(count)
  })

  it('данные остаются внутри расширенного домена', () => {
    const ticks = alignedTicks([12, 97], 5)

    expect(ticks.niceDomain[0]).toBeLessThanOrEqual(12)
    expect(ticks.niceDomain[1]).toBeGreaterThanOrEqual(97)
  })

  it('шаг берётся с той же лестницы 1/2/5/10, что и у обычных делений', () => {
    expect(alignedTicks([0, 100], 5).step).toBe(50)
  })

  it('верхнее деление совпадает с верхом домена', () => {
    const ticks = alignedTicks([0, 97], 5)

    expect(ticks.values.at(-1)).toBe(ticks.niceDomain[1])
  })

  it('вырожденный домен даёт одно деление, а не деление на ноль', () => {
    expect(alignedTicks([7, 7], 5).values).toEqual([7])
  })

  it('отрицательный домен не ломает знаки', () => {
    const ticks = alignedTicks([-80, -10], 5)

    expect(ticks.niceDomain[0]).toBeLessThanOrEqual(-80)
    expect(ticks.values.every(value => value <= 0)).toBe(true)
  })
})
