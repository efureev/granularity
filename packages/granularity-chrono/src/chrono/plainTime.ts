/**
 * Время суток без даты и без часового пояса.
 *
 * Второй кортеж рядом с `PlainDate` и независимый от него: соединяются они
 * только на границе модели, в конструкторе `Date`. Пока время живёт отдельно,
 * перевод часов его не касается — 02:30 остаётся 02:30 и в день, когда такого
 * времени в локальной зоне не существовало.
 */

export interface PlainTime {
  /** 0..23 — всегда 24-часовое. 12-часовой вид даёт `toTwelveHour`. */
  h: number
  /** 0..59 */
  min: number
  /** 0..59 */
  s: number
}

export const SECONDS_IN_MINUTE = 60
export const SECONDS_IN_HOUR = 3600
export const SECONDS_IN_DAY = 86_400

/** До полудня или после — половина 12-часового представления. */
export type DayPeriod = 'am' | 'pm'

export function plainTime(h: number, min = 0, s = 0): PlainTime {
  return { h, min, s }
}

export function toSecondsOfDay({ h, min, s }: PlainTime): number {
  return h * SECONDS_IN_HOUR + min * SECONDS_IN_MINUTE + s
}

/**
 * Обратное преобразование с **кольцеванием**: секунды за пределами суток
 * заворачиваются, а не обрезаются. На этом стоит шаг колонок времени —
 * 23:59 плюс минута даёт 00:00, а не остаётся на месте.
 */
export function fromSecondsOfDay(seconds: number): PlainTime {
  const total = ((seconds % SECONDS_IN_DAY) + SECONDS_IN_DAY) % SECONDS_IN_DAY

  return {
    h: Math.floor(total / SECONDS_IN_HOUR),
    min: Math.floor((total % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE),
    s: total % SECONDS_IN_MINUTE,
  }
}

export function addSeconds(time: PlainTime, seconds: number): PlainTime {
  return seconds === 0 ? time : fromSecondsOfDay(toSecondsOfDay(time) + seconds)
}

export function addMinutes(time: PlainTime, minutes: number): PlainTime {
  return addSeconds(time, minutes * SECONDS_IN_MINUTE)
}

export function addHours(time: PlainTime, hours: number): PlainTime {
  return addSeconds(time, hours * SECONDS_IN_HOUR)
}

/** `-1`, `0`, `1` — лексикографически по часам, минутам, секундам. */
export function comparePlainTimes(left: PlainTime, right: PlainTime): -1 | 0 | 1 {
  const a = toSecondsOfDay(left)
  const b = toSecondsOfDay(right)
  return a === b ? 0 : a < b ? -1 : 1
}

export function isSamePlainTime(left: PlainTime, right: PlainTime): boolean {
  return comparePlainTimes(left, right) === 0
}

/**
 * Прижатие к границам — в отличие от шага, здесь кольцевания нет.
 *
 * Разница осмысленная: стрелка вверх на 23 часах обязана дать 0, а значение,
 * не попавшее в разрешённый диапазон `minTime`/`maxTime`, обязано остановиться
 * на границе, а не перепрыгнуть на другой конец суток.
 */
export function clampPlainTime(time: PlainTime, min?: PlainTime, max?: PlainTime): PlainTime {
  if (min && comparePlainTimes(time, min) < 0) return min
  if (max && comparePlainTimes(time, max) > 0) return max
  return time
}

export function isPlainTimeWithin(time: PlainTime, min?: PlainTime, max?: PlainTime): boolean {
  if (min && comparePlainTimes(time, min) < 0) return false
  if (max && comparePlainTimes(time, max) > 0) return false
  return true
}

/**
 * Округление вниз к ближайшему шагу — колонка минут с шагом 5 не должна
 * показывать 07, пришедшее из модели.
 */
export function floorToStep(time: PlainTime, stepSeconds: number): PlainTime {
  if (stepSeconds <= 1) return time

  const total = toSecondsOfDay(time)
  return fromSecondsOfDay(total - (total % stepSeconds))
}

/**
 * 24-часовое значение в 12-часовое.
 *
 * Полночь — это 12 am, а не 0 am, и полдень — 12 pm, а не 0 pm. Наивное
 * `h % 12` даёт ноль в обоих случаях и рисует «0:30 AM».
 */
export function toTwelveHour(hour: number): { hour: number, period: DayPeriod } {
  const period: DayPeriod = hour < 12 ? 'am' : 'pm'
  const twelve = hour % 12

  return { hour: twelve === 0 ? 12 : twelve, period }
}

/** Обратное к `toTwelveHour`: 12 am → 0, 12 pm → 12. */
export function fromTwelveHour(hour: number, period: DayPeriod): number {
  const base = hour % 12
  return period === 'pm' ? base + 12 : base
}
