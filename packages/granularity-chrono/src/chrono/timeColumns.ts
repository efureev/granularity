import type { DayPeriod, PlainTime } from './plainTime'
import { comparePlainTimes, fromTwelveHour, plainTime, toTwelveHour } from './plainTime'

/**
 * Колонки времени — чистая функция от значения и ограничений.
 *
 * Отдельным модулем по той же причине, что и сетка месяца: ошибка здесь
 * проявляется не исключением, а недоступным значением или лишним на границе
 * `min`/`max`, и ловится только тестом.
 *
 * Запрет считается «есть ли хоть одно допустимое время с такой единицей»:
 * час 9 остаётся выбираемым при `min = 09:30`, потому что 09:30 в него
 * попадает, а вот минуты до 30 в этом часе — уже нет. Проверять единицу по
 * текущему значению остальных было бы неверно: пользователь выбирает их в
 * произвольном порядке.
 */

export type TimeUnit = 'hour' | 'minute' | 'second' | 'period'

export interface TimeOption {
  /** Час (0..23 либо 1..12), минута, секунда или период (0 — am, 1 — pm). */
  value: number
  label: string
  /** Ключ `v-for` и основа DOM-id опции. */
  key: string
  disabled: boolean
}

export interface TimeColumn {
  unit: TimeUnit
  options: TimeOption[]
  /** Индекс выбранной опции; `-1`, когда значения нет. */
  selectedIndex: number
}

export interface BuildTimeColumnsOptions {
  /** Текущее время. `null` — ничего не выбрано, выбор ни одной колонки не подсвечен. */
  value: PlainTime | null
  min?: PlainTime
  max?: PlainTime
  /** Шаг минут в минутах (1 — все 60 значений). */
  minuteStep?: number
  /** Шаг секунд в секундах. */
  secondStep?: number
  enableSeconds?: boolean
  twelveHour?: boolean
  /** Подписи периода (`AM`/`PM`) — из локали, а не из словаря пакета. */
  periodLabels?: readonly [string, string]
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Хотя бы одно время в отрезке попадает в границы. */
function rangeAllowed(from: PlainTime, to: PlainTime, min?: PlainTime, max?: PlainTime): boolean {
  if (min && comparePlainTimes(to, min) < 0) return false
  if (max && comparePlainTimes(from, max) > 0) return false

  return true
}

function step(value: number | undefined, fallback = 1): number {
  return value && value > 0 && Number.isFinite(value) ? Math.floor(value) : fallback
}

function hourColumn(options: BuildTimeColumnsOptions): TimeColumn {
  const twelve = options.twelveHour ?? false
  const period: DayPeriod = options.value && options.value.h >= 12 ? 'pm' : 'am'

  const hours = twelve
    ? Array.from({ length: 12 }, (_, index) => index + 1)
    : Array.from({ length: 24 }, (_, index) => index)

  const items = hours.map((hour) => {
    // В 12-часовом виде час колонки зависит от периода: «3» — это 03 или 15.
    const actual = twelve ? fromTwelveHour(hour, period) : hour

    return {
      value: hour,
      label: pad(hour),
      key: `hour-${hour}`,
      disabled: !rangeAllowed(plainTime(actual, 0, 0), plainTime(actual, 59, 59), options.min, options.max),
    }
  })

  const selectedHour = options.value
    ? (twelve ? toTwelveHour(options.value.h).hour : options.value.h)
    : undefined

  return {
    unit: 'hour',
    options: items,
    selectedIndex: selectedHour === undefined ? -1 : items.findIndex(item => item.value === selectedHour),
  }
}

function minuteColumn(options: BuildTimeColumnsOptions): TimeColumn {
  const size = step(options.minuteStep)
  const hour = options.value?.h ?? 0
  const items: TimeOption[] = []

  for (let minute = 0; minute < 60; minute += size) {
    items.push({
      value: minute,
      label: pad(minute),
      key: `minute-${minute}`,
      disabled: !rangeAllowed(plainTime(hour, minute, 0), plainTime(hour, minute, 59), options.min, options.max),
    })
  }

  const selected = options.value?.min
  return {
    unit: 'minute',
    options: items,
    selectedIndex: selected === undefined ? -1 : items.findIndex(item => item.value === selected),
  }
}

function secondColumn(options: BuildTimeColumnsOptions): TimeColumn {
  const size = step(options.secondStep)
  const hour = options.value?.h ?? 0
  const minute = options.value?.min ?? 0
  const items: TimeOption[] = []

  for (let second = 0; second < 60; second += size) {
    const time = plainTime(hour, minute, second)
    items.push({
      value: second,
      label: pad(second),
      key: `second-${second}`,
      disabled: !rangeAllowed(time, time, options.min, options.max),
    })
  }

  const selected = options.value?.s
  return {
    unit: 'second',
    options: items,
    selectedIndex: selected === undefined ? -1 : items.findIndex(item => item.value === selected),
  }
}

function periodColumn(options: BuildTimeColumnsOptions): TimeColumn {
  const [am, pm] = options.periodLabels ?? ['AM', 'PM']

  const items: TimeOption[] = [
    {
      value: 0,
      label: am,
      key: 'period-am',
      disabled: !rangeAllowed(plainTime(0, 0, 0), plainTime(11, 59, 59), options.min, options.max),
    },
    {
      value: 1,
      label: pm,
      key: 'period-pm',
      disabled: !rangeAllowed(plainTime(12, 0, 0), plainTime(23, 59, 59), options.min, options.max),
    },
  ]

  return {
    unit: 'period',
    options: items,
    selectedIndex: options.value ? (options.value.h >= 12 ? 1 : 0) : -1,
  }
}

/** Колонки в порядке показа: часы, минуты, секунды, период. */
export function buildTimeColumns(options: BuildTimeColumnsOptions): TimeColumn[] {
  const columns = [hourColumn(options), minuteColumn(options)]

  if (options.enableSeconds) columns.push(secondColumn(options))
  if (options.twelveHour) columns.push(periodColumn(options))

  return columns
}

/**
 * Применить выбор в колонке к времени.
 *
 * Час 12-часовой колонки переводится в 24-часовой по текущему периоду, смена
 * периода двигает час на 12 — обе операции обязаны идти через одну функцию,
 * иначе «3 PM» и переключение на AM разъедутся.
 */
export function applyTimeUnit(
  value: PlainTime,
  unit: TimeUnit,
  next: number,
  twelveHour = false,
): PlainTime {
  switch (unit) {
    case 'hour':
      return twelveHour
        ? { ...value, h: fromTwelveHour(next, value.h >= 12 ? 'pm' : 'am') }
        : { ...value, h: next }
    case 'minute':
      return { ...value, min: next }
    case 'second':
      return { ...value, s: next }
    case 'period':
      return { ...value, h: fromTwelveHour(toTwelveHour(value.h).hour, next === 1 ? 'pm' : 'am') }
  }
}
