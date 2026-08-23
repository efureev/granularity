import type { Ref } from 'vue'
import { computed, onScopeDispose, shallowRef } from 'vue'

import type { DragSortSpan } from './internal/dragSortGeometry'
import { autoScrollDelta, hitTest } from './internal/dragSortGeometry'
import { useDragGesture } from './useDragGesture'

/**
 * Модель перестановки: перенос элемента указателем и с клавиатуры.
 *
 * Композабл владеет **механикой** — сессией жеста поверх `useDragGesture`,
 * порогом начала, попаданием в элемент, автопрокруткой у краёв и состоянием
 * переноса. **Смысл** остаётся у компонента: что считать целью (индекс вставки
 * у списка, «до / внутрь / после» у дерева), какими клавишами это делается и
 * что сказать в живой регион.
 *
 * Граница проведена так не из вкуса: у списка цель переноса — число, у дерева —
 * пара «узел и зона», а `Space` в дереве уже занят чекбоксом. Общая у них
 * механика, а не семантика; обобщать семантику значило бы завести опцию на
 * каждое расхождение.
 *
 * Данные композабл не меняет: он сообщает «источник и цель», перестановку
 * делает потребитель (`moveItem` из `internal/dragSortGeometry` — если она
 * обычная).
 *
 * ```ts
 * const sort = useDragSort<string, number>({
 *   items: () => keys.value,
 *   elementFor: key => rowEls.get(key),
 *   scroller: () => scrollerEl.value,
 *   resolveTarget: (hit, source) => insertionIndex(hit, indexOf(source), keys.value.length),
 *   onDrop: (source, to) => emit('move', indexOf(source), to),
 * })
 * ```
 */

export type DragSortOrientation = 'vertical' | 'horizontal'

/** Чем ведётся перенос: указателем или с клавиатуры. */
export type DragSortMode = 'pointer' | 'keyboard'

export interface DragSortHit<TKey> {
  key: TKey
  index: number
  /** Доля вдоль элемента: 0 — начало, 1 — конец. Зоны нарезает компонент. */
  fraction: number
}

export interface UseDragSortOptions<TKey, TTarget> {
  items: () => readonly TKey[]
  elementFor: (key: TKey) => HTMLElement | null | undefined
  /** По умолчанию `vertical`. */
  orientation?: () => DragSortOrientation
  /** Скроллер для автопрокрутки у краёв. Не задан — автопрокрутки нет. */
  scroller?: () => HTMLElement | null | undefined
  disabled?: () => boolean
  canDrag?: (key: TKey) => boolean
  /** Сдвиг, после которого нажатие становится переносом. По умолчанию 4px. */
  threshold?: () => number
  /**
   * Попадание указателя → цель переноса. `null` — сюда положить нельзя.
   *
   * Третьим аргументом приходит прежняя цель: цели сравниваются по ссылке, и
   * объектной цели (как «узел плюс зона» у дерева) стоит вернуть **ту же**
   * ссылку, пока смысл не изменился, — иначе подсветка и объявления будут
   * дёргаться на каждом движении указателя.
   */
  resolveTarget: (hit: DragSortHit<TKey>, source: TKey, previous: TTarget | null) => TTarget | null
  /** Перенос состоялся. */
  onDrop: (source: TKey, target: TTarget) => void
  /** Состояние изменилось: подсветка строк и объявления — на этом. */
  onUpdate?: (source: TKey | null, target: TTarget | null, mode: DragSortMode | null) => void
}

export interface UseDragSortReturn<TKey, TTarget> {
  source: Ref<TKey | null>
  target: Ref<TTarget | null>
  mode: Ref<DragSortMode | null>
  isActive: Ref<boolean>
  /** Вешается на `@pointerdown` ручки или строки. */
  startFrom: (key: TKey) => (event: PointerEvent) => void
  /** Клавиатурный перенос: взять элемент. */
  grab: (key: TKey) => void
  /** Клавиатурный перенос: назначить цель (двигать ведёт компонент). */
  setTarget: (target: TTarget | null) => void
  /** Положить: если цель есть — состоится `onDrop`. */
  drop: () => void
  /** Отменить: ничего не переносится. */
  cancel: () => void
}

