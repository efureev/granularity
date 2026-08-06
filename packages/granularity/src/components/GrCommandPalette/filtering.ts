/** Команда палитры. `id` обязателен — он же ключ рендера и цель `aria-activedescendant`. */
export type GrCommandItem = {
  id: string
  label: string
  /** Пояснение под меткой. */
  description?: string
  /** UnoCSS-класс иконки (например `i-lucide-file-plus`). */
  icon?: string
  /** Подсказка сочетания клавиш — массив клавиш, каждая рисуется отдельным `GrKbd`. */
  shortcut?: string[]
  /** Заголовок группы, под которой команда показывается в списке. */
  group?: string
  /** Дополнительные слова для поиска (синонимы, транслитерация). */
  keywords?: string[]
  disabled?: boolean
}

/** Команды, сгруппированные для рендера: порядок групп — порядок первого вхождения. */
export type GrCommandGroup = {
  /** `undefined` — команды без группы (рендерятся без заголовка). */
  name: string | undefined
  items: GrCommandItem[]
}

export type GrCommandFilter = (item: GrCommandItem, query: string) => boolean

/**
 * Матчер по умолчанию: подстрока (без учёта регистра) в метке, описании,
 * названии группы или ключевых словах.
 */
export function matchCommandItem(item: GrCommandItem, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  const haystack = [item.label, item.description, item.group, ...(item.keywords ?? [])]
  return haystack.some(part => part?.toLowerCase().includes(needle))
}

export function filterCommandItems(
  items: GrCommandItem[],
  query: string,
  filter: GrCommandFilter = matchCommandItem,
): GrCommandItem[] {
  if (!query.trim()) return items
  return items.filter(item => filter(item, query))
}

/**
 * Раскладывает плоский список по группам, сохраняя порядок первого появления
 * группы. Команды без `group` собираются в единственную безымянную группу,
 * которая остаётся на своём месте в общем порядке.
 */
export function groupCommandItems(items: GrCommandItem[]): GrCommandGroup[] {
  const groups: GrCommandGroup[] = []
  const byName = new Map<string | undefined, GrCommandGroup>()

  for (const item of items) {
    const name = item.group || undefined
    let group = byName.get(name)
    if (!group) {
      group = { name, items: [] }
      byName.set(name, group)
      groups.push(group)
    }
    group.items.push(item)
  }

  return groups
}

/** Кусок текста для подсветки: `match` — попал в запрос. */
export type GrCommandMatchSegment = {
  text: string
  match: boolean
}

/**
 * Режет текст на сегменты по вхождению запроса (без учёта регистра).
 *
 * Совпадения нет — один сегмент целиком: свой `filter` вправе матчить по
 * `keywords`, и тогда в метке подсвечивать нечего. Регистр исходного текста
 * сохраняется — подсветка не должна менять то, что читает пользователь.
 */
export function splitCommandMatch(text: string, query: string): GrCommandMatchSegment[] {
  const needle = query.trim().toLowerCase()
  if (!needle || !text) return [{ text, match: false }]

  const segments: GrCommandMatchSegment[] = []
  const haystack = text.toLowerCase()
  let from = 0

  while (from < text.length) {
    const at = haystack.indexOf(needle, from)
    if (at < 0) break

    if (at > from) segments.push({ text: text.slice(from, at), match: false })
    segments.push({ text: text.slice(at, at + needle.length), match: true })
    from = at + needle.length
  }

  if (!segments.length) return [{ text, match: false }]
  if (from < text.length) segments.push({ text: text.slice(from), match: false })

  return segments
}

/**
 * Поднимает «недавние» команды в отдельную группу наверх, сохраняя порядок
 * `recentIds`, и убирает их из остального списка — иначе одна и та же команда
 * оказалась бы в списке дважды, а `id` у неё один.
 */
export function withRecentCommands(
  groups: GrCommandGroup[],
  items: GrCommandItem[],
  recentIds: string[],
  title: string,
): GrCommandGroup[] {
  if (!recentIds.length) return groups

  const byId = new Map(items.map(item => [item.id, item]))
  const recent: GrCommandItem[] = []
  const taken = new Set<string>()

  for (const id of recentIds) {
    const item = byId.get(id)
    if (!item || taken.has(id)) continue
    recent.push(item)
    taken.add(id)
  }

  if (!recent.length) return groups

  const rest = groups
    .map(group => ({ ...group, items: group.items.filter(item => !taken.has(item.id)) }))
    .filter(group => group.items.length > 0)

  return [{ name: title, items: recent }, ...rest]
}

/** Идентификаторы, встретившиеся больше одного раза. */
export function findDuplicateCommandIds(items: GrCommandItem[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const item of items) {
    if (seen.has(item.id)) duplicates.add(item.id)
    else seen.add(item.id)
  }

  return [...duplicates]
}
