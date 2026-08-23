export type GrStatisticFormatOptions = {
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

/**
 * Форматирует значение показателя: фиксирует точность и расставляет разделители.
 *
 * Нечисловые значения возвращаются без изменений — это позволяет показывать в
 * `GrStatistic` уже готовые строки («2 ч 15 мин», «—») без обходных пропов.
 * Вынесено из SFC отдельным модулем, чтобы тестировалось без монтирования.
 *
 * Порядок разрешения разделителей: явный проп → локаль → встроенный дефолт.
 */
export function formatStatisticValue(
  value: number | string,
  options: GrStatisticFormatOptions = {},
): string {
  const { precision, groupSeparator, decimalSeparator, locale } = options

  const numeric = typeof value === 'number' ? value : Number(value)
  if (typeof value === 'string' && (value.trim() === '' || !Number.isFinite(numeric))) {
    return value
  }
  if (!Number.isFinite(numeric))
    return String(value)

  if (locale) {
    return formatByLocale(numeric, locale, { precision, groupSeparator, decimalSeparator })
  }

  const fixed = precision === undefined ? String(numeric) : numeric.toFixed(precision)
  // `toFixed` не даёт экспоненциальной записи, а `String(число)` — может (1e21+).
  // В таком случае группировать нечего: возвращаем как есть.
  if (fixed.includes('e') || fixed.includes('E'))
    return fixed

  const negative = fixed.startsWith('-')
  const [intPart, fracPart] = (negative ? fixed.slice(1) : fixed).split('.')

  const separator = groupSeparator ?? DEFAULT_GROUP_SEPARATOR
  const grouped = separator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : intPart

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
  options: Pick<GrStatisticFormatOptions, 'precision' | 'groupSeparator' | 'decimalSeparator'>,
): string {
  const { precision, groupSeparator, decimalSeparator } = options
  // `Intl` принимает не больше 20 знаков и падает `RangeError` на большем,
  // тогда как ручная ветка через `toFixed` пережила бы до 100.
  const digits = precision === undefined ? undefined : Math.min(Math.max(precision, 0), 20)

  return new Intl.NumberFormat(locale, {
    useGrouping: true,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits ?? 20,
  })
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