export function useDragSort<TKey, TTarget>(
  options: UseDragSortOptions<TKey, TTarget>,
): UseDragSortReturn<TKey, TTarget> {
  const source = shallowRef<TKey | null>(null)
  const target = shallowRef<TTarget | null>(null)
  const mode = shallowRef<DragSortMode | null>(null)
  const isActive = computed(() => mode.value !== null)

  // Нажатая, но ещё не потянутая строка: между `pointerdown` и порогом это
  // остаётся обычным кликом, и объявлять перенос рано.
  let pendingKey: TKey | null = null
  let originX = 0
  let originY = 0
  let lastPoint: { x: number, y: number } | null = null
  let scrollFrame: number | null = null

  const gesture = useDragGesture({
    disabled: () => options.disabled?.() ?? false,
    onStart: (event) => {
      if (pendingKey === null)
        return false
      if (options.canDrag?.(pendingKey) === false)
        return false

      originX = event.clientX
      originY = event.clientY

      return true
    },
    onMove: (event) => {
      if (mode.value === null) {
        const moved = Math.hypot(event.clientX - originX, event.clientY - originY)
        if (moved < (options.threshold?.() ?? 4))
          return

        source.value = pendingKey
        mode.value = 'pointer'
        // Esc отменяет перенос, но `pointercancel` браузер при этом не шлёт —
        // клавишу приходится слушать самим, в capture, до слоёв приложения.
        window.addEventListener('keydown', onWindowKeydown, true)
        startScrolling()
        notify()
      }

      // Против выделения текста под курсором во время переноса.
      event.preventDefault()

      lastPoint = { x: event.clientX, y: event.clientY }
      updateTarget(lastPoint)
    },
    onEnd: () => {
      if (mode.value === 'pointer')
        commit()
      else reset()
    },
    onCancel: reset,
  })

  function isVertical(): boolean {
    return (options.orientation?.() ?? 'vertical') === 'vertical'
  }

  function spanOf(rect: DOMRect): DragSortSpan {
    return isVertical() ? { start: rect.top, end: rect.bottom } : { start: rect.left, end: rect.right }
  }

  function notify(): void {
    options.onUpdate?.(source.value, target.value, mode.value)
  }

  function updateTarget(point: { x: number, y: number }): void {
    const current = source.value
    if (current === null)
      return

    // Отрисованы не все: список может быть под окном отсечения, ветка дерева —
    // свёрнута. Попадание считается по тому, что на экране есть.
    const rendered: { key: TKey, index: number, span: DragSortSpan }[] = []

    options.items().forEach((key, index) => {
      const el = options.elementFor(key)
      if (el)
        rendered.push({ key, index, span: spanOf(el.getBoundingClientRect()) })
    })

    const hit = hitTest(rendered.map(entry => entry.span), isVertical() ? point.y : point.x)
    const entry = hit === null ? null : rendered[hit.index]
    const next = entry === null || hit === null
      ? null
      : options.resolveTarget({ key: entry.key, index: entry.index, fraction: hit.fraction }, current, target.value)

    if (next === target.value)
      return

    target.value = next
    notify()
  }

  /**
   * Автопрокрутка живёт в своём кадре, а не в обработчике движения: у края
   * указатель обычно стоит неподвижно, событий больше нет — а список должен
   * продолжать ехать.
   */
  function tickScroll(): void {
    scrollFrame = null

    const scroller = options.scroller?.()
    const point = lastPoint
    if (!scroller || !point || mode.value !== 'pointer')
      return

    const delta = autoScrollDelta(spanOf(scroller.getBoundingClientRect()), isVertical() ? point.y : point.x)

    if (delta !== 0) {
      if (isVertical())
        scroller.scrollTop += delta
      else scroller.scrollLeft += delta

      updateTarget(point)
    }

    scrollFrame = requestAnimationFrame(tickScroll)
  }

  function startScrolling(): void {
    if (scrollFrame !== null || !options.scroller?.())
      return

    scrollFrame = requestAnimationFrame(tickScroll)
  }

  function stopScrolling(): void {
    if (scrollFrame === null)
      return

    cancelAnimationFrame(scrollFrame)
    scrollFrame = null
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape')
      return

    event.preventDefault()
    gesture.stop(false)
  }

  function reset(): void {
    stopScrolling()
    window.removeEventListener('keydown', onWindowKeydown, true)

    pendingKey = null
    lastPoint = null
    source.value = null
    target.value = null
    mode.value = null
    notify()
  }

  function commit(): void {
    const from = source.value
    const to = target.value

    if (from !== null && to !== null)
      options.onDrop(from, to)

    reset()
  }

  function startFrom(key: TKey) {
    return (event: PointerEvent): void => {
      // Клавиатурный перенос идёт своим чередом: указатель его не перебивает.
      if (mode.value === 'keyboard')
        return

      pendingKey = key
      gesture.start(event)
    }
  }

  function grab(key: TKey): void {
    if (options.disabled?.() || options.canDrag?.(key) === false)
      return
    if (mode.value !== null)
      return

    source.value = key
    target.value = null
    mode.value = 'keyboard'
    notify()
  }

  function setTarget(next: TTarget | null): void {
    if (mode.value !== 'keyboard')
      return

    target.value = next
    notify()
  }

  function drop(): void {
    if (mode.value !== 'keyboard')
      return

    commit()
  }

  function cancel(): void {
    if (mode.value === 'pointer') {
      gesture.stop(false)
      return
    }

    if (mode.value === 'keyboard')
      reset()
  }

  onScopeDispose(() => {
    stopScrolling()
    window.removeEventListener('keydown', onWindowKeydown, true)
  })

  return { source, target, mode, isActive, startFrom, grab, setTarget, drop, cancel }
}
