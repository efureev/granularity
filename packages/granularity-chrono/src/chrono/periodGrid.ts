import type { PlainDate } from './plainDate'
import { comparePlainDates, daysInMonth } from './plainDate'

/**
 * Сетки месяцев, кварталов и лет — та же чистая функция, что и сетка дней.
 *
 * Все решают одно и то же: какое значение стоит за ячейкой и попадает ли оно в
 * границы. Запрет считается «есть ли в периоде хоть один допустимый день»:
 * месяц с `min` посередине выбирать можно, месяц целиком до него — нельзя.
 *
 * Ячеек двенадцать у месяцев и лет и четыре у кварталов: год делится на них
 * ровно, и добирать соседние, как это делает десятилетие, здесь нечем.
 */

export type PeriodMode = 'month' | 'quarter' | 'year'

export interface PeriodCell {
  /** Дата, которую отдаст выбор ячейки: первое число месяца или года. */
  date: PlainDate
  /** Ключ `v-for` и адрес ячейки для roving-фокуса. */
  key: string
  /** Номер месяца (0..11) либо год — то, что показывается в ячейке. */
  value: number
  /** Период, в который попадает «сегодня». */
  current: boolean
  disabled: boolean
}

export interface BuildPeriodGridOptions {
  mode: PeriodMode
  /** Показываемый год: сам по себе в режиме месяцев, начало десятилетия — в режиме лет. */
  year: number
  min?: PlainDate
  max?: PlainDate
  today?: PlainDate
}

/** Первый и последний день периода — по ним считается пересечение с границами. */
function periodBounds(mode: PeriodMode, year: number, value: number): [PlainDate, PlainDate] {
  if (mode === 'month') {
    return [{ y: year, m: value, d: 1 }, { y: year, m: value, d: daysInMonth(year, value) }]
  }

  if (mode === 'quarter') {
    const first = value * 3
    const last = first + 2

    return [{ y: year, m: first, d: 1 }, { y: year, m: last, d: daysInMonth(year, last) }]
  }

  return [{ y: value, m: 0, d: 1 }, { y: value, m: 11, d: 31 }]
}

function isAllowed(from: PlainDate, to: PlainDate, min?: PlainDate, max?: PlainDate): boolean {
  if (min && comparePlainDates(to, min) < 0)
    return false
  if (max && comparePlainDates(from, max) > 0)
    return false

  return true
}

function keyOf(mode: PeriodMode, year: number, value: number): string {
  if (mode === 'month')
    return `${year}-${String(value + 1).padStart(2, '0')}`
  if (mode === 'quarter')
    return `${year}-Q${value + 1}`

  return String(value)
}

function isCurrent(mode: PeriodMode, year: number, value: number, today: PlainDate): boolean {
  if (mode === 'month')
    return today.y === year && today.m === value
  if (mode === 'quarter')
    return today.y === year && Math.floor(today.m / 3) === value

  return today.y === value
}

/**
 * Десятилетие показывается двенадцатью ячейками: десять своих лет плюс по
 * одному соседнему с каждой стороны — так же, как сетка дней добирает соседние
 * месяцы, и ровно затем же: чтобы край не выглядел обрывом.
 */
export function decadeStart(year: number): number {
  return Math.floor(year / 10) * 10
}

export function buildPeriodGrid(options: BuildPeriodGridOptions): PeriodCell[] {
  const { mode, year, min, max, today } = options

  const values = mode === 'year'
    ? Array.from({ length: 12 }, (_, index) => decadeStart(year) - 1 + index)
    : Array.from({ length: mode === 'quarter' ? 4 : 12 }, (_, index) => index)

  return values.map((value) => {
    const [from, to] = periodBounds(mode, year, value)

    return {
      date: from,
      key: keyOf(mode, year, value),
      value,
      current: today ? isCurrent(mode, year, value, today) : false,
      disabled: !isAllowed(from, to, min, max),
    }
  })
}

/** Подпись десятилетия: «2020 — 2029», без добора соседних лет. */
export function decadeLabel(year: number, separator = ' — '): string {
  const start = decadeStart(year)

  return `${start}${separator}${start + 9}`
}
