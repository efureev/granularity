/** Сегмент пути — индекс массива, а не имя свойства. */
function isIndexSegment(segment: string): boolean {
  return segment !== '' && /^\d+$/.test(segment)
}

export function splitPath(path: string): string[] {
  return path === '' ? [] : path.split('.')
}

export function joinPath(...parts: (string | number)[]): string {
  return parts.filter(part => part !== '' && part !== undefined).join('.')
}

/** `items.*.name` + `[0]` → `items.0.name`. Лишние индексы игнорируются. */
export function toInstancePath(template: string, indices: readonly number[]): string {
  let cursor = 0

  return splitPath(template)
    .map(segment => (segment === '*' ? String(indices[cursor++] ?? 0) : segment))
    .join('.')
}

/** `items.0.name` → `items.*.name`. */
export function toTemplatePath(instance: string): string {
  return splitPath(instance)
    .map(segment => (isIndexSegment(segment) ? '*' : segment))
    .join('.')
}

/** Индексы массивов в инстанс-пути, снаружи внутрь. */
export function pathIndices(instance: string): number[] {
  return splitPath(instance).filter(isIndexSegment).map(Number)
}

export interface NormalizeFieldPathOptions {
  /** Префиксы JSON Pointer, которые снимаются: `data`, `attributes`. */
  stripPrefixes?: string[]
}

/**
 * Приводит путь любого происхождения к dot-форме, понятной ядру.
 *
 * Нужен потому, что источников три и все пишут по-своему: `items[0].name` от
 * Laravel, `/data/attributes/items/0/name` от JSON:API, `items.0.name` от нас.
 * Ядро парсит только последнюю форму — скобочную оно молча прочтёт как ключ
 * `"items[0]"` и ошибка не найдёт своего поля.
 */
export function normalizeFieldPath(raw: string, options: NormalizeFieldPathOptions = {}): string {
  let path = raw.trim()

  // JSON Pointer: `~1` — это `/`, `~0` — это `~`; порядок расэкранирования обратный.
  if (path.startsWith('/')) {
    path = path
      .slice(1)
      .split('/')
      .map(segment => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
      .join('.')
  }

  path = path
    // `items[0]` → `items.0`, `map["key"]` → `map.key`
    .replace(/\[(['"]?)([^\]]*?)\1\]/g, (_match, _quote, key: string) => `.${key}`)
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.{2,}/g, '.')

  const strip = options.stripPrefixes ?? []
  if (strip.length > 0) {
    const segments = splitPath(path)
    while (segments.length > 0 && strip.includes(segments[0]!)) segments.shift()
    path = segments.join('.')
  }

  return path
}

export function getAtPath(value: unknown, path: string): unknown {
  if (path === '')
    return value

  return splitPath(path).reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object')
      return (acc as Record<string, unknown>)[key]
    return undefined
  }, value)
}

/**
 * Записывает значение по dot-пути, создавая недостающие узлы.
 *
 * Отличие от `setByPath` ядра — единственное и намеренное: под числовым
 * сегментом создаётся **массив**, а не объект. Ядро создаёт объект, и путь
 * `items.0.name` превратил бы отсутствующий массив в `{ '0': … }` — форма
 * после этого сохранила бы объект там, где сервер ждёт список.
 */
export function setAtPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = splitPath(path)
  if (segments.length === 0)
    return

  const last = segments.pop()!
  let cursor: Record<string, unknown> = target

  for (let i = 0; i < segments.length; i += 1) {
    const key = segments[i]!
    const nextIsIndex = isIndexSegment(segments[i + 1] ?? last)
    const current = cursor[key]

    if (current === null || typeof current !== 'object')
      cursor[key] = nextIsIndex ? [] : {}

    cursor = cursor[key] as Record<string, unknown>
  }

  cursor[last] = value
}

export function deleteAtPath(target: Record<string, unknown>, path: string): void {
  const segments = splitPath(path)
  if (segments.length === 0)
    return

  const last = segments.pop()!
  const parent = getAtPath(target, segments.join('.'))
  if (!parent || typeof parent !== 'object')
    return

  if (Array.isArray(parent) && isIndexSegment(last))
    parent.splice(Number(last), 1)
  else delete (parent as Record<string, unknown>)[last]
}
