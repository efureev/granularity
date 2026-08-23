import { ref } from 'vue'

import type { ZoomAnchor } from './useZoomPan'

/** Сколько пикселей должен пройти палец, чтобы это считалось свайпом. */
const SWIPE_THRESHOLD_PX = 60
/** Во сколько раз горизонталь должна превысить вертикаль: иначе это не листание. */
const SWIPE_AXIS_RATIO = 1.5

export interface UsePointerGesturesOptions {
  /** Включены ли жесты вовсе (есть кадры). */
  enabled: () => boolean
  /** Текущий масштаб: на неувеличенном кадре одиночный жест листает, а не тянет. */
  scale: () => number
  /** Есть ли куда листать (кадров больше одного). */
  canSwipe: () => boolean
  /** Масштаб с якорем — тот же, что у колеса. */
  setScaleAt: (value: number, anchor: ZoomAnchor) => void
  pan: {
    start: (x: number, y: number) => void
    move: (x: number, y: number) => void
    end: () => void
  }
  onSwipeLeft: () => void
  onSwipeRight: () => void
}

interface TrackedPointer {
  x: number
  y: number
}

/**
 * usePointerGestures — сенсорные жесты просмотрщика: pinch-zoom двумя пальцами
 * и горизонтальный свайп для листания.
 *
 * Живёт на тех же pointer-событиях, что и перетаскивание мышью: разделение идёт
 * по числу активных указателей, а не по типу устройства — трекпад и стилус
 * ведут себя как мышь, палец как палец, отдельных веток на `touch*` не нужно.
 *
 * Что делает одиночный жест, решает масштаб: на увеличенном кадре тянуть важнее
 * (иначе до краёв не добраться), на вписанном — листать.
 */
export function usePointerGestures(options: UsePointerGesturesOptions) {
  const pointers = new Map<number, TrackedPointer>()

  /** Идёт ли сейчас pinch: на время жеста компонент гасит CSS-переход. */
  const isPinching = ref(false)

  let pinchStartDistance = 0
  let pinchStartScale = 1

  let swipeStartX = 0
  let swipeStartY = 0
  let isSwipeCandidate = false

  function distance(a: TrackedPointer, b: TrackedPointer): number {
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  function midpoint(a: TrackedPointer, b: TrackedPointer): ZoomAnchor {
    return { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }
  }

  function activePair(): [TrackedPointer, TrackedPointer] | null {
    if (pointers.size < 2)
      return null
    const [first, second] = [...pointers.values()]
    return [first, second]
  }

  function onPointerDown(event: PointerEvent): void {
    if (!options.enabled() || event.pointerType === 'mouse')
      return

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    const pair = activePair()
    if (pair) {
      // Второй палец превращает начатое перетаскивание в pinch.
      options.pan.end()
      isSwipeCandidate = false
      isPinching.value = true
      pinchStartDistance = distance(pair[0], pair[1]) || 1
      pinchStartScale = options.scale()
      return
    }

    if (options.scale() > 1) {
      options.pan.start(event.clientX, event.clientY)
      return
    }

    isSwipeCandidate = options.canSwipe()
    swipeStartX = event.clientX
    swipeStartY = event.clientY
  }

  function onPointerMove(event: PointerEvent): void {
    if (!pointers.has(event.pointerId))
      return

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    const pair = activePair()
    if (pair && isPinching.value) {
      const current = distance(pair[0], pair[1])
      if (!current)
        return

      options.setScaleAt(pinchStartScale * (current / pinchStartDistance), midpoint(pair[0], pair[1]))
      return
    }

    if (!isSwipeCandidate)
      options.pan.move(event.clientX, event.clientY)
  }

  function finishSwipe(event: PointerEvent): void {
    const deltaX = event.clientX - swipeStartX
    const deltaY = event.clientY - swipeStartY

    isSwipeCandidate = false

    // Вертикальное движение — это скролл или случайное дрожание, листать по
    // нему нельзя: пользователь целился не туда.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX)
      return
    if (Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_AXIS_RATIO)
      return

    if (deltaX < 0)
      options.onSwipeLeft()
    else options.onSwipeRight()
  }

  function onPointerUp(event: PointerEvent): void {
    if (!pointers.has(event.pointerId))
      return

    const wasSwipeCandidate = isSwipeCandidate
    pointers.delete(event.pointerId)

    if (isPinching.value && pointers.size < 2) {
      isPinching.value = false
      // Оставшийся палец продолжает жест уже как перетаскивание.
      const [remaining] = [...pointers.values()]
      if (remaining && options.scale() > 1)
        options.pan.start(remaining.x, remaining.y)
      return
    }

    if (wasSwipeCandidate) {
      finishSwipe(event)
      return
    }

    options.pan.end()
  }

  /**
   * Обрыв — не отпускание: браузер забрал указатель (системный жест, звонок,
   * потеря окна). Пройденное расстояние при этом не считается свайпом, иначе
   * прерванный жест листает кадр, которого пользователь не листал.
   */
  function onPointerCancel(event: PointerEvent): void {
    if (!pointers.has(event.pointerId))
      return

    pointers.delete(event.pointerId)
    isSwipeCandidate = false
    isPinching.value = false
    options.pan.end()
  }

  /** Сброс при закрытии, смене кадра и размонтировании. */
  function reset(): void {
    pointers.clear()
    isPinching.value = false
    isSwipeCandidate = false
  }

  return { isPinching, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, reset }
}
