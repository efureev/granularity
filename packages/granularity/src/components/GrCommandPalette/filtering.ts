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
