/**
 * `inert` для чужих поддеревьев.
 *
 * Визуального перекрытия мало: без `inert` таб уходит в форму, которую
 * пользователь уже не видит, а скринридер читает её как обычную. `inert`
 * снимает поддерево целиком — фокус, события указателя и дерево доступности.
 *
 * Два правила, из-за которых это отдельный модуль, а не пара строк на месте:
 *
 *  - **чужой `inert` не снимаем.** Элемент мог быть инертен и до нас;
 *  - **счётчик на элемент.** Два открытых оверлея пометят один и тот же фон, и
 *    закрытие первого не должно возвращать его в таб-порядок под вторым.
 */

interface InertRecord {
  /** Сколько слоёв сейчас держат элемент инертным. */
  count: number
  /** Был ли `inert` до нас: такой не снимаем. */
  foreign: boolean
  /** Прежнее значение `aria-hidden` (или `null`, если атрибута не было). */
  ariaHidden: string | null
}

const records = new WeakMap<HTMLElement, InertRecord>()

/** Помечает элементы инертными и возвращает снятие пометки. */
export function markInert(elements: HTMLElement[]): () => void {
  const marked: HTMLElement[] = []

  for (const element of elements) {
    const existing = records.get(element)

    if (existing) {
      existing.count += 1
      marked.push(element)
      continue
    }

    const foreign = element.hasAttribute('inert')
    records.set(element, {
      count: 1,
      foreign,
      ariaHidden: element.getAttribute('aria-hidden'),
    })
    marked.push(element)

    if (foreign)
      continue

    element.setAttribute('inert', '')
    // `inert` убирает поддерево из дерева доступности не во всех движках,
    // поэтому намерение дублируется явно.
    element.setAttribute('aria-hidden', 'true')
  }

  return () => {
    for (const element of marked) {
      const record = records.get(element)
      if (!record)
        continue

      record.count -= 1
      if (record.count > 0)
        continue

      records.delete(element)
      if (record.foreign)
        continue

      element.removeAttribute('inert')
      if (record.ariaHidden === null)
        element.removeAttribute('aria-hidden')
      else element.setAttribute('aria-hidden', record.ariaHidden)
    }
  }
}

/**
 * Что гасить, пока открыт модальный слой.
 *
 * Правило одно: **инертно всё, кроме ветки, в которой живёт оверлей**. Идём от
 * него вверх до `<body>` и на каждом уровне помечаем соседей. Наивное «все дети
 * `body`, кроме портала» сломалось бы на `portalTarget` внутри контейнера
 * приложения: `inert` наследуется вниз, и помеченный предок убил бы сам оверлей.
 *
 * Корни других оверлеев пропускаются (`data-gr-overlay-root`): тост обязан
 * оставаться видимым и озвученным поверх открытой модалки — ради этого он и
 * сидит на самом верхнем слое шкалы, — а панель селекта, открытая изнутри окна,
 * принадлежит тому же слою. Порядок между самими оверлеями решает стек слоёв
 * (`isTopmost`), а не этот модуль.
 *
 * По той же причине пропускается хост объявителя (`data-gr-live-region`):
 * `inert` выбрасывает поддерево из дерева доступности, и общий живой регион
 * замолчал бы ровно под открытым диалогом — там, где «сохранено» и «ошибка
 * сети» и нужны.
 */
export function inertableOutside(root: HTMLElement | null | undefined): HTMLElement[] {
  if (!root?.isConnected)
    return []

  const result: HTMLElement[] = []
  const body = root.ownerDocument.body

  let node: HTMLElement | null = root

  while (node && node !== body) {
    const parent: HTMLElement | null = node.parentElement
    if (!parent)
      break

    for (const sibling of Array.from(parent.children)) {
      if (!(sibling instanceof HTMLElement))
        continue
      if (sibling === node)
        continue
      if (sibling.hasAttribute('data-gr-overlay-root'))
        continue
      if (sibling.hasAttribute('data-gr-portal'))
        continue
      if (sibling.hasAttribute('data-gr-live-region'))
        continue
      result.push(sibling)
    }

    node = parent
  }

  return result
}
