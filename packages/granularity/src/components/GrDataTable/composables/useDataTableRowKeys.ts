import type { GrDataTableRowKey } from '../GrDataTable.vue'

/**
 * Ключ строки: значение из данных, а при его отсутствии — синтетический.
 *
 * Без синтетического строка получила бы `String(undefined ?? '')` — **один и
 * тот же** ключ на всю таблицу: Vue переиспользовал бы DOM не по назначению, а
 * выбор одной строки помечал бы выбранными все. Ключ привязан к идентичности
 * объекта, поэтому переживает сортировку и не зависит от индекса.
 */
export interface UseDataTableRowKeysOptions<TRow extends Record<string, unknown>> {
  rowKey: () => GrDataTableRowKey<TRow>
}

export interface DataTableRowKeys<TRow extends Record<string, unknown>> {
  rowKeyValue: (row: TRow) => string | number
}

export function useDataTableRowKeys<TRow extends Record<string, unknown>>(
  options: UseDataTableRowKeysOptions<TRow>,
): DataTableRowKeys<TRow> {
  const syntheticKeys = new WeakMap<object, string>()
  let syntheticKeyCounter = 0
  // Предупреждение одно на таблицу: строк без ключа обычно весь набор, и на
  // каждую пришлось бы по записи в консоли.
  let missingKeyWarned = false

  function syntheticRowKey(row: TRow): string {
    const existing = syntheticKeys.get(row)
    if (existing !== undefined)
      return existing

    syntheticKeyCounter += 1
    const generated = `gr-row-${syntheticKeyCounter}`
    syntheticKeys.set(row, generated)

    if (!missingKeyWarned && __GR_DEV__) {
      missingKeyWarned = true
      console.warn(
        `[GrDataTable] У строки нет значения по ключу "${String(options.rowKey())}". `
        + 'Задайте `rowKey` (поле или функцию) — иначе выбор строк и переиспользование '
        + 'DOM работают по синтетическому ключу, который не переживёт перезагрузку данных.',
      )
    }

    return generated
  }

  function rowKeyValue(row: TRow): string | number {
    const rk = options.rowKey()
    if (typeof rk === 'function')
      return rk(row)

    const value = (row as Record<string, unknown>)[rk as string]
    if (typeof value === 'string' && value !== '')
      return value
    if (typeof value === 'number')
      return value

    return syntheticRowKey(row)
  }

  return { rowKeyValue }
}
