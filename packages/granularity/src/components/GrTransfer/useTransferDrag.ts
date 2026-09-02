import { onScopeDispose, ref, shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'

import { autoScrollDelta } from '../../composables/internal/dragSortGeometry'
import { useDragGesture } from '../../composables/useDragGesture'
import type { GrTransferPoint, GrTransferRect } from './transferGeometry'
import { dropBefore, passedThreshold, sideAtPoint } from './transferGeometry'
import type { GrTransferKey, GrTransferSide } from './transferModel'

/** Что тянут: сторона-источник и весь переносимый блок. */
export interface GrTransferDragSession {
  side: GrTransferSide
  keys: readonly GrTransferKey[]
}

/** Куда положат: сторона-приёмник и ключ, перед которым встанет блок. */
export interface GrTransferDropSpot {
  side: GrTransferSide
  before: GrTransferKey | null
}

export interface UseTransferDragOptions {
  disabled: () => boolean
  /** Ключи панели в порядке показа. */
  visibleKeys: (side: GrTransferSide) => readonly GrTransferKey[]
  rowEl: (side: GrTransferSide, key: GrTransferKey) => HTMLElement | null
  /** Обёртка панели: по её прямоугольнику выбирается приёмник. */
  panelEl: (side: GrTransferSide) => HTMLElement | null
  /** Скроллер панели: по нему считается автопрокрутка. */
  scrollerEl: (side: GrTransferSide) => HTMLElement | null
  /** Что тянуть: всё выделение, если взялись за выделенную строку, иначе одну. */
  blockFor: (side: GrTransferSide, key: GrTransferKey) => readonly GrTransferKey[]
  /** Можно ли ронять обратно в свою панель (перестановка). */
  allowSameSide: (side: GrTransferSide) => boolean
  onDrop: (session: GrTransferDragSession, spot: GrTransferDropSpot) => void
  onCancel?: () => void
}

export interface UseTransferDragReturn {
  session: Readonly<ShallowRef<GrTransferDragSession | null>>
  spot: Readonly<ShallowRef<GrTransferDropSpot | null>>
  /** Где указатель прямо сейчас: за ним едет предпросмотр переносимого. */
  pointer: Readonly<ShallowRef<GrTransferPoint>>
  /** Был ли жест — чтобы следующий `click` не схлопнул выделение. */
  consumeClick: () => boolean
  startFrom: (side: GrTransferSide, key: GrTransferKey) => (event: PointerEvent) => void
  cancel: () => void
}

function rectOf(el: HTMLElement | null): GrTransferRect | null {
  if (!el)
    return null

  const box = el.getBoundingClientRect()

  return { left: box.left, right: box.right, top: box.top, bottom: box.bottom }
}

/**
 * Перетаскивание между панелями.
 *
 * `useDragSort` здесь не подходит: его `resolveTarget` получает попадание, но не
 * точку указателя, а панель-приёмник определяется прямоугольником под точкой —
 * `hitTest` при промахе отдаёт ближайшую строку, и указатель над пустой правой
 * панелью резолвился бы в строку левой.
 */
export function useTransferDrag(options: UseTransferDragOptions): UseTransferDragReturn {
  const session = shallowRef<GrTransferDragSession | null>(null)
  const spot = shallowRef<GrTransferDropSpot | null>(null)
  const moved: Ref<boolean> = ref(false)
  const pointer = shallowRef<GrTransferPoint>({ x: 0, y: 0 })

  let origin: GrTransferPoint = { x: 0, y: 0 }
  let pending: GrTransferDragSession | null = null
  /** Последняя непустая сторона: в зазоре между панелями индикатор не мигает. */
  let lastSide: GrTransferSide | null = null
  let frame: number | null = null
  let cursor: GrTransferPoint = { x: 0, y: 0 }

  function stopAutoScroll(): void {
    if (frame !== null && typeof cancelAnimationFrame === 'function')
      cancelAnimationFrame(frame)
    frame = null
  }

  function tickAutoScroll(): void {
    frame = null
    const side = lastSide
    const scroller = side ? options.scrollerEl(side) : null

    if (scroller) {
      const box = scroller.getBoundingClientRect()
      const delta = autoScrollDelta({ start: box.top, end: box.bottom }, cursor.y)
      if (delta !== 0)
        scroller.scrollTop += delta
    }

    scheduleAutoScroll()
  }

  function scheduleAutoScroll(): void {
    // У края указатель стоит неподвижно, событий нет — а список обязан ехать.
    if (session.value === null || typeof requestAnimationFrame !== 'function')
      return

    frame = requestAnimationFrame(tickAutoScroll)
  }

  function reset(): void {
    session.value = null
    spot.value = null
    pending = null
    lastSide = null
    stopAutoScroll()
    detachEscape()
    unlockSelection()
  }

  function onEscape(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || session.value === null)
      return

    event.preventDefault()
    event.stopPropagation()
    abort()
  }

  /**
   * Выделение текста на время жеста.
   *
   * `select-none` на самих строках недостаточно: выделение **начинается** внутри
   * компонента, а тянется по всему документу — и пользователь, ведя строку через
   * страницу, подсвечивает попутно чужие заголовки и абзацы. Гасим на теле
   * документа и возвращаем прежнее значение, а не пустую строку: потребитель мог
   * задать своё.
   */
  let selectionLock: { userSelect: string, webkitUserSelect: string } | null = null

  function lockSelection(): void {
    if (typeof document === 'undefined' || selectionLock !== null)
      return

    const style = document.body.style as CSSStyleDeclaration & { webkitUserSelect?: string }
    selectionLock = { userSelect: style.userSelect, webkitUserSelect: style.webkitUserSelect ?? '' }
    style.userSelect = 'none'
    style.webkitUserSelect = 'none'

    // Уже начатое выделение снимаем: иначе оно остаётся подсвеченным весь жест.
    window.getSelection?.()?.removeAllRanges()
  }

  function unlockSelection(): void {
    if (typeof document === 'undefined' || selectionLock === null)
      return

    const style = document.body.style as CSSStyleDeclaration & { webkitUserSelect?: string }
    style.userSelect = selectionLock.userSelect
    style.webkitUserSelect = selectionLock.webkitUserSelect
    selectionLock = null
  }

  let escapeAttached = false

  function attachEscape(): void {
    if (escapeAttached || typeof window === 'undefined')
      return

    // Браузер `pointercancel` на `Esc` не шлёт, поэтому слушаем сами — в capture,
    // как это делает `useDragSort`.
    window.addEventListener('keydown', onEscape, true)
    escapeAttached = true
  }

  function detachEscape(): void {
    if (!escapeAttached || typeof window === 'undefined')
      return

    window.removeEventListener('keydown', onEscape, true)
    escapeAttached = false
  }

  function resolveSpot(point: GrTransferPoint): void {
    const active = session.value
    if (!active)
      return

    const side = sideAtPoint(
      { source: rectOf(options.panelEl('source')), target: rectOf(options.panelEl('target')) },
      point,
    ) ?? lastSide

    if (side === null) {
      spot.value = null
      return
    }

    lastSide = side

    if (side === active.side && !options.allowSameSide(side)) {
      spot.value = null
      return
    }

    const keys = options.visibleKeys(side)
    const spans = keys.map((key) => {
      const box = options.rowEl(side, key)?.getBoundingClientRect()

      return { start: box?.top ?? 0, end: box?.bottom ?? 0 }
    })

    spot.value = { side, before: dropBefore(keys, spans, point.y) }
  }

  const drag = useDragGesture({
    disabled: options.disabled,
    onMove: (event) => {
      cursor = { x: event.clientX, y: event.clientY }
      pointer.value = cursor

      if (session.value === null) {
        if (pending === null || !passedThreshold(origin, cursor))
          return

        session.value = pending
        moved.value = true
        lockSelection()
        attachEscape()
        scheduleAutoScroll()
      }

      // Против выделения текста строк во время протяжки.
      event.preventDefault()
      resolveSpot(cursor)
    },
    onEnd: () => {
      const active = session.value
      const target = spot.value

      if (active && target)
        options.onDrop(active, target)

      reset()
    },
    onCancel: () => {
      if (session.value !== null)
        options.onCancel?.()

      reset()
    },
  })

  /** Объявлен после `drag`: слушатель `Esc` вешается раньше и зовёт его косвенно. */
  function abort(): void {
    drag.stop(false)
  }

  onScopeDispose(reset)

  return {
    session,
    spot,
    pointer,
    consumeClick: () => {
      const was = moved.value
      moved.value = false

      return was
    },
    startFrom: (side, key) => (event) => {
      // Пальцем панель прокручивают: отбирать вертикальную ось у скроллера ради
      // жеста, у которого есть работающий эквивалент кнопкой, — плохой обмен.
      if (event.pointerType === 'touch' || options.disabled())
        return

      const block = options.blockFor(side, key)
      if (block.length === 0)
        return

      origin = { x: event.clientX, y: event.clientY }
      pending = { side, keys: block }
      moved.value = false
      drag.start(event)
    },
    cancel: () => drag.stop(false),
  }
}
