/**
 * Порядок и состав панелей: чистая арифметика над ключами, без DOM и Vue.
 *
 * Вынесена отдельно по той же причине, что и `dragSortGeometry`: ошибка здесь
 * проявляется не исключением, а «строка встала не туда» или «выбор исчез после
 * перезагрузки каталога» — поймать это можно только тестом на числах и
 * массивах.
 */

export type GrTransferKey = string | number

export type GrTransferSide = 'source' | 'target'

export type GrTransferDirection = 'toTarget' | 'toSource'

export interface GrTransferSplit<TItem> {
  /** Каталог минус модель, в порядке `items`. */
  source: TItem[]
  /** Отобранное, в порядке **модели**: порядок правой панели и есть значение. */
  target: TItem[]
  /** Ключи модели, которым в `items` ничего не соответствует. */
  unresolved: GrTransferKey[]
  /** Ключи, встретившиеся в `items` дважды: рисуется первый. */
  duplicated: GrTransferKey[]
}

/**
 * Ключи без дублей, первый выигрывает.
 *
 * Нормализация идёт **на чтение** и наружу сама по себе не эмитится: эмит из
 * рендера — источник петель обновления. Нормализованный вид уезжает потребителю
 * при первом же коммите.
 */
export function normalizeKeys(keys: readonly GrTransferKey[]): GrTransferKey[] {
  const seen = new Set<GrTransferKey>()
  const next: GrTransferKey[] = []

  for (const key of keys) {
    if (seen.has(key))
      continue

    seen.add(key)
    next.push(key)
  }

  return next
}

/**
 * Раскладка каталога по панелям.
 *
 * `target` строится обходом **модели**, а не `items`: порядок правой панели
 * задаёт пользователь, и он же является значением. `source` — обходом `items`,
 * потому что порядок каталога принадлежит потребителю.
 */
export function splitByModel<TItem>(
  items: readonly TItem[],
  keyOf: (item: TItem) => GrTransferKey,
  model: readonly GrTransferKey[],
): GrTransferSplit<TItem> {
  const byKey = new Map<GrTransferKey, TItem>()
  const duplicated: GrTransferKey[] = []

  for (const item of items) {
    const key = keyOf(item)
    if (byKey.has(key)) {
      duplicated.push(key)
      continue
    }
    byKey.set(key, item)
  }

  const wanted = normalizeKeys(model)
  const inTarget = new Set(wanted)

  const target: TItem[] = []
  const unresolved: GrTransferKey[] = []

  for (const key of wanted) {
    const item = byKey.get(key)
    if (item === undefined) {
      unresolved.push(key)
      continue
    }
    target.push(item)
  }

  // Дубль рисуется один раз: `byKey` держит именно первое вхождение, поэтому
  // сравнение по ссылке отсеивает повторы за один проход, без вложенного поиска.
  const source = items.filter(item => !inTarget.has(keyOf(item)) && byKey.get(keyOf(item)) === item)

  return { source, target, unresolved, duplicated }
}

/** Ключи в порядке эталонного списка; чего в нём нет — в конец, в порядке входа. */
export function orderedBy(
  order: readonly GrTransferKey[],
  keys: Iterable<GrTransferKey>,
): GrTransferKey[] {
  const wanted = new Set(keys)
  const known = order.filter(key => wanted.has(key))
  const knownSet = new Set(known)
  const rest = [...wanted].filter(key => !knownSet.has(key))

  return [...known, ...rest]
}

/** Изъятие блока. Вход не мутируется. */
export function removeKeys(
  order: readonly GrTransferKey[],
  moving: readonly GrTransferKey[],
): GrTransferKey[] {
  const drop = new Set(moving)

  return order.filter(key => !drop.has(key))
}

/**
 * Вставка блока перед ключом `before`; `null` или ненайденный ключ — в конец.
 *
 * Цель выражена ключом, а не индексом, намеренно: индекс пришлось бы
 * пересчитывать после изъятия блока, и это ровно тот класс off-by-one, из-за
 * которого `insertionIndex` в `dragSortGeometry` носит поправку «элемент
 * временно вынут». Здесь поправка не нужна вовсе.
 */
export function insertKeys(
  order: readonly GrTransferKey[],
  moving: readonly GrTransferKey[],
  before: GrTransferKey | null,
): GrTransferKey[] {
  const block = normalizeKeys(moving)
  if (block.length === 0)
    return order.slice()

  const rest = removeKeys(order, block)
  const at = before === null ? -1 : rest.indexOf(before)

  if (at < 0)
    return [...rest, ...block]

  return [...rest.slice(0, at), ...block, ...rest.slice(at)]
}

/**
 * Куда встанет блок при сдвиге на шаг; `undefined` — двигаться некуда.
 *
 * Рассыпанное выделение при сдвиге схлопывается в непрерывный блок: это
 * предсказуемо и объяснимо, в отличие от попытки двигать каждый кусок
 * независимо.
 */
export function stepTarget(
  order: readonly GrTransferKey[],
  moving: readonly GrTransferKey[],
  delta: 1 | -1,
): GrTransferKey | null | undefined {
  const block = normalizeKeys(moving).filter(key => order.includes(key))
  if (block.length === 0)
    return undefined

  const rest = removeKeys(order, block)
  const first = order.findIndex(key => block.includes(key))
  const before = order.slice(0, first).filter(key => !block.includes(key)).length
  const next = Math.min(rest.length, Math.max(0, before + delta))

  if (next === before)
    return undefined

  return rest[next] ?? null
}

/** Крайняя позиция блока: `-1` — в начало, `1` — в конец. */
export function edgeTarget(
  order: readonly GrTransferKey[],
  moving: readonly GrTransferKey[],
  edge: 'start' | 'end',
): GrTransferKey | null | undefined {
  const block = normalizeKeys(moving).filter(key => order.includes(key))
  if (block.length === 0)
    return undefined

  const rest = removeKeys(order, block)

  if (edge === 'end')
    return rest.length === 0 ? undefined : null

  const first = rest[0]

  return first === undefined ? undefined : first
}

/**
 * Какая строка останется под фокусом после изъятия.
 *
 * Без этого фокус после переноса падает на тело документа, и клавиатурный
 * сценарий обрывается на первом же шаге — тот же довод, что у `drop()` в
 * `GrSortableList`.
 */
export function keyAfterRemoval(
  visible: readonly GrTransferKey[],
  removed: readonly GrTransferKey[],
  focused: GrTransferKey | undefined,
): GrTransferKey | undefined {
  const drop = new Set(removed)
  const rest = visible.filter(key => !drop.has(key))

  if (rest.length === 0)
    return undefined

  if (focused !== undefined && !drop.has(focused))
    return focused

  const from = focused === undefined ? 0 : visible.indexOf(focused)

  // Ниже по списку — естественнее: взгляд остаётся там, где был список.
  for (let index = from; index < visible.length; index += 1) {
    const key = visible[index]
    if (!drop.has(key))
      return key
  }

  for (let index = from - 1; index >= 0; index -= 1) {
    const key = visible[index]
    if (!drop.has(key))
      return key
  }

  return rest[0]
}
