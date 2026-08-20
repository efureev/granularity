import type { IsoWeekday, PlainDate } from './plainDate'
import {
  addDays,
  isoWeekday,
  isoWeekNumber,
  isPlainDateWithin,
  isSamePlainDate,
  plainDateKey,
  startOfMonth,
} from './plainDate'

/**
 * Сетка месяца — чистая функция от параметров показа.
 *
 * Собственного кэша здесь нет намеренно: функция чистая, и мемоизацию даёт
 * `computed` на стороне компонента. Хранить второй кэш рядом с реактивным
 * значило бы держать две правды об одном.
 *
 * В ячейке лежит только то, что не меняется от выбора и наведения: сама дата,
 * принадлежность месяцу, «сегодня» и запрет. Выбор, диапазон и подсветка при
 * наведении считаются на отрисовке сравнением кортежей — иначе движение мыши
 * по сетке пересобирало бы 42 объекта на каждый кадр.
 */

export interface CalendarCell {
  date: PlainDate
  /** `2026-08-12` — ключ `v-for` и дешёвое сравнение. */
  key: string
  /** Принадлежит показываемому месяцу, а не добору соседних. */
  inMonth: boolean
  today: boolean
  /** Вне `min`/`max` либо отклонён предикатом. */
  disabled: boolean
}

export interface CalendarWeek {
  /** Номер недели по ISO. */
  weekNumber: number
  days: CalendarCell[]
}

export interface CalendarGrid {
  year: number
  /** 0-based, как везде в пакете. */
  month: number
  weeks: CalendarWeek[]
  /**
   * Те же ячейки одним списком, в порядке отображения. Нужен клавиатуре:
   * `useRovingFocus` в режиме `grid` работает плоским набором и `columns`.
   * Объекты те же самые, копий нет.
   */
  cells: CalendarCell[]
}

/** Дата запрещена: список, предикат или ничего. */
export type DisabledDatesInput
  = | readonly PlainDate[]
    | ((date: PlainDate) => boolean)
    | undefined

/**
 * Быстрый предикат «запрещена ли дата».
 *
 * Список нормализуется в `Set` ключей **один раз**: обход массива на каждую из
 * 42 ячеек — это 42 × N сравнений на каждую смену месяца, и растёт он вместе
 * с числом запрещённых дат, которых у производственного календаря бывают сотни.
 */
export function createDisabledPredicate(input: DisabledDatesInput): (date: PlainDate) => boolean {
  if (!input) return () => false
  if (typeof input === 'function') return input

  const keys = new Set(input.map(plainDateKey))
  return date => keys.has(plainDateKey(date))
}

export interface BuildCalendarGridOptions {
  year: number
  /** 0-based. */
  month: number
  /** Первый день недели по ISO: 1 — понедельник, 7 — воскресенье. */
  firstDayOfWeek: IsoWeekday
  /**
   * Что считать сегодняшним днём.
   *
   * Передаётся снаружи, а не читается из часов внутри: иначе функция
   * перестала бы быть чистой, а тест — воспроизводимым без подмены таймеров.
   */
  today?: PlainDate
  min?: PlainDate
  max?: PlainDate
  isDisabled?: (date: PlainDate) => boolean
  /**
   * Сколько недель показывать. По умолчанию **6** и менять это без нужды не
   * стоит: месяц укладывается то в 5 недель, то в 6, и переменная высота
   * заставляет панель прыгать при листании — вместе со всем, что под ней.
   */
  weeks?: number
}

/** Сколько дней добора нужно слева, чтобы первое число попало в свою колонку. */
function leadingOffset(firstOfMonth: PlainDate, firstDayOfWeek: IsoWeekday): number {
  return (isoWeekday(firstOfMonth) - firstDayOfWeek + 7) % 7
}

/**
 * Начало недели, в которую попала дата.
 *
 * Первый день недели приходит снаружи, из `Intl` по локали (инвариант 2), а не
 * прибивается к понедельнику: в США неделя начинается с воскресенья, и
 * «выбранная неделя» там другая.
 */
export function startOfWeek(date: PlainDate, firstDayOfWeek: IsoWeekday): PlainDate {
  return addDays(date, -leadingOffset(date, firstDayOfWeek))
}

export function buildCalendarGrid(options: BuildCalendarGridOptions): CalendarGrid {
  const { year, month, firstDayOfWeek, today, min, max } = options
  const weekCount = options.weeks ?? 6
  const isDisabled = options.isDisabled ?? (() => false)

  const first = startOfMonth({ y: year, m: month, d: 1 })
  const start = addDays(first, -leadingOffset(first, firstDayOfWeek))

  const weeks: CalendarWeek[] = []
  const cells: CalendarCell[] = []

  for (let week = 0; week < weekCount; week += 1) {
    const rowStart = addDays(start, week * 7)
    const days: CalendarCell[] = []

    for (let column = 0; column < 7; column += 1) {
      const date = addDays(rowStart, column)
      const inMonth = date.y === year && date.m === month

      const cell: CalendarCell = {
        date,
        key: plainDateKey(date),
        inMonth,
        today: today ? isSamePlainDate(date, today) : false,
        disabled: !isPlainDateWithin(date, min, max) || isDisabled(date),
      }

      days.push(cell)
      cells.push(cell)
    }

    weeks.push({
      // Номер берётся у четверга строки: по ISO именно он задаёт неделю.
      // При старте с понедельника это ровно ISO-номер; при старте с
      // воскресенья — номер недели, которой строка принадлежит большей частью.
      weekNumber: isoWeekNumber(addDays(rowStart, 3)),
      days,
    })
  }

  return { year, month, weeks, cells }
}
