/** Прямоугольник, из которого достраиваются недостающие стороны. */
export type StubRectInit = Partial<Omit<DOMRect, 'toJSON'>>

function toRect(init: StubRectInit): DOMRect {
  const left = init.left ?? init.x ?? 0
  const top = init.top ?? init.y ?? 0
  const width = init.width ?? (init.right ?? 0) - left
  const height = init.height ?? (init.bottom ?? 0) - top

  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: init.right ?? left + width,
    bottom: init.bottom ?? top + height,
    toJSON: () => ({}),
  }
}

/**
 * Прямоугольник **всем** элементам сразу: подменяется прототип.
 *
 * Отличие от поэлементной подмены (`mockRect` в `@feugene/granularity/testing`)
 * не в удобстве, а в моменте. Поэлементная требует ссылку на узел, а компонент,
 * который меряет свой корень в `onMounted`, снимает размер раньше, чем тест до
 * этого узла доберётся: к первому обращению прямоугольник уже должен врать.
 *
 * Возвращает откат — глобальное состояние обязано уйти вместе с тестом.
 * Арифметика сторон повторяет ядерную намеренно: тест-кит от ядра не зависит,
 * иначе ядро, которое само зовёт его фабрики, замкнуло бы зависимость на себя.
 */
export function stubElementRects(
  rect: StubRectInit | ((element: Element) => StubRectInit),
): () => void {
  const original = Object.getOwnPropertyDescriptor(Element.prototype, 'getBoundingClientRect')
  const resolve = typeof rect === 'function' ? rect : () => rect

  Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
    configurable: true,
    value(this: Element): DOMRect {
      return toRect(resolve(this))
    },
  })

  return () => {
    if (original)
      Object.defineProperty(Element.prototype, 'getBoundingClientRect', original)
    else delete (Element.prototype as { getBoundingClientRect?: unknown }).getBoundingClientRect
  }
}
