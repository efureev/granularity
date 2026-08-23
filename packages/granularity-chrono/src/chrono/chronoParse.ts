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
  if (cached)
    return cached

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

    if (order.length === 3)
      result = { order: order as [DateUnit, DateUnit, DateUnit], separator }
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
  if (digits > 2)
    return value

  return value < 70 ? 2000 + value : 1900 + value
}

/**
 * Дата из текста по правилам локали. `null` — не разобралось: неполный ввод,
 * лишние части или несуществующая дата вроде 31 февраля.
 */
export function parseLocaleDate(locale: string, text: string): PlainDate | null {
  const groups = digitGroups(text)
  if (groups.length !== 3)
    return null

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

  if (!Number.isFinite(year) || year < 1 || month < 0 || month > 11)
    return null
  if (day < 1 || day > daysInMonth(year, month))
    return null

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
  if (!digits)
    return ''

  const sizes = order.map(unit => (unit === 'year' ? 4 : 2))
  const chunks: string[] = []
  let offset = 0

  for (const size of sizes) {
    if (offset >= digits.length)
      break

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
  if (groups.length < 2 || groups.length > 3)
    return null

  const [hourText, minuteText, secondText] = groups as [string, string, string?]
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const second = secondText === undefined ? 0 : Number(secondText)

  if (minute > 59 || second > 59)
    return null

  const [am, pm] = dayPeriodNames(locale)
  const lower = text.toLowerCase()
  const hasPm = lower.includes(pm.toLowerCase()) || /\bpm\b/.test(lower)
  const hasAm = lower.includes(am.toLowerCase()) || /\bam\b/.test(lower)

  if (hasAm || hasPm) {
    if (hour < 1 || hour > 12)
      return null

    return { h: fromTwelveHour(hour, hasPm ? 'pm' : 'am'), min: minute, s: second }
  }

  if (hour > 23)
    return null

  return { h: hour, min: minute, s: second }
}

export type TimeUnit = 'hour' | 'minute' | 'second'

export interface LocaleDateTimeOrder {
  /** Время идёт перед датой: `vi` показывает `15:30 12/8/26`. */
  timeFirst: boolean
  /** Половина суток стоит перед часом: `ko` показывает `오후 3:30`. */
  dayPeriodFirst: boolean
  /** Чем локаль разделяет часы и минуты: `15:30` против `15.30`. */
  timeSeparator: string
}

const dateTimeOrders = new Map<string, LocaleDateTimeOrder>()

const DEFAULT_DATE_TIME_ORDER: LocaleDateTimeOrder = {
  timeFirst: false,
  dayPeriodFirst: false,
  timeSeparator: ':',
}

/** Взаимное расположение частей в локали — то, чего не выведешь из строки. */
export function localeDateTimeOrder(locale: string): LocaleDateTimeOrder {
  const cached = dateTimeOrders.get(locale)
  if (cached)
    return cached

  let result = DEFAULT_DATE_TIME_ORDER

  try {
    const parts = new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).formatToParts(new Date(Date.UTC(2026, 7, 12, 15, 30)))

    const at = (...types: string[]): number => parts.findIndex(part => types.includes(part.type))
    const date = at('day', 'month', 'year')
    const hour = at('hour')
    const dayPeriod = at('dayPeriod')
    const separator = parts.find((part, index) => part.type === 'literal' && index > hour)?.value.trim()

    if (date >= 0 && hour >= 0) {
      result = {
        timeFirst: hour < date,
        dayPeriodFirst: dayPeriod >= 0 && dayPeriod < hour,
        timeSeparator: separator || ':',
      }
    }
  }
  catch {
    // Некорректный тег локали — остаётся значение по умолчанию.
  }

  dateTimeOrders.set(locale, result)

  return result
}

/** Группы цифр вместе с положением: резать придётся текст, а не числа. */
function digitMatches(text: string): RegExpExecArray[] {
  return [...text.matchAll(/\d+/g)] as RegExpExecArray[]
}

/**
 * Разрез между группами цифр `count` и `count + 1`.
 *
 * Буквы в промежутке — это половина суток (`PM`, `오후`), и уехать она обязана к
 * своим цифрам: в одних локалях она стоит после часа, в других перед ним.
 * Отсюда же следует, что сам разделитель частей опознавать не нужно — ни тире,
 * ни запятую, ни слово: в `en-CA` дата пишется через дефис (`2026-08-12`), и
 * список разделителей развалился бы на первой же локали.
 */
function cutBetweenGroups(
  locale: string,
  text: string,
  groups: RegExpExecArray[],
  count: number,
): [string, string] {
  const before = groups[count - 1] as RegExpExecArray
  const after = groups[count] as RegExpExecArray
  const gapStart = before.index + before[0].length
  const gap = text.slice(gapStart, after.index)
  const letters = /\p{L}+/u.exec(gap)

  if (!letters)
    return [text.slice(0, gapStart), text.slice(gapStart)]

  const cut = gapStart + letters.index + (localeDateTimeOrder(locale).dayPeriodFirst ? 0 : letters[0].length)

  return [text.slice(0, cut), text.slice(cut)]
}

export interface PlainDateTimeParts {
  date: PlainDate
  /** `null` — в строке набрана одна дата. */
  time: PlainTime | null
}

/**
 * Дата и время из одной строки: `12.08.2026, 14:30`, `8/12/2026, 3:30 PM`.
 *
 * Три группы цифр — только дата, пять или шесть — дата и время. Какая половина
 * строки чья, говорит `Intl`, а не порядок слагаемых: `vi` ставит время первым.
 */
