import { describe, expect, it, vi } from 'vitest'

import type { PlainDate } from '../plainDate'
import { plainDateKey } from '../plainDate'
import { buildCalendarGrid, createDisabledPredicate } from '../calendarGrid'

function iso(value: string): PlainDate {
  const [y, m, d] = value.split('-').map(Number) as [number, number, number]
  return { y, m: m - 1, d }
}

/** Август 2026: 1-е — суббота, 31 день. */
function august2026(overrides: Partial<Parameters<typeof buildCalendarGrid>[0]> = {}) {
  return buildCalendarGrid({ year: 2026, month: 7, firstDayOfWeek: 1, ...overrides })
}

describe('форма сетки', () => {
  it('всегда шесть недель по семь дней', () => {
    // Высота панели обязана быть постоянной: месяц укладывается то в пять
    // недель, то в шесть, и переменная высота заставляет всё под панелью
    // прыгать при листании.
    for (const [year, month] of [[2026, 1], [2026, 7], [2024, 1], [2026, 10]] as const) {
      const grid = buildCalendarGrid({ year, month, firstDayOfWeek: 1 })

      expect(grid.weeks, `${year}-${month + 1}`).toHaveLength(6)
      expect(grid.weeks.every(week => week.days.length === 7)).toBe(true)
      expect(grid.cells).toHaveLength(42)
    }
  })

  it('плоский список — те же объекты, что и в строках, без копий', () => {
    const grid = august2026()

    expect(grid.cells[0]).toBe(grid.weeks[0]!.days[0])
    expect(grid.cells[41]).toBe(grid.weeks[5]!.days[6])
  })

  it('дни идут подряд без пропусков и повторов', () => {
    const keys = august2026().cells.map(cell => cell.key)

    expect(new Set(keys).size).toBe(42)
    expect(keys[0]).toBe('2026-07-27')
    expect(keys[41]).toBe('2026-09-06')
  })

  it('все дни месяца попали в сетку ровно по разу', () => {
    const grid = august2026()
    const inMonth = grid.cells.filter(cell => cell.inMonth).map(cell => cell.date.d)

    expect(inMonth).toEqual(Array.from({ length: 31 }, (_, index) => index + 1))
  })
})

describe('первый день недели', () => {
  it('с понедельника 1 августа 2026 (суббота) встаёт в шестую колонку', () => {
    const grid = august2026({ firstDayOfWeek: 1 })

    expect(grid.weeks[0]!.days.map(cell => cell.key)).toEqual([
      '2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30',
      '2026-07-31', '2026-08-01', '2026-08-02',
    ])
  })

  it('с воскресенья добор слева на день короче', () => {
    const grid = august2026({ firstDayOfWeek: 7 })

    expect(grid.weeks[0]!.days[0]!.key).toBe('2026-07-26')
    expect(grid.weeks[0]!.days.at(-1)!.key).toBe('2026-08-01')
  })

  it('месяц, начинающийся с первого дня недели, добора не получает', () => {
    // Июнь 2026 начинается в понедельник.
    const grid = buildCalendarGrid({ year: 2026, month: 5, firstDayOfWeek: 1 })

    expect(grid.cells[0]!.key).toBe('2026-06-01')
    expect(grid.cells[0]!.inMonth).toBe(true)
  })
})

