/**
 * Календарная дата без времени и без часового пояса.
 *
 * Вся арифметика пакета живёт здесь и не обращается к `Date` ни разу. Причина
 * не в чистоте: `Date` считает в миллисекундах, а в день перехода на летнее
 * время сутки не равны 24 часам, и «плюс неделя» уезжает на час, а на границе
 * месяца в некоторых зонах — на день. Ошибка не бросает исключение — сетка
 * просто рисуется не той, и ловится это лишь тестом на конкретную дату в
 * конкретной зоне.
 *
 * Модуль ничего не знает ни про Vue, ни про DOM: значения на входе, значения
 * на выходе. Отсюда же дешёвые тесты — без монтирования.
 */

/**
 * Год, месяц, день. Месяц **0-based** — как в `Date` и в `Intl`, чтобы на
 * границе с платформой не появлялось ±1, которое обязательно однажды забудут.
 */
export interface PlainDate {
  y: number
  /** 0 — январь, 11 — декабрь. */
  m: number
  /** 1..31 */
  d: number
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const

/** Дни недели по ISO-8601: понедельник — 1, воскресенье — 7. Как `Intl.Locale#getWeekInfo`. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/** Длина месяца с учётом високосного года. */
export function daysInMonth(year: number, month: number): number {
  if (month === 1) return isLeapYear(year) ? 29 : 28
  return DAYS_IN_MONTH[month] ?? 30
}

export function plainDate(y: number, m: number, d: number): PlainDate {
  return { y, m, d }
}

/**
 * Ключ вида `2026-08-12` — для `v-for`, для `Set` запрещённых дат и для
 * сравнения без обхода полей. Не для показа: пользовательский формат даёт
 * `Intl` в `chronoFormat`.
 */
export function plainDateKey({ y, m, d }: PlainDate): string {
  return `${String(y).padStart(4, '0')}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/**
 * Номер недели по ISO-8601.
 *
 * Номер задаёт четверг недели — это и есть правило ISO: неделя принадлежит
 * тому году, в котором лежит её четверг. Наивное «сколько недель прошло с
 * 1 января» ошибается на границе года ровно там, где это заметнее всего.
 */
export function isoWeekNumber(date: PlainDate): number {
  const thursday = addDays(date, 4 - isoWeekday(date))
  const januaryFirst: PlainDate = { y: thursday.y, m: 0, d: 1 }

  return Math.floor(differenceInDays(januaryFirst, thursday) / 7) + 1
}

/**
 * Номер дня от эпохи (1970-01-01 → 0) — алгоритм Говарда Хиннанта.
 *
 * Одно преобразование закрывает сразу три задачи: сдвиг на дни, разность дат и
 * день недели. Альтернатива — циклы по месяцам — работает, но на большом
 * сдвиге вырождается в тысячи итераций, а на отрицательном легко теряет
 * граничный день.
 */
export function toEpochDay({ y, m, d }: PlainDate): number {
  const month = m + 1
  const year = month <= 2 ? y - 1 : y
  const era = Math.floor(year / 400)
  const yearOfEra = year - era * 400
  const dayOfYear = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + d - 1
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear

  return era * 146097 + dayOfEra - 719468
}

export function fromEpochDay(epochDay: number): PlainDate {
  const z = epochDay + 719468
  const era = Math.floor(z / 146097)
  const dayOfEra = z - era * 146097
  const yearOfEra = Math.floor(
    (dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365,
  )
  const year = yearOfEra + era * 400
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100))
  const mp = Math.floor((5 * dayOfYear + 2) / 153)
  const d = dayOfYear - Math.floor((153 * mp + 2) / 5) + 1
  const month = mp + (mp < 10 ? 3 : -9)

  return { y: month <= 2 ? year + 1 : year, m: month - 1, d }
}

/**
 * День недели по ISO: понедельник — 1, воскресенье — 7.
 *
 * Считается из номера дня эпохи: 1970-01-01 был четвергом, отсюда сдвиг на 3.
 * Двойной остаток — из-за дат до 1970: `%` в JS сохраняет знак делимого.
 */
export function isoWeekday(date: PlainDate): IsoWeekday {
  return ((((toEpochDay(date) + 3) % 7) + 7) % 7 + 1) as IsoWeekday
}

export function addDays(date: PlainDate, days: number): PlainDate {
  return days === 0 ? date : fromEpochDay(toEpochDay(date) + days)
}

/** Разность в днях: `to - from`. */
export function differenceInDays(from: PlainDate, to: PlainDate): number {
  return toEpochDay(to) - toEpochDay(from)
}

/**
 * Сдвиг на месяцы через абсолютный индекс `y * 12 + m`.
 *
 * День **прижимается** к длине целевого месяца: 31 января плюс месяц — это
 * 28 (или 29) февраля. Иначе получилось бы 3 марта, а листание календаря
 * кнопкой «вперёд» перескакивало бы месяц.
 */
export function addMonths(date: PlainDate, months: number): PlainDate {
  if (months === 0) return date

  const index = date.y * 12 + date.m + months
  const y = Math.floor(index / 12)
  const m = ((index % 12) + 12) % 12

  return { y, m, d: Math.min(date.d, daysInMonth(y, m)) }
}

/** То же прижатие дня, что и у `addMonths`: 29 февраля плюс год — 28-е. */
export function addYears(date: PlainDate, years: number): PlainDate {
  return addMonths(date, years * 12)
}

export function startOfMonth(date: PlainDate): PlainDate {
  return { y: date.y, m: date.m, d: 1 }
}

export function endOfMonth(date: PlainDate): PlainDate {
  return { y: date.y, m: date.m, d: daysInMonth(date.y, date.m) }
}

/** `-1`, `0`, `1` — лексикографически по году, месяцу, дню. */
export function comparePlainDates(left: PlainDate, right: PlainDate): -1 | 0 | 1 {
  if (left.y !== right.y) return left.y < right.y ? -1 : 1
  if (left.m !== right.m) return left.m < right.m ? -1 : 1
  if (left.d !== right.d) return left.d < right.d ? -1 : 1
  return 0
}

export function isSamePlainDate(left: PlainDate, right: PlainDate): boolean {
  return comparePlainDates(left, right) === 0
}

export function isSameMonth(left: PlainDate, right: PlainDate): boolean {
  return left.y === right.y && left.m === right.m
}

/** Границы включительно; `undefined` — граница не задана. */
export function isPlainDateWithin(
  date: PlainDate,
  min?: PlainDate,
  max?: PlainDate,
): boolean {
  if (min && comparePlainDates(date, min) < 0) return false
  if (max && comparePlainDates(date, max) > 0) return false
  return true
}

export function clampPlainDate(date: PlainDate, min?: PlainDate, max?: PlainDate): PlainDate {
  if (min && comparePlainDates(date, min) < 0) return min
  if (max && comparePlainDates(date, max) > 0) return max
  return date
}
