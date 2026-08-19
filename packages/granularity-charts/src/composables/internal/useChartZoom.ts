import type { Ref } from 'vue'
import { computed, onScopeDispose, ref } from 'vue'

import { useDragGesture } from '@feugene/granularity/composables/useDragGesture'

import type { Rect } from '../../chart/chartLayout'
import type { GrChartScale } from '../../chart/chartScale'
import type { GrChartXWindow } from '../../chart/chartZoom'
import { clampWindow, smallestGap, windowFromPixels, zoomWindow } from '../../chart/chartZoom'

/**
 * Приближение по абсциссе: протяжка и колесо.
 *
 * Композабл только **производит окно** и не хранит его: владеет окном
 * компонент, потому что окно уходит в нормализацию данных и наружу через
 * `v-model`. Здесь — перевод жеста в пару чисел домена.
 *
 * Внутренний: наружу пакет отдаёт не жест, а пропы `zoom` и `xWindow`.
 */

export type GrChartZoom = false | 'brush' | 'wheel' | 'both'

/**
 * Ход короче четырёх пикселей — это клик, а не протяжка.
 *
 * У `useDragGesture` порога нет by design, а клик по графику обязан
 * по-прежнему выбирать точку. Величина та же, что у сортировки ядра и у
 * переноса виджетов дашборда: расходиться им незачем.
 */
const DRAG_THRESHOLD_PX = 4

/** Пиксели на «щелчок» колеса при `deltaMode` в строках и в страницах. */
const LINE_HEIGHT_PX = 16
const PAGE_HEIGHT_PX = 400

const WHEEL_SENSITIVITY = 0.0015
const WHEEL_STEP_LIMIT = 2

/** Шаг `+`/`-`. Взаимно обратные множители: приблизил и отдалил — вернулся туда же. */
const KEY_ZOOM_STEP = 0.8

/** Сдвиг `Shift`+стрелка — четверть окна: шаг заметен, но не теряет контекст. */
const KEY_PAN_FRACTION = 0.25

export interface UseChartZoomOptions {
  mode: () => GrChartZoom
  /** Элемент, по которому считается координата указателя. */
  surface: Ref<HTMLElement | null>
  plot: () => Rect
  xScale: () => GrChartScale
  /** Позиции текущего окна — по ним считается пол приближения. */
  positions: () => readonly number[]
  /** Размах всего ряда: от него отмеряется окно и в него же возвращает сброс. */
  full: () => readonly [number, number]
  window: () => GrChartXWindow | null
  apply: (next: GrChartXWindow | null) => void
  /**
   * Абсцисса курсора — якорь приближения с клавиатуры; `null` — курсора нет.
   *
   * У колеса якорь под указателем, и клавиатуре нужен свой: без него `+` всегда
   * тянул бы к середине окна, и добраться до края ряда было бы нечем.
   */
  cursor: () => number | null
}

export interface UseChartZoomReturn {
  /** Идёт протяжка: на это время тултип замолкает. */
  brushing: Ref<boolean>
  /** Полоса выделения в координатах холста; `null` — не рисуется. */
  band: Ref<{ x: number, width: number } | null>
  onPointerDown: (event: PointerEvent) => void
  onWheel: (event: WheelEvent) => void
  /** Обработал ли жест клавишу. Контракт тот же, что у `useChartA11y`. */
  onKeydown: (event: KeyboardEvent) => boolean
}

