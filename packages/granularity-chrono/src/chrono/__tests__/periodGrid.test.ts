import { describe, expect, it } from 'vitest'

import { buildPeriodGrid, decadeLabel, decadeStart } from '../periodGrid'

function values(cells: ReturnType<typeof buildPeriodGrid>): number[] {
  return cells.map(cell => cell.value)
}

function disabled(cells: ReturnType<typeof buildPeriodGrid>): number[] {
  return cells.filter(cell => cell.disabled).map(cell => cell.value)
}

describe('сетка месяцев', () => {
  it('двенадцать месяцев показываемого года', () => {
    const cells = buildPeriodGrid({ mode: 'month', year: 2026 })

    expect(values(cells)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(cells[0]!.date).toEqual({ y: 2026, m: 0, d: 1 })
    expect(cells[0]!.key).toBe('2026-01')
  })

  it('месяц с границей внутри остаётся доступен', () => {
    // `min` 15 августа: сам август выбрать можно, июль — уже нет.
    const cells = buildPeriodGrid({ mode: 'month', year: 2026, min: { y: 2026, m: 7, d: 15 } })

    expect(disabled(cells)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('max отсекает сверху симметрично', () => {
    const cells = buildPeriodGrid({ mode: 'month', year: 2026, max: { y: 2026, m: 7, d: 1 } })

    expect(disabled(cells)).toEqual([8, 9, 10, 11])
  })

  it('февраль високосного года не обрезается 28-м числом', () => {
    // Граница 29 февраля: если длину месяца считать константой, месяц выпадет.
    const cells = buildPeriodGrid({ mode: 'month', year: 2028, min: { y: 2028, m: 1, d: 29 } })

    expect(disabled(cells)).toEqual([0])
  })

  it('текущий месяц помечается только в своём году', () => {
    const today = { y: 2026, m: 7, d: 12 }

    expect(buildPeriodGrid({ mode: 'month', year: 2026, today }).filter(cell => cell.current))
      .toHaveLength(1)
    expect(buildPeriodGrid({ mode: 'month', year: 2027, today }).filter(cell => cell.current))
      .toHaveLength(0)
  })
})

describe('сетка лет', () => {
  it('десятилетие с добором соседних лет по краям', () => {
    const cells = buildPeriodGrid({ mode: 'year', year: 2026 })

    expect(values(cells)).toEqual([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030])
    expect(cells[0]!.date).toEqual({ y: 2019, m: 0, d: 1 })
  })

  it('десятилетие считается от года, а не от показываемой даты', () => {
    expect(decadeStart(2026)).toBe(2020)
    expect(decadeStart(2020)).toBe(2020)
    expect(decadeStart(2019)).toBe(2010)
    // Отрицательных лет в календаре пакета нет, но округление вниз обязано
    // оставаться округлением вниз.
    expect(decadeStart(5)).toBe(0)
  })

  it('год с границей внутри остаётся доступен', () => {
    const cells = buildPeriodGrid({ mode: 'year', year: 2026, min: { y: 2026, m: 7, d: 12 } })

    expect(disabled(cells)).toEqual([2019, 2020, 2021, 2022, 2023, 2024, 2025])
  })

  it('подпись десятилетия не включает добор', () => {
    expect(decadeLabel(2026)).toBe('2020 — 2029')
    expect(decadeLabel(2019)).toBe('2010 — 2019')
  })

  it('текущий год помечается независимо от десятилетия', () => {
    const current = buildPeriodGrid({ mode: 'year', year: 2026, today: { y: 2026, m: 7, d: 12 } })
      .filter(cell => cell.current)

    expect(current.map(cell => cell.value)).toEqual([2026])
  })
})
