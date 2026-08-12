import { dayPeriodNames } from './chronoFormat'
import type { PlainDate } from './plainDate'
import { daysInMonth } from './plainDate'
import type { PlainTime } from './plainTime'
import { fromTwelveHour } from './plainTime'

/**
 * Разбор того, что человек набрал руками.
 *
 * Порядок частей и разделитель берутся у `Intl`, а не из строки-паттерна: в
 * `en-US` это `08/12/2026`, в `ru` — `12.08.2026`, и знать это наизусть пакет
 * не обязан. Отсюда же следует, что разбор **не** привязан к конкретным
 * разделителям: пользователь набирает цифры, а чем он их разделил — точкой,
 * слэшем или пробелом — дело десятое.
 *
 * Всё, что не разобралось, возвращается как `null`. Бросать исключение на
 * каждый промежуточный ввод («1», «12.») нельзя: пока человек печатает, текст
 * почти всегда неполон.
 */

export type DateUnit = 'day' | 'month' | 'year'

export interface LocaleDateOrder {
  /** Части в порядке показа. */
  order: [DateUnit, DateUnit, DateUnit]
  /** Разделитель, которым локаль их соединяет. */
  separator: string
}

const orders = new Map<string, LocaleDateOrder>()

const DEFAULT_ORDER: LocaleDateOrder = { order: ['day', 'month', 'year'], separator: '.' }

/** Порядок частей даты в локали: `08/12/2026` против `12.08.2026`. */
export function localeDateOrder(locale: string): LocaleDateOrder {
  const cached = orders.get(locale)
  if (cached) return cached

  let result = DEFAULT_ORDER

  try {
    const parts = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).formatToParts(new Date(Date.UTC(2026, 7, 12)))

    const order = parts
      .filter((part): part is Intl.DateTimeFormatPart & { type: DateUnit } =>
        part.type === 'day' || part.type === 'month' || part.type === 'year')
      .map(part => part.type)

    const separator = parts.find(part => part.type === 'literal')?.value.trim() || ' '

    if (order.length === 3) result = { order: order as [DateUnit, DateUnit, DateUnit], separator }
  }
  catch {
    // Некорректный тег локали — остаётся значение по умолчанию.
  }

  orders.set(locale, result)

  return result
}

/** Группы цифр в порядке появления: `12.08.26` → `['12', '08', '26']`. */
function digitGroups(text: string): string[] {
  return text.match(/\d+/g) ?? []
}

/**
 * Двузначный год: 69 — это 2069, 70 — 1970.
 *
 * Граница взята из POSIX и из того же места, откуда её берут браузеры: это не
 * «правильное» значение, а общепринятое, и своё придумывать здесь нечего.
 */
function expandYear(value: number, digits: number): number {
  if (digits > 2) return value

  return value < 70 ? 2000 + value : 1900 + value
}

/**
 * Дата из текста по правилам локали. `null` — не разобралось: неполный ввод,
 * лишние части или несуществующая дата вроде 31 февраля.
 */
export function parseLocaleDate(locale: string, text: string): PlainDate | null {
  const groups = digitGroups(text)
  if (groups.length !== 3) return null

  const { order } = localeDateOrder(locale)
  const values: Partial<Record<DateUnit, number>> = {}
  const lengths: Partial<Record<DateUnit, number>> = {}

  order.forEach((unit, index) => {
    const group = groups[index] as string
    values[unit] = Number(group)
    lengths[unit] = group.length
  })

  const year = expandYear(values.year as number, lengths.year as number)
  const month = (values.month as number) - 1
  const day = values.day as number

  if (!Number.isFinite(year) || year < 1 || month < 0 || month > 11) return null
  if (day < 1 || day > daysInMonth(year, month)) return null

  return { y: year, m: month, d: day }
}

/**
 * Достроить набранное до вида локали: `12082026` → `12.08.2026`.
 *
 * Маска работает только по цифрам и только вперёд: она добавляет разделители,
 * но ничего не переставляет и не дописывает. Стереть последний символ обязано
 * стирать именно его, а не превращаться в бесконечную борьбу с автодополнением.
 */
export function maskLocaleDate(locale: string, text: string): string {
  const { order, separator } = localeDateOrder(locale)
  const digits = text.replace(/\D/g, '')
  if (!digits) return ''

  const sizes = order.map(unit => (unit === 'year' ? 4 : 2))
  const chunks: string[] = []
  let offset = 0

  for (const size of sizes) {
    if (offset >= digits.length) break

    chunks.push(digits.slice(offset, offset + size))
    offset += size
  }

  const masked = chunks.join(separator)

  // Хвостовой разделитель дорисовывается, только когда часть набрана целиком:
  // иначе он появлялся бы на первой же цифре и мешал стирать.
  const complete = chunks.length < sizes.length && (chunks.at(-1)?.length === sizes[chunks.length - 1])

  return complete ? `${masked}${separator}` : masked
}

/** Подсказка формата для плейсхолдера: `DD.MM.YYYY` буквами локали. */
export function localeDatePattern(locale: string, letters: Record<DateUnit, string>): string {
  const { order, separator } = localeDateOrder(locale)

  return order.map(unit => letters[unit].repeat(unit === 'year' ? 4 : 2)).join(separator)
}

/**
 * Время из текста: `9:30`, `09:30:45`, `3:30 PM`.
 *
 * Половина суток распознаётся по подписям локали — тем же, что показывает
 * колонка периода, — и по латинским `am`/`pm`: их набирают и в локалях, где
 * подписи свои.
 */
export function parseLocaleTime(locale: string, text: string): PlainTime | null {
  const groups = digitGroups(text)
  if (groups.length < 2 || groups.length > 3) return null

  const [hourText, minuteText, secondText] = groups as [string, string, string?]
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const second = secondText === undefined ? 0 : Number(secondText)

  if (minute > 59 || second > 59) return null

  const [am, pm] = dayPeriodNames(locale)
  const lower = text.toLowerCase()
  const hasPm = lower.includes(pm.toLowerCase()) || /\bpm\b/.test(lower)
  const hasAm = lower.includes(am.toLowerCase()) || /\bam\b/.test(lower)

  if (hasAm || hasPm) {
    if (hour < 1 || hour > 12) return null

    return { h: fromTwelveHour(hour, hasPm ? 'pm' : 'am'), min: minute, s: second }
  }

  if (hour > 23) return null

  return { h: hour, min: minute, s: second }
}

/** Для тестов и для смены локали приложением на лету. */
export function resetChronoParseCache(): void {
  orders.clear()
}
