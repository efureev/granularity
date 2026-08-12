import { toPlainDate } from './chronoModel'
import type { PlainDate } from './plainDate'
import { differenceInDays, differenceInMonths } from './plainDate'

/**
 * «3 минуты назад», «через 2 дня».
 *
 * Модуль отвечает на один вопрос: какой единицей мерить разрыв между двумя
 * моментами. Саму строку строит `Intl.RelativeTimeFormat` — названия единиц,
 * склонение числительного и «вчера» вместо «1 день назад» знает платформа, и
 * держать это в словарях пакета значило бы поддерживать столько языков,
 * сколько мы успели вписать.
 *
 * Единица выбирается **в двух режимах**, и это главное решение модуля:
 *
 * - **до суток** — по прошедшему времени: секунда есть секунда, календарь тут
 *   ни при чём;
 * - **от суток** — по календарным кортежам.
 *
 * Иначе месяц считался бы как 30 суток и врал на каждом феврале, а сутки на
 * дне перевода часов (23 или 25 часов) давали бы «2 дня назад» вместо «вчера».
 */

export type RelativeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

export interface RelativeAmount {
  /** Со знаком: прошлое отрицательно, будущее положительно — как у `Intl`. */
  value: number
  unit: RelativeUnit
}

const MS_IN_SECOND = 1000
const MS_IN_MINUTE = 60 * MS_IN_SECOND
const MS_IN_HOUR = 60 * MS_IN_MINUTE
const MS_IN_DAY = 24 * MS_IN_HOUR

/** Целая часть к нулю: `-1.9` → `-1`, чтобы знак задавал направление, а не округление. */
function toward(value: number): number {
  return Math.trunc(value)
}

/**
 * Разрыв между `from` и `to` в самой крупной единице, которая набралась хотя
 * бы раз. `to` в будущем — значение положительно.
 */
export function selectRelativeAmount(from: Date, to: Date): RelativeAmount {
  const elapsed = to.getTime() - from.getTime()
  const magnitude = Math.abs(elapsed)

  if (magnitude < MS_IN_MINUTE) return { value: toward(elapsed / MS_IN_SECOND), unit: 'second' }
  if (magnitude < MS_IN_HOUR) return { value: toward(elapsed / MS_IN_MINUTE), unit: 'minute' }
  if (magnitude < MS_IN_DAY) return { value: toward(elapsed / MS_IN_HOUR), unit: 'hour' }

  return calendarAmount(toPlainDate(from), toPlainDate(to))
}

/** От суток и крупнее считают кортежи: у месяцев и лет нет длины в часах. */
function calendarAmount(from: PlainDate, to: PlainDate): RelativeAmount {
  const months = differenceInMonths(from, to)

  if (Math.abs(months) >= 12) return { value: toward(months / 12), unit: 'year' }
  if (Math.abs(months) >= 1) return { value: months, unit: 'month' }

  const days = differenceInDays(from, to)

  return Math.abs(days) >= 7
    ? { value: toward(days / 7), unit: 'week' }
    : { value: days, unit: 'day' }
}

export interface FormatRelativeTimeOptions {
  /** `'auto'` даёт «вчера» вместо «1 день назад». */
  numeric?: Intl.RelativeTimeFormatNumeric
  style?: Intl.RelativeTimeFormatStyle
}

const formats = new Map<string, Intl.RelativeTimeFormat>()

/**
 * Инстансы `Intl` кэшируются по той же причине, что и в `chronoFormat`: их
 * построение примерно на порядок дороже самого форматирования, а живая метка
 * просит строку на каждый такт.
 */
export function formatRelativeTime(
  locale: string,
  amount: RelativeAmount,
  options: FormatRelativeTimeOptions = {},
): string {
  const numeric = options.numeric ?? 'auto'
  const style = options.style ?? 'long'
  const key = `${locale} ${numeric} ${style}`

  let format = formats.get(key)
  if (!format) {
    try {
      format = new Intl.RelativeTimeFormat(locale, { numeric, style })
    }
    catch {
      // Локаль приходит из настроек приложения, и опечатка не имеет права
      // уронить рендер.
      format = new Intl.RelativeTimeFormat('en', { numeric, style })
    }

    formats.set(key, format)
  }

  return format.format(amount.value, amount.unit)
}

/** Для тестов и для смены локали приложением на лету. */
export function resetRelativeTimeCache(): void {
  formats.clear()
}
