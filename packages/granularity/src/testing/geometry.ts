/**
 * Геометрия в jsdom.
 *
 * Раскладки в jsdom нет: `getBoundingClientRect` у любого элемента возвращает
 * нули. Всё, что считает попадание указателя — слайдер, сплиттер, перестановка,
 * ширины колонок таблицы, — на нулевом прямоугольнике проверять не на чем,
 * поэтому геометрия задаётся руками.
 */

export type MockRect = Partial<Omit<DOMRect, 'toJSON'>>

/** Прямоугольник элемента. Незаданные стороны выводятся из заданных. */
export function mockRect(target: Element, rect: MockRect): void {
  const left = rect.left ?? rect.x ?? 0
  const top = rect.top ?? rect.y ?? 0
  const width = rect.width ?? (rect.right ?? 0) - left
  const height = rect.height ?? (rect.bottom ?? 0) - top

  const value: DOMRect = {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: rect.right ?? left + width,
    bottom: rect.bottom ?? top + height,
    toJSON: () => ({}),
  }

  target.getBoundingClientRect = () => value
}

export interface StackRectsOptions {
  /** Размер элемента вдоль оси. */
  size: number
  /** Ось раскладки. По умолчанию вертикальная — так лежат списки и строки. */
  axis?: 'vertical' | 'horizontal'
  /** Смещение первого элемента. */
  start?: number
  /** Размер поперёк оси. */
  cross?: number
}

/** Элементы подряд, встык, без зазоров: строки списка, ячейки шапки, деления шкалы. */
export function stackRects(targets: Iterable<Element>, options: StackRectsOptions): void {
  const { size, axis = 'vertical', start = 0, cross = 100 } = options

  let offset = start

  for (const target of targets) {
    mockRect(target, axis === 'vertical'
      ? { top: offset, height: size, left: 0, width: cross }
      : { left: offset, width: size, top: 0, height: cross })

    offset += size
  }
}