export function useChartZoom(options: UseChartZoomOptions): UseChartZoomReturn {
  const from = ref<number | null>(null)
  const to = ref<number | null>(null)

  const band = computed(() => {
    if (from.value === null || to.value === null)
      return null

    const plot = options.plot()
    const left = clampToPlot(Math.min(from.value, to.value), plot)
    const right = clampToPlot(Math.max(from.value, to.value), plot)

    return right - left < DRAG_THRESHOLD_PX ? null : { x: left, width: right - left }
  })

  const drag = useDragGesture({
    disabled: () => !allows('brush'),
    onStart: (event) => {
      // На тач-экране протяжка по холсту — это прокрутка страницы, и отнимать
      // её у пользователя ради приближения нельзя.
      if (event.pointerType === 'touch')
        return false

      const x = pointerX(event)

      if (x === null)
        return false

      from.value = x
      to.value = x
      attachEscape()

      return true
    },
    onMove: (event) => {
      const x = pointerX(event)

      if (x !== null)
        to.value = x
    },
    onEnd: () => {
      const start = from.value
      const end = to.value

      reset()

      if (start === null || end === null || Math.abs(end - start) < DRAG_THRESHOLD_PX)
        return

      const plot = options.plot()
      const scale = options.xScale()

      apply(windowFromPixels(scale, clampToPlot(start, plot), clampToPlot(end, plot)))
    },
    onCancel: reset,
  })

  function onWheel(event: WheelEvent): void {
    if (!allows('wheel'))
      return

    const x = pointerX(event)

    if (x === null)
      return

    // Гасим прокрутку страницы только тогда, когда колесо действительно наше:
    // при выключенном приближении графику под курсором место в потоке страницы.
    event.preventDefault()

    const current = options.window() ?? options.full()
    const anchor = options.xScale().invert(clampToPlot(x, options.plot()))

    apply(zoomWindow(current, wheelFactor(event), anchor))
  }

  /**
   * Приближение с клавиатуры.
   *
   * Работает всегда, когда работает `zoom`, и отдельным режимом не включается:
   * union пропа перечисляет **жесты указателя**, а клавиатура — не жест и не
   * предмет выбора. Дай её отключить — и получится ровно то нарушение
   * WCAG 2.1 SC 2.1.1, ради которого она заведена.
   */
  function onKeydown(event: KeyboardEvent): boolean {
    if (options.mode() === false)
      return false

    // `+` набирается через `Shift`, поэтому его тут нет: отсеиваются только те
    // модификаторы, за которыми стоят команды браузера и системы.
    if (event.altKey || event.ctrlKey || event.metaKey)
      return false

    switch (event.key) {
      case '+':
      case '=':
        return zoomBy(KEY_ZOOM_STEP)
      case '-':
      case '_':
        return zoomBy(1 / KEY_ZOOM_STEP)
      case '0':
        return options.window() !== null && apply(null)
      case 'ArrowLeft':
        return event.shiftKey && pan(-1)
      case 'ArrowRight':
        return event.shiftKey && pan(1)
      default:
        return false
    }
  }

  function zoomBy(factor: number): boolean {
    const current = options.window() ?? options.full()
    const anchor = options.cursor() ?? (current[0] + current[1]) / 2

    return apply(zoomWindow([current[0], current[1]], factor, anchor))
  }

  /**
   * Сдвиг окна. Клавишу забирает всегда, даже когда двигать нечего.
   *
   * Иначе `Shift`+стрелка означала бы разное в зависимости от состояния: на
   * полном ряде она проваливалась бы в карту позиций и уводила курсор, а в
   * приближении двигала окно. Одно сочетание — одно значение; на краю оно
   * просто ничего не делает, как и стрелка на краю ряда.
   */
  function pan(direction: number): boolean {
    const current = options.window()

    if (current !== null) {
      const shift = (current[1] - current[0]) * KEY_PAN_FRACTION * direction

      apply([current[0] + shift, current[1] + shift])
    }

    return true
  }

  /** `false` — окно не изменилось, и клавишу глотать не за что. */
  function apply(next: GrChartXWindow | null): boolean {
    const full = options.full()
    const clamped = next === null
      ? null
      : clampWindow(next, [full[0], full[1]], smallestGap(options.positions()))
    const current = options.window()

    if (same(clamped, current))
      return false

    options.apply(clamped)

    return true
  }

  function allows(gesture: 'brush' | 'wheel'): boolean {
    const mode = options.mode()

    return mode === 'both' || mode === gesture
  }

  function pointerX(event: PointerEvent | WheelEvent): number | null {
    const element = options.surface.value

    return element ? event.clientX - element.getBoundingClientRect().left : null
  }

  function reset(): void {
    from.value = null
    to.value = null
    detachEscape()
  }

  function onEscape(event: KeyboardEvent): void {
    if (event.key !== 'Escape')
      return

    // В фазе перехвата: незавершённая протяжка обязана съесть `Escape` раньше,
    // чем его увидит оверлей вокруг графика и закроется вместе с ним.
    event.stopPropagation()
    event.preventDefault()
    drag.stop(false)
  }

  let escapeAttached = false

  function attachEscape(): void {
    if (escapeAttached)
      return

    escapeAttached = true
    window.addEventListener('keydown', onEscape, true)
  }

  function detachEscape(): void {
    if (!escapeAttached)
      return

    escapeAttached = false
    window.removeEventListener('keydown', onEscape, true)
  }

  // `useDragGesture` на смерти области снимает свои слушатели, но `onCancel` не
  // зовёт — этот пришлось бы снимать самому.
  onScopeDispose(detachEscape)

  return { brushing: drag.isDragging, band, onPointerDown: drag.start, onWheel, onKeydown }
}

function clampToPlot(x: number, plot: Rect): number {
  return Math.min(Math.max(x, plot.x), plot.x + plot.width)
}

function wheelFactor(event: WheelEvent): number {
  const scale = event.deltaMode === 1 ? LINE_HEIGHT_PX : event.deltaMode === 2 ? PAGE_HEIGHT_PX : 1
  const factor = Math.exp(event.deltaY * scale * WHEEL_SENSITIVITY)

  // Один «щелчок» тачпада приносит десятки событий, а мышь — одно на сотню
  // пикселей: без потолка первое же движение мыши схлопывало бы ряд в точку.
  return Math.min(Math.max(factor, 1 / WHEEL_STEP_LIMIT), WHEEL_STEP_LIMIT)
}

function same(a: GrChartXWindow | null, b: GrChartXWindow | null): boolean {
  if (a === null || b === null)
    return a === b

  return a[0] === b[0] && a[1] === b[1]
}
