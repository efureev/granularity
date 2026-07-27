export type GrStatisticFormatOptions = {
  /** Число знаков после запятой. `undefined` — оставить как есть. */
  precision?: number
  /** Разделитель групп разрядов. */
  groupSeparator?: string
  /** Десятичный разделитель. */
  decimalSeparator?: string
}

/**
 * Форматирует значение показателя: фиксирует точность и расставляет разделители.
 *
 * Нечисловые значения возвращаются без изменений — это позволяет показывать в
 * `GrStatistic` уже готовые строки («2 ч 15 мин», «—») без обходных пропов.
 * Вынесено из SFC отдельным модулем, чтобы тестировалось без монтирования.
 */
export function formatStatisticValue(
  value: number | string,
  options: GrStatisticFormatOptions = {},
): string {
  const { precision, groupSeparator = ' ', decimalSeparator = '.' } = options

  const numeric = typeof value === 'number' ? value : Number(value)
  if (typeof value === 'string' && (value.trim() === '' || !Number.isFinite(numeric))) {
    return value
  }
  if (!Number.isFinite(numeric)) return String(value)

  const fixed = precision === undefined ? String(numeric) : numeric.toFixed(precision)
  // `toFixed` не даёт экспоненциальной записи, а `String(число)` — может (1e21+).
  // В таком случае группировать нечего: возвращаем как есть.
  if (fixed.includes('e') || fixed.includes('E')) return fixed

  const negative = fixed.startsWith('-')
  const [intPart, fracPart] = (negative ? fixed.slice(1) : fixed).split('.')

  const grouped = groupSeparator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator)
    : intPart

  return [
    negative ? '-' : '',
    grouped,
    fracPart ? `${decimalSeparator}${fracPart}` : '',
  ].join('')
}
