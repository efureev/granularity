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

/**
 * Квартал — четыре ячейки, а не двенадцать: год делится на них ровно, и
 * добирать соседние, как это делает десятилетие, здесь нечем.
 */
describe('сетка кварталов', () => {
  it('четыре ячейки, каждая — первое число своего квартала', () => {
    const cells = buildPeriodGrid({ mode: 'quarter', year: 2026 })

    expect(values(cells)).toEqual([0, 1, 2, 3])
    expect(cells.map(cell => `${cell.date.m}-${cell.date.d}`)).toEqual(['0-1', '3-1', '6-1', '9-1'])
    expect(cells.map(cell => cell.key)).toEqual(['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4'])
  })

  /** Запрет — «нет ни одного допустимого дня», а не «начало за границей». */
  it('квартал с `min` посередине выбирать можно, целиком до него — нельзя', () => {
    const cells = buildPeriodGrid({ mode: 'quarter', year: 2026, min: { y: 2026, m: 4, d: 20 } })

    expect(cells.map(cell => cell.disabled)).toEqual([true, false, false, false])
  })

  it('`max` отсекает кварталы, целиком лежащие позже', () => {
    const cells = buildPeriodGrid({ mode: 'quarter', year: 2026, max: { y: 2026, m: 6, d: 5 } })

    expect(cells.map(cell => cell.disabled)).toEqual([false, false, false, true])
  })

  it('текущий квартал считается по месяцу «сегодня»', () => {
    const cells = buildPeriodGrid({ mode: 'quarter', year: 2026, today: { y: 2026, m: 7, d: 12 } })

    expect(cells.filter(cell => cell.current).map(cell => cell.value)).toEqual([2])
  })

  it('в чужом году текущего квартала нет', () => {
    const cells = buildPeriodGrid({ mode: 'quarter', year: 2025, today: { y: 2026, m: 7, d: 12 } })

    expect(cells.some(cell => cell.current)).toBe(false)
  })
})
