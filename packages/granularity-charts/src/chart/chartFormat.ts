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
const percentFormatters = new Map<string, Intl.NumberFormat>()
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
  percentFormatters.clear()
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

/**
 * Доля процентами.
 *
 * Знаков после запятой ровно столько, сколько нужно, чтобы доля не выглядела
 * враньём: до десятой процента у мелких долей (где «0 %» читается как «ничего»)
 * и целые у остальных. Знак процента ставит `Intl` — в русской типографике он
 * отбивается пробелом, в английской нет, и склеивать строку руками значило бы
 * выбрать одну из двух и ошибиться в другой.
 */
export function formatShare(share: number, locale: string): string {
  if (!Number.isFinite(share))
    return '—'

  const digits = share > 0 && share < 0.01 ? 1 : 0
  const key = `${locale}|${digits}`
  let formatter = percentFormatters.get(key)

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
    percentFormatters.set(key, formatter)
  }

  return formatter.format(share)
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

/**
 * Две формы подписи на каждую единицу лестницы и признак, по которому решается,
 * что контекст пора повторить.
 *
 * `group` — не про длину строки, а про то, где короткая форма перестаёт быть
 * однозначной: «03:00» одинаково для всех суток, «12 июл.» — для всех лет.
 */
const SEQUENCE_FORMATS: Record<GrTimeTickUnit, {
  short: Intl.DateTimeFormatOptions
  full: Intl.DateTimeFormatOptions
  group: 'day' | 'year' | 'none'
}> = {
  second: {
    short: { minute: '2-digit', second: '2-digit' },
    full: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' },
    group: 'day',
  },
  minute: {
    short: { hour: '2-digit', minute: '2-digit' },
    full: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
    group: 'day',
  },
  hour: {
    short: { hour: '2-digit', minute: '2-digit' },
    full: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
    group: 'day',
  },
  day: {
    short: { day: 'numeric', month: 'short' },
    full: { day: 'numeric', month: 'short', year: 'numeric' },
    group: 'year',
  },
  week: {
    short: { day: 'numeric', month: 'short' },
    full: { day: 'numeric', month: 'short', year: 'numeric' },
    group: 'year',
  },
  month: {
    short: { month: 'short' },
    full: { month: 'short', year: 'numeric' },
    group: 'year',
  },
  year: {
    short: { year: 'numeric' },
    full: { year: 'numeric' },
    group: 'none',
  },
}

function groupKey(value: number, group: 'day' | 'year' | 'none'): string {
  if (group === 'none')
    return ''

  const date = new Date(value)

  return group === 'year'
    ? String(date.getFullYear())
    : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/**
 * Ряд подписей времени: контекст на первой и при его смене, дальше коротко.
 *
 * Почасовой ряд за сутки печатал бы «12 июл. 2026 г., 03:00» двадцать четыре
 * раза — дату читатель узнаёт из первой строки, а дальше она мешает сравнивать
 * значения. Но и уронить её везде нельзя: на переходе через полночь «00:00»
 * без даты становится неотличимо от вчерашнего.
 *
 * Правило поэтому не «коротко всегда», а «коротко, пока однозначно»: полная
 * форма возвращается на первой строке и на каждой смене суток (или года — для
 * дневной и месячной лестницы).
 *
 * Только для **видимой** таблицы. Скрытая обязана оставаться самодостаточной
 * построчно: скринридер читает строку вне соседей, и «03:00» в ней не значит
 * ничего.
 */
export function formatTimeSequence(
  values: readonly number[],
  unit: GrTimeTickUnit,
  locale: string,
): string[] {
  const format = SEQUENCE_FORMATS[unit]
  let previous: string | null = null

  return values.map((value) => {
    const key = groupKey(value, format.group)
    const withContext = previous === null || key !== previous

    previous = key

    return dateFormatter(locale, withContext ? format.full : format.short).format(new Date(value))
  })
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
