/**
 * Сравнение значений ячеек для сортировки `GrDataTable`.
 *
 * Логика вынесена из SFC: у неё есть крайние случаи, которые дешевле проверить
 * прямым вызовом, чем через монтирование таблицы.
 *
 * Прежняя реализация приводила значение к числу через `Number(value)`, а он
 * считает нулём и `null`, и пустую строку: пустые ячейки оседали в середине
 * числового ряда, между отрицательными и положительными. Здесь пустое значение —
 * отдельная категория, и она всегда в конце, независимо от направления.
 */

export type GrDataTableSortDir = 'asc' | 'desc'

/** Пустое значение ячейки: нечего сравнивать, место таким — в конце списка. */
export function isEmptyCell(value: unknown): boolean {
  if (value === null || value === undefined)
    return true

  return typeof value === 'string' && value.trim() === ''
}

/**
 * Число, с которым имеет смысл сравнивать: сам `number`, числовая строка, `Date`
 * (по таймстампу), `boolean` (`false` < `true`). Иначе — `null`, и сравнение
 * уходит в строковую ветку.
 */
function toComparableNumber(value: unknown): number | null {
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : null

  if (typeof value === 'boolean')
    return value ? 1 : 0

  if (typeof value === 'bigint')
    return Number(value)

  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isNaN(time) ? null : time
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '')
      return null

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

/**
 * Сравнивает два значения ячейки. Возвращает готовую разницу с учётом `dir` —
 * кроме пустых значений: они всегда в конце, иначе «пустые» в `desc` уезжали бы
 * наверх и таблица выглядела бы сломанной.
 */
export function compareCells(
  a: unknown,
  b: unknown,
  dir: GrDataTableSortDir,
  locale?: string,
): number {
  const aEmpty = isEmptyCell(a)
  const bEmpty = isEmptyCell(b)
  if (aEmpty || bEmpty)
    return aEmpty && bEmpty ? 0 : (aEmpty ? 1 : -1)

  const aNum = toComparableNumber(a)
  const bNum = toComparableNumber(b)

  const result = aNum !== null && bNum !== null
    ? aNum - bNum
    : String(a).localeCompare(String(b), locale, { sensitivity: 'base', numeric: true })

  return dir === 'asc' ? result : -result
}

/**
 * Новый отсортированный массив. Исходный не мутируется: `rows` приходят пропом,
 * сортировка на месте меняла бы данные потребителя.
 */
export function sortRows<TRow extends Record<string, unknown>>(
  rows: readonly TRow[],
  key: string,
  dir: GrDataTableSortDir,
  locale?: string,
): TRow[] {
  return [...rows].sort((a, b) => compareCells(a[key], b[key], dir, locale))
}