export function parseLocaleDateTime(locale: string, text: string): PlainDateTimeParts | null {
  const groups = digitMatches(text)

  if (groups.length === 3) {
    const date = parseLocaleDate(locale, text)

    return date ? { date, time: null } : null
  }

  if (groups.length < 5 || groups.length > 6)
    return null

  const { timeFirst } = localeDateTimeOrder(locale)
  const [head, tail] = cutBetweenGroups(locale, text, groups, timeFirst ? groups.length - 3 : 3)
  const date = parseLocaleDate(locale, timeFirst ? tail : head)
  const time = parseLocaleTime(locale, timeFirst ? head : tail)

  return date && time ? { date, time } : null
}

/**
 * Строка диапазона на две границы. `null` — цифр не поровну, то есть границы
 * описаны по-разному и делить нечего.
 */
export function splitLocaleRange(locale: string, text: string): [string, string] | null {
  const groups = digitMatches(text)
  if (groups.length < 2 || groups.length % 2 !== 0)
    return null

  return cutBetweenGroups(locale, text, groups, groups.length / 2)
}

/** То, что уже набрано: части, которых в строке ещё нет, отсутствуют. */
export interface PartialPlainTime {
  h?: number
  min?: number
  s?: number
}

/**
 * Время из недобранной строки: `18` — это уже час, `18:4` — час и четыре минуты.
 *
 * Нужно панели, а не модели: пока человек печатает, колонки обязаны
 * подсвечивать набранное, иначе набор идёт вслепую. Наружу такое значение не
 * уходит — за это отвечает `parseLocaleTime`, который неполноту не прощает.
 */
export function parsePartialLocaleTime(locale: string, text: string): PartialPlainTime | null {
  const groups = digitGroups(text)
  if (groups.length === 0 || groups.length > 3)
    return null

  const [am, pm] = dayPeriodNames(locale)
  const lower = text.toLowerCase()
  const hasPm = lower.includes(pm.toLowerCase()) || /\bpm\b/.test(lower)
  const hasAm = lower.includes(am.toLowerCase()) || /\bam\b/.test(lower)
  const [hourText, minuteText, secondText] = groups as [string, string?, string?]

  const hour = Number(hourText)
  const result: PartialPlainTime = {}

  if (hasAm || hasPm) {
    if (hour < 1 || hour > 12)
      return null
    result.h = fromTwelveHour(hour, hasPm ? 'pm' : 'am')
  }
  else {
    if (hour > 23)
      return null
    result.h = hour
  }

  if (minuteText !== undefined) {
    const minute = Number(minuteText)
    if (minute > 59)
      return null
    result.min = minute
  }

  if (secondText !== undefined) {
    const second = Number(secondText)
    if (second > 59)
      return null
    result.s = second
  }

  return result
}

export interface PartialDateTimeParts {
  /** Дата — только целиком: по двум третям её не показать. */
  date: PlainDate | null
  time: PartialPlainTime | null
}

/**
 * Что из набранного уже можно показать в панели.
 *
 * Сколько групп цифр приходится на время, знает не строка, а компонент: с
 * секундами их три, без — две. По одному тексту это неотличимо, пока время не
 * набрано целиком, а подсвечивать надо раньше.
 */
export function parsePartialLocaleDateTime(
  locale: string,
  text: string,
  options: { seconds?: boolean } = {},
): PartialDateTimeParts {
  const empty: PartialDateTimeParts = { date: null, time: null }
  const groups = digitMatches(text)
  if (groups.length === 0)
    return empty

  const { timeFirst } = localeDateTimeOrder(locale)
  const timeCount = options.seconds ? 3 : 2
  const split = timeFirst ? timeCount : 3

  // Обе части — подстроки, а не числа: подпись половины суток живёт в тексте.
  const [head, tail] = groups.length > split
    ? cutBetweenGroups(locale, text, groups, split)
    : [text, '']

  const dateText = timeFirst ? tail : head
  const timeText = timeFirst ? head : tail

  return {
    date: parseLocaleDate(locale, dateText),
    time: timeText.trim() ? parsePartialLocaleTime(locale, timeText) : null,
  }
}

/**
 * Вид значения, который разбор понимает обратно.
 *
 * Редактируемое поле обязано показывать то же, что принимает. `Aug 12, 2026`
 * читается человеком лучше, но правка `12` на `14` прямо в поле оставит две
 * группы цифр вместо трёх — разбор откажет, и набранное молча откатится.
 * Поэтому поле с `editable` переходит на цифры, если формат не задан снаружи.
 */
export const EDITABLE_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

/** Парная времени: часы и минуты двумя цифрами, секунды по запросу. */
export function editableTimeFormat(
  options: { seconds?: boolean, twelveHour?: boolean } = {},
): Intl.DateTimeFormatOptions {
  return {
    hour: '2-digit',
    minute: '2-digit',
    ...(options.seconds ? { second: '2-digit' } : {}),
    hour12: options.twelveHour,
  }
}

/** Подсказка формата времени: `HH:mm` буквами и разделителем локали. */
export function localeTimePattern(
  locale: string,
  letters: Record<TimeUnit, string>,
  options: { seconds?: boolean, twelveHour?: boolean } = {},
): string {
  const { timeSeparator, dayPeriodFirst } = localeDateTimeOrder(locale)
  const units: TimeUnit[] = options.seconds ? ['hour', 'minute', 'second'] : ['hour', 'minute']
  const clock = units.map(unit => letters[unit].repeat(2)).join(timeSeparator)

  if (!options.twelveHour)
    return clock

  const [am] = dayPeriodNames(locale)

  return dayPeriodFirst ? `${am} ${clock}` : `${clock} ${am}`
}

/** Для тестов и для смены локали приложением на лету. */
export function resetChronoParseCache(): void {
  orders.clear()
  dateTimeOrders.clear()
}
