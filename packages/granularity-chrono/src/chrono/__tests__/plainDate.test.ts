import { describe, expect, it } from 'vitest'

import type { PlainDate } from '../plainDate'
import {
  addDays,
  addMonths,
  addYears,
  clampPlainDate,
  comparePlainDates,
  daysInMonth,
  differenceInDays,
  endOfMonth,
  fromEpochDay,
  isLeapYear,
  isoWeekday,
  isoWeekNumber,
  isPlainDateWithin,
  isSameMonth,
  isSamePlainDate,
  plainDate,
  startOfMonth,
  toEpochDay,
} from '../plainDate'

/** `{ y: 2026, m: 7, d: 12 }` из строки — читаемость ожиданий важнее краткости кода. */
function iso(value: string): PlainDate {
  const [y, m, d] = value.split('-').map(Number) as [number, number, number]
  return { y, m: m - 1, d }
}

function fmt(date: PlainDate): string {
  return `${date.y}-${String(date.m + 1).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
}

describe('високосность и длина месяца', () => {
  it.each([
    [2024, true],
    [2023, false],
    [2000, true],
    [1900, false],
    [2100, false],
  ])('%i — високосный: %s', (year, expected) => {
    expect(isLeapYear(year)).toBe(expected)
  })

  it('февраль знает про високосный год, остальные месяцы постоянны', () => {
    expect(daysInMonth(2024, 1)).toBe(29)
    expect(daysInMonth(2023, 1)).toBe(28)
    expect(daysInMonth(2023, 0)).toBe(31)
    expect(daysInMonth(2023, 3)).toBe(30)
    expect(daysInMonth(2023, 11)).toBe(31)
  })
})

describe('номер дня эпохи', () => {
  it.each([
    ['1970-01-01', 0],
    ['1970-01-02', 1],
    ['1969-12-31', -1],
    ['2000-03-01', 11017],
    ['2026-08-12', 20677],
  ])('%s ↔ %i', (value, epochDay) => {
    expect(toEpochDay(iso(value))).toBe(epochDay)
    expect(fmt(fromEpochDay(epochDay))).toBe(value)
  })

  it('преобразование обратимо на длинном отрезке, включая даты до эпохи', () => {
    for (let day = -40_000; day <= 40_000; day += 137)
      expect(toEpochDay(fromEpochDay(day))).toBe(day)
  })
})

describe('день недели', () => {
  it.each([
    ['1970-01-01', 4], // четверг — точка отсчёта эпохи
    ['2026-08-12', 3], // среда
    ['2026-08-16', 7], // воскресенье — 7, а не 0
    ['2026-08-17', 1], // понедельник — 1
    // Даты до эпохи: `%` в JS сохраняет знак делимого, и без второго остатка
    // ответ уходит в минус. Обе даты подобраны так, чтобы промежуточный
    // остаток был отрицательным — на `1969-12-29` он равен нулю, и проверка
    // прошла бы даже со сломанной формулой.
    ['1969-12-25', 4], // четверг
    ['1965-03-03', 3], // среда
  ])('%s → %i по ISO', (value, weekday) => {
    expect(isoWeekday(iso(value))).toBe(weekday)
  })
})

describe('номер недели по ISO', () => {
  it.each([
    ['2026-01-01', 1], // четверг — сам задаёт первую неделю года
    ['2027-01-01', 53], // пятница: неделя принадлежит ещё 2026-му
    ['2026-12-28', 53], // понедельник последней недели 2026-го
    ['2021-01-01', 53], // пятница: неделя 2020-го
    ['2024-12-30', 1], // понедельник, чей четверг уже в 2025-м
    ['2023-01-01', 52], // воскресенье: неделя 2022-го
  ])('%s → %i', (value, week) => {
    // Все шесть дат — границы года: именно там правило «неделю задаёт её
    // четверг» отличается от наивного счёта недель от 1 января.
    expect(isoWeekNumber(iso(value))).toBe(week)
  })

  it('в середине года номер растёт по одному на неделю', () => {
    expect(isoWeekNumber(iso('2026-08-12'))).toBe(33)
    expect(isoWeekNumber(iso('2026-08-19'))).toBe(34)
  })
})

describe('сдвиг на дни', () => {
  it('переходит через границу месяца и года', () => {
    expect(fmt(addDays(iso('2026-01-31'), 1))).toBe('2026-02-01')
    expect(fmt(addDays(iso('2026-12-31'), 1))).toBe('2027-01-01')
    expect(fmt(addDays(iso('2026-03-01'), -1))).toBe('2026-02-28')
    expect(fmt(addDays(iso('2027-01-01'), -1))).toBe('2026-12-31')
  })

  it('знает про 29 февраля', () => {
    expect(fmt(addDays(iso('2024-02-28'), 1))).toBe('2024-02-29')
    expect(fmt(addDays(iso('2023-02-28'), 1))).toBe('2023-03-01')
  })

  it('большой сдвиг считается за один шаг, а не циклом по месяцам', () => {
    expect(fmt(addDays(iso('2026-01-01'), 10_000))).toBe('2053-05-19')
    expect(fmt(addDays(iso('2026-01-01'), -10_000))).toBe('1998-08-16')
  })

  it('нулевой сдвиг возвращает тот же объект', () => {
    const date = iso('2026-08-12')
    expect(addDays(date, 0)).toBe(date)
  })

  it('разность дат симметрична сдвигу', () => {
    const from = iso('2026-01-31')
    const to = iso('2026-03-01')

    expect(differenceInDays(from, to)).toBe(29)
    expect(fmt(addDays(from, differenceInDays(from, to)))).toBe(fmt(to))
    expect(differenceInDays(to, from)).toBe(-29)
  })
})

/**
 * Главная причина, по которой модуль вообще написан.
 *
 * Прогон идёт в `America/New_York` (см. `src/__tests__/setup.ts`): 1 ноября
 * 2026 года часы переводят назад, и локальные сутки длятся 25 часов.
 */
describe('перевод часов', () => {
  it('арифметика по Date теряет день на осеннем переводе — наша нет', () => {
    const naive = new Date(new Date(2026, 10, 1).getTime() + 86_400_000)

    // «Плюс 86 400 000 мс» не сдвинуло дату: 25-часовые сутки не кончились.
    expect(naive.getDate()).toBe(1)
    expect(naive.getHours()).toBe(23)

    expect(fmt(addDays(iso('2026-11-01'), 1))).toBe('2026-11-02')
  })

  it('на весеннем переводе время уезжает вперёд — на календарной дате это не сказывается', () => {
    const naive = new Date(new Date(2026, 2, 8).getTime() + 86_400_000)

    expect(naive.getHours()).toBe(1) // было 00:00, стало 01:00

    expect(fmt(addDays(iso('2026-03-08'), 1))).toBe('2026-03-09')
  })

  it('неделя через обе границы перевода остаётся неделей', () => {
    expect(fmt(addDays(iso('2026-03-05'), 7))).toBe('2026-03-12')
    expect(fmt(addDays(iso('2026-10-29'), 7))).toBe('2026-11-05')
  })
})

describe('сдвиг на месяцы и годы', () => {
  it('день прижимается к длине целевого месяца', () => {
    // Иначе 31 января + месяц дало бы 3 марта, и кнопка «вперёд» перескочила
    // бы февраль целиком.
    expect(fmt(addMonths(iso('2026-01-31'), 1))).toBe('2026-02-28')
    expect(fmt(addMonths(iso('2024-01-31'), 1))).toBe('2024-02-29')
    expect(fmt(addMonths(iso('2026-03-31'), 1))).toBe('2026-04-30')
  })

  it('переходит через границу года в обе стороны', () => {
    expect(fmt(addMonths(iso('2026-12-15'), 1))).toBe('2027-01-15')
    expect(fmt(addMonths(iso('2026-01-15'), -1))).toBe('2025-12-15')
    expect(fmt(addMonths(iso('2026-05-15'), -17))).toBe('2024-12-15')
  })

  it('29 февраля плюс год — 28-е', () => {
    expect(fmt(addYears(iso('2024-02-29'), 1))).toBe('2025-02-28')
    expect(fmt(addYears(iso('2024-02-29'), 4))).toBe('2028-02-29')
  })

  it('прижатие необратимо, и это ожидаемо', () => {
    // Туда-обратно не возвращает исходное: 31 января → 28 февраля → 28 января.
    const there = addMonths(iso('2026-01-31'), 1)
    expect(fmt(addMonths(there, -1))).toBe('2026-01-28')
  })
})

describe('края месяца', () => {
  it('начало и конец, включая февраль високосного года', () => {
    expect(fmt(startOfMonth(iso('2026-08-12')))).toBe('2026-08-01')
    expect(fmt(endOfMonth(iso('2026-08-12')))).toBe('2026-08-31')
    expect(fmt(endOfMonth(iso('2024-02-10')))).toBe('2024-02-29')
    expect(fmt(endOfMonth(iso('2023-02-10')))).toBe('2023-02-28')
  })
})

describe('сравнение и границы', () => {
  it('сравнение лексикографично по году, месяцу, дню', () => {
    expect(comparePlainDates(iso('2026-01-01'), iso('2026-01-02'))).toBe(-1)
    expect(comparePlainDates(iso('2026-02-01'), iso('2026-01-31'))).toBe(1)
    expect(comparePlainDates(iso('2027-01-01'), iso('2026-12-31'))).toBe(1)
    expect(comparePlainDates(iso('2026-08-12'), iso('2026-08-12'))).toBe(0)
  })

  it('равенство даты и равенство месяца — разные вопросы', () => {
    expect(isSamePlainDate(iso('2026-08-12'), plainDate(2026, 7, 12))).toBe(true)
    expect(isSamePlainDate(iso('2026-08-12'), iso('2026-08-13'))).toBe(false)
    expect(isSameMonth(iso('2026-08-01'), iso('2026-08-31'))).toBe(true)
    expect(isSameMonth(iso('2026-08-31'), iso('2026-09-01'))).toBe(false)
  })

  it('границы диапазона включительны, незаданная граница не ограничивает', () => {
    const min = iso('2026-08-10')
    const max = iso('2026-08-20')

    expect(isPlainDateWithin(iso('2026-08-10'), min, max)).toBe(true)
    expect(isPlainDateWithin(iso('2026-08-20'), min, max)).toBe(true)
    expect(isPlainDateWithin(iso('2026-08-09'), min, max)).toBe(false)
    expect(isPlainDateWithin(iso('2026-08-21'), min, max)).toBe(false)
    expect(isPlainDateWithin(iso('1900-01-01'), undefined, max)).toBe(true)
    expect(isPlainDateWithin(iso('2200-01-01'), min, undefined)).toBe(true)
  })

  it('клампинг возвращает саму границу, а не соседний день', () => {
    const min = iso('2026-08-10')
    const max = iso('2026-08-20')

    expect(fmt(clampPlainDate(iso('2026-08-01'), min, max))).toBe('2026-08-10')
    expect(fmt(clampPlainDate(iso('2026-08-31'), min, max))).toBe('2026-08-20')
    expect(fmt(clampPlainDate(iso('2026-08-15'), min, max))).toBe('2026-08-15')
  })
})
