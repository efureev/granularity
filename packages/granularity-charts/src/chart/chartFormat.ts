import type { GrTimeTickUnit } from './chartTicks'

/**
 * Форматирование чисел и подписей времени.
 *
 * Числовая ветка — перенос `formatStatisticValue` из ядра (`GrStatistic`), а не
 * импорт: импорт из `@feugene/granularity/components/*` создаёт ребро графа
 * компонентов, которое `granular doctor --strict` требует объявить, а
 * объявление притащило бы потребителю графика весь safelist и CSS `GrStatistic`
 * ради шестидесяти строк арифметики. Совпадение с оригиналом стережёт тест —
 * молча разойтись копия не сможет.
 */

export interface GrChartNumberFormat {
  /** Число знаков после запятой. `undefined` — оставить как есть. */
  precision?: number
  /** Разделитель групп разрядов. Сильнее локали. */
  groupSeparator?: string
  /** Десятичный разделитель. Сильнее локали. */
  decimalSeparator?: string
  /** BCP-47 локаль: разделители берутся из `Intl.NumberFormat`. */
  locale?: string
}

const DEFAULT_GROUP_SEPARATOR = ' '
const DEFAULT_DECIMAL_SEPARATOR = '.'

const numberFormatters = new Map<string, Intl.NumberFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

/**
 * Форматтеры кэшируются: подпись пересчитывается на каждое движение указателя,
 * а создание `Intl.NumberFormat` — заметно дороже самого форматирования.
 */
function numberFormatter(locale: string, digits: number | undefined): Intl.NumberFormat {
  const key = `${locale}|${digits ?? ''}`
  const cached = numberFormatters.get(key)

  if (cached)
    return cached

  const formatter = new Intl.NumberFormat(locale, {
    useGrouping: true,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits ?? 20,
  })

  numberFormatters.set(key, formatter)

  return formatter
}

function dateFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  const cached = dateFormatters.get(key)

  if (cached)
    return cached

  const formatter = new Intl.DateTimeFormat(locale, options)

  dateFormatters.set(key, formatter)

  return formatter
}

/** Сброс кэша — для тестов и смены локали приложением на лету. */
export function resetChartFormatCache(): void {
  numberFormatters.clear()
  dateFormatters.clear()
}

export function formatNumber(value: number, options: GrChartNumberFormat = {}): string {
  const { precision, groupSeparator, decimalSeparator, locale } = options

  if (!Number.isFinite(value))
    return String(value)

  if (locale)
    return formatByLocale(value, locale, { precision, groupSeparator, decimalSeparator })

  const fixed = precision === undefined ? String(value) : value.toFixed(precision)

  // `toFixed` не даёт экспоненциальной записи, а `String(число)` — может (1e21+).
  // В таком случае группировать нечего: возвращаем как есть.
  if (fixed.includes('e') || fixed.includes('E'))
    return fixed

  const negative = fixed.startsWith('-')
  const [intPart, fracPart] = (negative ? fixed.slice(1) : fixed).split('.')
  const separator = groupSeparator ?? DEFAULT_GROUP_SEPARATOR
  const grouped = separator
    ? intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : intPart!

  return [
    negative ? '-' : '',
    grouped,
    fracPart ? `${decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR}${fracPart}` : '',
  ].join('')
}

/**
 * `formatToParts` вместо `format`: даёт заменить отдельные разделители, оставив
 * остальные правила локали (индийская группировка, знак минуса, порядок частей).
 */
function formatByLocale(
  value: number,
  locale: string,
  options: Pick<GrChartNumberFormat, 'precision' | 'groupSeparator' | 'decimalSeparator'>,
): string {
  const { precision, groupSeparator, decimalSeparator } = options
  // `Intl` принимает не больше 20 знаков и падает `RangeError` на большем.
  const digits = precision === undefined ? undefined : Math.min(Math.max(precision, 0), 20)

  return numberFormatter(locale, digits)
    .formatToParts(value)
    .map((part) => {
      if (part.type === 'group' && groupSeparator !== undefined)
        return groupSeparator
      if (part.type === 'decimal' && decimalSeparator !== undefined)
        return decimalSeparator

      return part.value
    })
    .join('')
}

/** Значение точки для подписи: пропуск читается словом, а не пустотой. */
export function formatValue(
  value: number | null,
  options: GrChartNumberFormat = {},
  noValueText = '—',
): string {
  return value === null || !Number.isFinite(value) ? noValueText : formatNumber(value, options)
}

const TICK_FORMATS: Record<GrTimeTickUnit, Intl.DateTimeFormatOptions> = {
  second: { minute: '2-digit', second: '2-digit' },
  minute: { hour: '2-digit', minute: '2-digit' },
  hour: { hour: '2-digit', minute: '2-digit' },
  day: { day: 'numeric', month: 'short' },
  week: { day: 'numeric', month: 'short' },
  month: { month: 'short', year: 'numeric' },
  year: { year: 'numeric' },
}

/**
 * Подпись деления оси времени.
 *
 * Формат выбирается по единице лестницы, а не по значению: иначе соседние
 * деления одного шага печатались бы по-разному, и ось читалась бы как набор
 * случайных дат. Названия месяцев берёт `Intl` — держать их в словаре значило бы
 * поддерживать столько языков, сколько мы успели вписать.
 */
export function formatTimeTick(value: number, unit: GrTimeTickUnit, locale: string): string {
  return dateFormatter(locale, TICK_FORMATS[unit]).format(new Date(value))
}

/** Полная подпись момента — для тултипа и скрытой таблицы, где контекст нужен весь. */
export function formatTimeValue(value: number, locale: string): string {
  return dateFormatter(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
