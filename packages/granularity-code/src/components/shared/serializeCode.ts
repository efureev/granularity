/**
 * Приведение произвольного значения к тексту для показа.
 *
 * Компонент показывает данные из БД, и они бывают любыми: `unknown`-поле ответа
 * модели, `meta` запуска, тело ошибки. Поэтому сериализация обязана пережить всё
 * — уронить страницу она права не имеет.
 */

/** Маркер повторной ссылки. Показывается вместо ветки, которая уже встречалась выше. */
export const CIRCULAR_MARKER = '[Circular]'

/** Что печатается, когда сериализовать не удалось вовсе. */
export const UNSERIALIZABLE_MARKER = '[Unserializable]'

/** Признак значения, которое не удалось прочитать: на верхнем уровне печатается без кавычек. */
const FAILED = Symbol('unserializable')

/**
 * Дерево, которое `JSON.stringify` пройдёт без исключений, — собранное своим
 * обходом, значение за значением.
 *
 * Штатный `stringify` зовёт `toJSON` **до** `replacer`, поэтому один враждебный
 * `toJSON` (или геттер, который бросает) обрывал весь вызов: вместо данных со
 * сбоем в одном поле показывался единственный `[Unserializable]`, а циклы и
 * `BigInt` так и не доходили до обработки. Здесь `toJSON` и чтение каждого поля
 * идут в своём `try`, и маркер получает только упавшее значение — соседи,
 * `[Circular]` и `BigInt` остаются.
 *
 * Маркером `[Circular]` помечается **повторная ссылка**, а не только настоящий
 * цикл: объект, положенный в дерево дважды, тоже его получит. Стек предков
 * отличил бы одно от другого, но обход по стеку разворачивает каждую общую
 * ветку заново — на «ромбе» из общих ссылок это экспонента. Показать
 * `[Circular]` там, где данные переиспользуют объект, — неточность; зависнуть —
 * хуже.
 */
function toSafe(value: unknown, key: string, seen: WeakSet<object>): unknown {
  let current = value

  try {
    const toJSON = (current as { toJSON?: unknown } | null | undefined)?.toJSON

    if (typeof current === 'object' && current !== null && typeof toJSON === 'function')
      current = (toJSON as (key: string) => unknown).call(current, key)
  }
  catch {
    return FAILED
  }

  // `BigInt` не имеет представления в JSON, и `stringify` на нём бросает.
  if (typeof current === 'bigint')
    return `${current}n`

  if (typeof current !== 'object' || current === null)
    return current

  // Обёртки примитивов `stringify` разворачивает сам — как и он, берём значение.
  const tag = Object.prototype.toString.call(current)

  if (tag === '[object Number]' || tag === '[object String]' || tag === '[object Boolean]')
    return (current as { valueOf: () => unknown }).valueOf()

  if (seen.has(current))
    return CIRCULAR_MARKER

  seen.add(current)

  try {
    if (Array.isArray(current)) {
      const items: unknown[] = []

      for (let index = 0; index < current.length; index += 1)
        items.push(read(current, index, seen))

      return items
    }

    const entries: Record<string, unknown> = {}

    for (const name of Object.keys(current))
      entries[name] = read(current as Record<string, unknown>, name, seen)

    return entries
  }
  catch {
    // Упал перебор ключей (`Proxy` с враждебным `ownKeys`) — маркер у всего объекта.
    return FAILED
  }
}

/** Поле, прочитанное в своём `try`: геттер, который бросает, портит только себя. */
function read(container: Record<string | number, unknown> | unknown[], name: string | number, seen: WeakSet<object>): unknown {
  let item: unknown

  try {
    item = (container as Record<string | number, unknown>)[name]
  }
  catch {
    return FAILED
  }

  return toSafe(item, String(name), seen)
}

/** Сбойное значение → маркер-строка внутри дерева. */
function markFailures(_key: string, value: unknown): unknown {
  return value === FAILED ? UNSERIALIZABLE_MARKER : value
}

/**
 * Значение → текст.
 *
 * Строка проходит как есть: это уже готовый текст, и оборачивать его в кавычки
 * значило бы показать не то, что пришло. `undefined` даёт пустую строку —
 * показывать нечего. Всё остальное сериализуется с отступом; что не удалось
 * прочитать, заменяется маркером **на месте этого значения**.
 */
export function serializeCode(value: unknown, indent = 2): string {
  if (typeof value === 'string')
    return value
  if (value === undefined)
    return ''

  try {
    const safe = toSafe(value, '', new WeakSet())

    if (safe === FAILED)
      return UNSERIALIZABLE_MARKER

    // `stringify` отдаёт `undefined` на функции и символе — печатать «undefined»
    // строкой было бы враньём про содержимое.
    return JSON.stringify(safe, markFailures, indent) ?? ''
  }
  catch {
    return UNSERIALIZABLE_MARKER
  }
}

/**
 * Сериализация с устойчивым порядком ключей — для сравнения, а не для показа.
 *
 * `serializeCode` печатает ключи в порядке вставки, потому что он про **показ**:
 * данные видно такими, какими они пришли. Для диффа этого мало. Два объекта с
 * одинаковым содержимым и разным порядком ключей дали бы выдуманные различия,
 * и потребитель увидел бы правку там, где её не было — а это ровно тот дефект,
 * ради обнаружения которого дифф и открывают.
 *
 * Порядок задаётся списком ключей в `JSON.stringify`: он же обходит вложенные
 * объекты, поэтому сортировать дерево руками не нужно.
 */
export function serializeStable(value: unknown, indent = 2): string {
  if (typeof value === 'string')
    return value
  if (value === undefined)
    return ''

  try {
    const safe = toSafe(value, '', new WeakSet())

    if (safe === FAILED)
      return UNSERIALIZABLE_MARKER

    const keys = new Set<string>()
    collectKeys(safe, keys, new WeakSet())

    // Маркеры сбоев проставляются до сортировки: список ключей `replacer`
    // заменяет, а не дополняет.
    const marked: unknown = JSON.parse(JSON.stringify(safe, markFailures) ?? 'null')
    const serialized = JSON.stringify(marked, [...keys].sort(), indent)

    return serialized ?? ''
  }
  catch {
    return UNSERIALIZABLE_MARKER
  }
}

/**
 * Все имена полей дерева. Массивы обходятся, но индексы ключами не считаются:
 * порядок элементов массива — часть данных, а не оформления.
 */
function collectKeys(value: unknown, into: Set<string>, seen: WeakSet<object>): void {
  if (typeof value !== 'object' || value === null || seen.has(value))
    return

  seen.add(value)

  if (Array.isArray(value)) {
    for (const item of value)
      collectKeys(item, into, seen)

    return
  }

  for (const [key, item] of Object.entries(value)) {
    into.add(key)
    collectKeys(item, into, seen)
  }
}
