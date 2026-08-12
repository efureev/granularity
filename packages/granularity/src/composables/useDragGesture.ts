import type { Ref } from 'vue'
import { onScopeDispose, ref } from 'vue'

/**
 * Скелет указательного жеста: нажал, повёл, отпустил.
 *
 * Механика написана в пакете дважды дословно (`GrSlider`, `GrSplitter`) и
 * ещё раз иначе (`GrImageViewer`), а следующие потребители известны заранее —
 * swipe у `GrToaster`, перенос узла в `GrTree`, ресайз колонок `GrDataTable`.
 * Дублируется при этом не разметка, а **правило**: оборванный жест не
 * коммитит. Живя в двух копиях, оно разъезжается молча.
 *
 * Слушатели вешаются на `window`, а не на элемент: указатель уходит за
 * границы дорожки и разделителя постоянно, и жест обязан это переживать.
 * Захват (`setPointerCapture`) дал бы то же самое, но привязал бы жест к
 * живому DOM-узлу — а он в середине жеста может перерисоваться.
 *
 * У жеста **два разных исхода**, и это главное, ради чего примитив заведён:
 * `pointerup` — завершение (значение коммитится), `pointercancel` — обрыв
 * (браузер забрал указатель: системный жест, скролл, потеря окна), и тогда
 * состояние возвращается к тому, что было до нажатия.
 *
 * Осознанно **не** делает:
 * - не вызывает `preventDefault` — в слайдере и сплиттере это гашение
 *   выделения текста, а в панорамировании картинки помешало бы; строка
 *   дешевле опции, меняющей поведение невидимо;
 * - не считает координаты и дельты — это доменная арифметика компонента;
 * - не знает про порог начала жеста: он нужен сортировке, где нажатие ещё не
 *   означает перенос, и появится вместе с ней.
 *
 * ```ts
 * const drag = useDragGesture({
 *   disabled: () => isDisabled.value,
 *   onStart: (event) => { activeThumb.value = nearestThumb(event) },
 *   onMove: (event) => setValue(valueFromPointer(event), false),
 *   onEnd: () => commit(),
 *   onCancel: () => rollback(),
 * })
 *
 * <div @pointerdown="drag.start" />
 * ```
 */
export interface UseDragGestureOptions {
  /** Жест не начинается: `disabled` / `readonly`. */
  disabled?: () => boolean
  /**
   * Нажатие прошло проверки. Вернуть `false` — жест не начинать: так
   * отсеивается попадание мимо цели, когда `disabled` тут ни при чём.
   */
  onStart?: (event: PointerEvent) => boolean | void
  onMove: (event: PointerEvent) => void
  /** Жест завершён отпусканием: значение коммитится. */
  onEnd?: (event?: PointerEvent) => void
  /** Жест оборван: откат к состоянию до нажатия. */
  onCancel?: () => void
}

export interface UseDragGestureReturn {
  /** Идёт ли жест. Менять снаружи не нужно — состоянием владеет примитив. */
  isDragging: Ref<boolean>
  /** Вешается на `@pointerdown` цели. */
  start: (event: PointerEvent) => void
  /** Принудительное завершение. По умолчанию — как обрыв, без коммита. */
  stop: (commit?: boolean) => void
}

export function useDragGesture(options: UseDragGestureOptions): UseDragGestureReturn {
  const isDragging = ref(false)

  // Флаг вместо проверки `isDragging`: `detach` зовётся и из `onScopeDispose`,
  // где жеста могло не быть вовсе, — а на сервере `window` трогать нельзя.
  let attached = false

  function onPointerMove(event: PointerEvent): void {
    if (!isDragging.value) return

    options.onMove(event)
  }

  function onPointerUp(event: PointerEvent): void {
    finish(true, event)
  }

  function onPointerCancel(): void {
    finish(false)
  }

  function detach(): void {
    if (!attached) return

    attached = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerCancel)
  }

  function finish(commit: boolean, event?: PointerEvent): void {
    if (!isDragging.value) return

    isDragging.value = false
    detach()

    if (commit) options.onEnd?.(event)
    else options.onCancel?.()
  }

  function start(event: PointerEvent): void {
    if (isDragging.value) return
    if (options.disabled?.()) return
    // Только основная кнопка: правый и средний клик перетаскиванием не считаются.
    if (event.button !== 0) return
    if (options.onStart?.(event) === false) return

    isDragging.value = true
    attached = true
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
  }

  function stop(commit = false): void {
    finish(commit)
  }

  // Область умерла посреди жеста: слушатели снимаются, но обработчики не
  // зовутся — коммитить и откатывать уже некому и некуда.
  onScopeDispose(() => {
    detach()
    isDragging.value = false
  })

  return { isDragging, start, stop }
}
