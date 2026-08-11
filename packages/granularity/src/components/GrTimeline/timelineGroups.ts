/**
 * Группировка ленты событий. Без Vue — чтобы проверялась без монтирования.
 */

export type GrTimelineGroupBy<T> = string | ((item: T, index: number) => string)

/** Пункт вместе с его позицией в исходном наборе: ключи `v-for` считаются от неё. */
export interface GrTimelineEntry<T> {
  item: T
  index: number
}

export interface GrTimelineGroup<T> {
  /** Ключ группы. Пустая строка — заголовка у группы нет. */
  key: string
  entries: GrTimelineEntry<T>[]
}

function keyOf<T>(item: T, index: number, groupBy: GrTimelineGroupBy<T>): string {
  if (typeof groupBy === 'function')
    return String(groupBy(item, index) ?? '')

  const value = (item as Record<string, unknown> | null | undefined)?.[groupBy]

  // `undefined` в поле — это «группы нет», а не группа с надписью «undefined».
  return value == null ? '' : String(value)
}

/**
 * Режет набор на группы, **не меняя порядок**: лента хронологична, и
 * пересортировать её компонент не вправе. Порядок групп — порядок первого
 * вхождения ключа; разорванная группа (`A B A`) собирается в одну.
 *
 * Без `groupBy` — одна безымянная группа: плоская лента остаётся частным
 * случаем, и второй ветки рендера у компонента не появляется.
 */
export function groupTimelineItems<T>(
  items: readonly T[],
  groupBy?: GrTimelineGroupBy<T>,
): GrTimelineGroup<T>[] {
  const entries = items.map((item, index) => ({ item, index }))

  if (groupBy === undefined)
    return entries.length === 0 ? [] : [{ key: '', entries }]

  const byKey = new Map<string, GrTimelineGroup<T>>()

  for (const entry of entries) {
    const key = keyOf(entry.item, entry.index, groupBy)
    const group = byKey.get(key)

    if (group)
      group.entries.push(entry)
    else
      byKey.set(key, { key, entries: [entry] })
  }

  return [...byKey.values()]
}
