import type { IsoWeekday, PlainDate } from './plainDate'
import type { PlainTime } from './plainTime'

/**
 * Всё локале-зависимое — из `Intl`, а не из словарей пакета.
 *
 * Названия месяцев и дней недели, первый день недели, 12- или 24-часовой вид:
 * платформа знает это для всех локалей, которые знает браузер. Держать их в
 * JSON значило бы поддерживать столько языков, сколько мы успели вписать,
 * вместо всех, что умеет движок. В локали пакета остаются только строки
 * интерфейса — «Предыдущий месяц», «Сегодня».
 *
 * Инстансы `Intl` кэшируются: их построение примерно на порядок дороже самого
 * форматирования, а сетка календаря просит имена на каждую перерисовку.
 */

const CACHE_LIMIT = 64

const dateFormats = new Map<string, Intl.DateTimeFormat>()
const localeInfo = new Map<string, IsoWeekday>()
const hourCycles = new Map<string, 'h11' | 'h12' | 'h23' | 'h24'>()

function take<T>(cache: Map<string, T>, key: string, create: () => T): T {
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  const created = create()
  // Сброс целиком, а не вытеснение по одному: ключи здесь порождаются не
  // пользовательским вводом, а конечным набором опций показа, и переполнение
  // означает скорее ошибку вызывающего, чем нормальную работу.
  if (cache.size >= CACHE_LIMIT) cache.clear()
  cache.set(key, created)

  return created
}

/**
 * Локаль приходит из настроек приложения, а `Intl` бросает на некорректном
 * теге. Форматирование не имеет права уронить рендер, поэтому неизвестный тег
 * сводим к `en`.
 */
function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale} ${JSON.stringify(options)}`

  try {
    return take(dateFormats, key, () => new Intl.DateTimeFormat(locale, options))
  }
  catch {
    return take(dateFormats, `en ${JSON.stringify(options)}`, () => new Intl.DateTimeFormat('en', options))
  }
}

/** Дата, у которой известны год, месяц и день, — для запроса названий у `Intl`. */
function utcAt(year: number, month: number, day: number): Date {
  // Через `Date.UTC`, а не `new Date(y, m, d)`: локальная полночь в зоне с
  // отрицательным смещением приходится на предыдущие сутки по UTC, и `Intl`
  // назвал бы соседний день недели.
  return new Date(Date.UTC(year, month, day))
}

/**
 * Первый день недели локали по ISO: понедельник — 1, воскресенье — 7.
 *
 * `Intl.Locale#getWeekInfo` есть не везде и кое-где живёт свойством
 * `weekInfo`, поэтому оба варианта проверяются, а на отказ берётся
 * понедельник — значение ISO-8601.
 */
export function localeFirstDayOfWeek(locale: string): IsoWeekday {
  return take(localeInfo, locale, () => {
    try {
      const info = new Intl.Locale(locale) as Intl.Locale & {
        getWeekInfo?: () => { firstDay?: number }
        weekInfo?: { firstDay?: number }
      }

      const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay
      if (firstDay && firstDay >= 1 && firstDay <= 7) return firstDay as IsoWeekday
    }
    catch {
      // Некорректный тег локали — ниже вернётся понедельник.
    }

    return 1
  })
}

/** `true`, если локаль показывает время в 12-часовом виде. */
export function localeUsesTwelveHour(locale: string): boolean {
  const cycle = take(hourCycles, locale, () => {
    try {
      return new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle ?? 'h23'
    }
    catch {
      return 'h23'
    }
  })

  return cycle === 'h11' || cycle === 'h12'
}

export type NameWidth = 'long' | 'short' | 'narrow'

/** Названия месяцев в календарном порядке: индекс 0 — январь. */
export function monthNames(locale: string, width: NameWidth = 'long'): string[] {
  const format = formatter(locale, { month: width, timeZone: 'UTC' })

  // 2021 — невисокосный год без сюрпризов; для названий месяцев он безразличен.
  return Array.from({ length: 12 }, (_, month) => format.format(utcAt(2021, month, 1)))
}

/**
 * Названия дней недели **в порядке показа**, начиная с `firstDayOfWeek`.
 *
 * Порядок — часть ответа: шапка сетки обязана совпасть с её колонками, и
 * перекладывать массив на стороне компонента значит завести второе место,
 * где эта договорённость может разъехаться.
 */
export function weekdayNames(
  locale: string,
  firstDayOfWeek: IsoWeekday = 1,
  width: NameWidth = 'short',
): string[] {
  const format = formatter(locale, { weekday: width, timeZone: 'UTC' })

  // 2021-02-01 — понедельник, отсюда и отсчёт ISO-дней.
  return Array.from({ length: 7 }, (_, index) => {
    const isoDay = ((firstDayOfWeek - 1 + index) % 7) + 1
    return format.format(utcAt(2021, 1, isoDay))
  })
}

export function formatPlainDate(
  locale: string,
  date: PlainDate,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  return formatter(locale, { ...options, timeZone: 'UTC' }).format(utcAt(date.y, date.m, date.d))
}

export function formatPlainTime(
  locale: string,
  time: PlainTime,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
): string {
  const date = new Date(Date.UTC(2021, 0, 1, time.h, time.min, time.s))
  return formatter(locale, { ...options, timeZone: 'UTC' }).format(date)
}

/**
 * Подписи половин суток (`AM`/`PM`) в порядке `[до полудня, после]`.
 *
 * Через `formatToParts`, а не срезом строки: в разных локалях часть стоит и до
 * числа, и после, и пишется по-своему («дп»/«пп», «a. m.»). Локаль без
 * 12-часового вида части не отдаёт — тогда берётся английский запас, но
 * колонка периода в такой локали и не показывается.
 */
export function dayPeriodNames(locale: string): [string, string] {
  const format = formatter(locale, { hour: 'numeric', hour12: true, timeZone: 'UTC' })

  const partAt = (hour: number, fallback: string): string =>
    format.formatToParts(new Date(Date.UTC(2021, 0, 1, hour)))
      .find(part => part.type === 'dayPeriod')?.value ?? fallback

  return [partAt(9, 'AM'), partAt(21, 'PM')]
}

/** Заголовок панели: «август 2026». */
export function formatMonthTitle(locale: string, year: number, month: number): string {
  return formatter(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utcAt(year, month, 1))
}

/** Для тестов и для смены локали приложением на лету. */
export function resetChronoFormatCache(): void {
  dateFormats.clear()
  localeInfo.clear()
  hourCycles.clear()
}