describe('флаги ячейки', () => {
  it('добор соседних месяцев помечен', () => {
    const grid = august2026()

    expect(grid.cells[0]!.inMonth).toBe(false)
    expect(grid.cells[5]!.inMonth).toBe(true)
    expect(grid.cells[41]!.inMonth).toBe(false)
  })

  it('«сегодня» приходит снаружи и не читается из часов', () => {
    // Иначе функция перестала бы быть чистой, а тест — воспроизводимым.
    const grid = august2026({ today: iso('2026-08-12') })
    const marked = grid.cells.filter(cell => cell.today)

    expect(marked).toHaveLength(1)
    expect(marked[0]!.key).toBe('2026-08-12')
  })

  it('без «сегодня» не помечен никто', () => {
    expect(august2026().cells.some(cell => cell.today)).toBe(false)
  })

  it('min и max запрещают всё за границами, сами границы разрешены', () => {
    const grid = august2026({ min: iso('2026-08-10'), max: iso('2026-08-20') })
    const allowed = grid.cells.filter(cell => !cell.disabled).map(cell => cell.key)

    expect(allowed[0]).toBe('2026-08-10')
    expect(allowed.at(-1)).toBe('2026-08-20')
    expect(allowed).toHaveLength(11)
  })

  it('предикат складывается с границами, а не заменяет их', () => {
    const grid = august2026({
      min: iso('2026-08-10'),
      isDisabled: date => date.d % 2 === 0,
    })

    expect(grid.cells.find(cell => cell.key === '2026-08-09')!.disabled).toBe(true) // вне min
    expect(grid.cells.find(cell => cell.key === '2026-08-12')!.disabled).toBe(true) // чётное
    expect(grid.cells.find(cell => cell.key === '2026-08-13')!.disabled).toBe(false)
  })
})

describe('номера недель', () => {
  it('идут подряд', () => {
    const numbers = august2026().weeks.map(week => week.weekNumber)

    expect(numbers).toEqual([31, 32, 33, 34, 35, 36])
  })

  it('со старта с воскресенья номер берётся у четверга строки, а не у её первого дня', () => {
    // Строка 26 июля — 1 августа начинается в воскресенье, которое по ISO
    // принадлежит ещё 30-й неделе, а сама строка — 31-й. Нумерация по первому
    // дню строки дала бы здесь на единицу меньше во всех шести строках, и
    // проверить это можно только на старте, отличном от понедельника.
    const numbers = august2026({ firstDayOfWeek: 7 }).weeks.map(week => week.weekNumber)

    expect(numbers).toEqual([31, 32, 33, 34, 35, 36])
  })

  it('на границе года не сбрасываются в единицу раньше времени', () => {
    // Декабрь 2026: последние дни года по ISO принадлежат 53-й неделе, а
    // 28 декабря начинается уже первая неделя 2027-го.
    const numbers = buildCalendarGrid({ year: 2026, month: 11, firstDayOfWeek: 1 })
      .weeks.map(week => week.weekNumber)

    expect(numbers).toEqual([49, 50, 51, 52, 53, 1])
  })
})

describe('предикат запрещённых дат', () => {
  it('список нормализуется в Set один раз, а не обходится на каждую ячейку', () => {
    const dates = [iso('2026-08-12'), iso('2026-08-13')]
    const has = vi.spyOn(Set.prototype, 'has')

    const predicate = createDisabledPredicate(dates)
    for (const cell of august2026().cells) predicate(cell.date)

    // 42 обращения к Set — по одному на ячейку; массив не обходится вовсе.
    expect(has).toHaveBeenCalledTimes(42)
    has.mockRestore()
  })

  it('список и предикат дают одинаковый ответ', () => {
    const fromList = createDisabledPredicate([iso('2026-08-12')])
    const fromFn = createDisabledPredicate(date => plainDateKey(date) === '2026-08-12')

    expect(fromList(iso('2026-08-12'))).toBe(true)
    expect(fromFn(iso('2026-08-12'))).toBe(true)
    expect(fromList(iso('2026-08-13'))).toBe(false)
    expect(fromFn(iso('2026-08-13'))).toBe(false)
  })

  it('пусто — ничего не запрещено', () => {
    expect(createDisabledPredicate(undefined)(iso('2026-08-12'))).toBe(false)
    expect(createDisabledPredicate([])(iso('2026-08-12'))).toBe(false)
  })
})

describe('стоимость пересборки', () => {
  it('предикат запрета спрашивают ровно 42 раза — по разу на ячейку', () => {
    // Если флаги считать в шаблоне, а не в сетке, это станет 42 × число
    // перерисовок: наведение мыши на диапазоне даст сотни вызовов в секунду.
    const isDisabled = vi.fn(() => false)

    august2026({ isDisabled })

    expect(isDisabled).toHaveBeenCalledTimes(42)
  })
})
