import type { Ref } from 'vue'
import { onBeforeUnmount, watch } from 'vue'

export interface UseSubmenuHoverOptions {
  /** Раскрытая панель подменю — к ней ведёт коридор. */
  panel: () => HTMLElement | null
  isOpen: () => boolean
  open: () => void
  close: () => void
  openDelay: () => number
  closeDelay: () => number
  /** Общий на уровень признак «курсор идёт к раскрытой панели». */
  travelling?: Ref<boolean>
  /**
   * Раскрыто ли подменю уровнем ниже. Пока раскрыто, закрываться нельзя: панель
   * следующего уровня — брат этой в портале, и курсор, уходя туда, покидает
   * эту — а закрывшись, она унесла бы с собой ту, в которую он как раз идёт.
   */
  blocked?: () => boolean
}

export interface UseSubmenuHoverReturn {
  onTriggerEnter: () => void
  onTriggerLeave: (event: MouseEvent | PointerEvent) => void
  onPanelEnter: () => void
  onPanelLeave: () => void
  /** Отложенное закрытие после того, как подменю уровнем ниже ушло. */
  settle: () => void
  /** Снять таймеры и слушателя: закрытие подменю, размонтирование. */
  stop: () => void
}

type Point = { x: number, y: number }

/**
 * Потолок жизни коридора. Курсор, замерший внутри треугольника, иначе держал бы
 * подменю открытым бесконечно — и пункт под курсором не открыл бы своё.
 */
const CORRIDOR_MAX_MS = 320

/** Ближний край панели раздаётся на пару пикселей: коридор не должен рваться о границу. */
const EDGE_PADDING_PX = 4

/**
 * Высота устья коридора у точки ухода.
 *
 * Без неё коридор — треугольник с вершиной ровно там, где курсор покинул пункт,
 * и первое же движение в полпикселя от неё оказывается «мимо»: у вершины клин
 * шириной в ноль. Замерено: уход в (461, 474), следующее событие в
 * (461.6, 474.8) — снаружи, коридор рвался, не начавшись.
 */
const MOUTH_PADDING_PX = 16

function sign(a: Point, b: Point, c: Point): number {
  return (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y)
}

/** Точка внутри треугольника — по совпадению знаков трёх ориентаций. */
export function isPointInTriangle(point: Point, a: Point, b: Point, c: Point): boolean {
  const d1 = sign(point, a, b)
  const d2 = sign(point, b, c)
  const d3 = sign(point, c, a)

  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0

  return !(hasNegative && hasPositive)
}

/**
 * Наведение на подменю с безопасным коридором.
 *
 * Задача не в задержках: путь курсора от пункта к его подменю идёт наискось и
 * проходит по соседним пунктам. Закрывать подменю по `mouseleave` с пункта —
 * значит терять его на полпути, а открывать соседнее по `mouseenter` — уводить
 * пользователя не туда. Поэтому пока курсор внутри треугольника «точка ухода →
 * ближний край раскрытой панели», уход считается движением к цели, а не от неё.
 */
export function useSubmenuHover(options: UseSubmenuHoverOptions): UseSubmenuHoverReturn {
  let openTimer: ReturnType<typeof setTimeout> | undefined
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  let corridorTimer: ReturnType<typeof setTimeout> | undefined
  let corridor: { mouth: [Point, Point], near: [Point, Point] } | null = null
  let hovered = false
  /** Закрытие, отложенное до ухода подменю уровнем ниже. */
  let deferredClose = false

  function clearTimers(): void {
    clearTimeout(openTimer)
    clearTimeout(closeTimer)
    openTimer = undefined
    closeTimer = undefined
  }

  function endCorridor(): void {
    clearTimeout(corridorTimer)
    corridorTimer = undefined

    if (!corridor)
      return

    corridor = null
    if (options.travelling)
      options.travelling.value = false

    if (typeof window !== 'undefined')
      window.removeEventListener('pointermove', onPointerMove)
  }

  function scheduleClose(): void {
    clearTimeout(closeTimer)
    closeTimer = setTimeout(() => {
      closeTimer = undefined

      if (options.blocked?.()) {
        deferredClose = true
        return
      }

      endCorridor()
      options.close()
    }, Math.max(0, options.closeDelay()))
  }

  /**
   * Подменю уровнем ниже ушло — пора выполнить отложенное закрытие.
   *
   * Возвращение курсора сюда снимает отложенность на входе (`onTriggerEnter`,
   * `onPanelEnter`), поэтому проверять его здесь второй раз незачем.
   */
  function settle(): void {
    if (!deferredClose)
      return

    deferredClose = false
    endCorridor()
    options.close()
  }

  function onPointerMove(event: PointerEvent): void {
    if (!corridor)
      return

    // Коридор — четырёхугольник, а не треугольник, и проверяется двумя
    // треугольниками: устье у точки ухода, дальняя сторона — ближний край панели.
    const point = { x: event.clientX, y: event.clientY }
    const [mouthTop, mouthBottom] = corridor.mouth
    const [nearTop, nearBottom] = corridor.near
    const inside = isPointInTriangle(point, mouthTop, nearTop, nearBottom)
      || isPointInTriangle(point, mouthTop, nearBottom, mouthBottom)

    if (inside) {
      // Пока курсор в коридоре, отложенное закрытие не должно сработать.
      clearTimeout(closeTimer)
      closeTimer = undefined
      return
    }

    endCorridor()
    scheduleClose()
  }

  /**
   * Коридор строится от точки ухода к ближнему краю панели — левому или
   * правому, смотря куда панель перевернулась при нехватке места.
   */
  function startCorridor(origin: Point): void {
    if (typeof window === 'undefined')
      return

    const rect = options.panel()?.getBoundingClientRect()
    if (!rect || rect.width === 0)
      return

    const nearX = Math.abs(rect.left - origin.x) <= Math.abs(rect.right - origin.x)
      ? rect.left - EDGE_PADDING_PX
      : rect.right + EDGE_PADDING_PX

    corridor = {
      mouth: [
        { x: origin.x, y: origin.y - MOUTH_PADDING_PX },
        { x: origin.x, y: origin.y + MOUTH_PADDING_PX },
      ],
      near: [
        { x: nearX, y: rect.top - EDGE_PADDING_PX },
        { x: nearX, y: rect.bottom + EDGE_PADDING_PX },
      ],
    }

    if (options.travelling)
      options.travelling.value = true

    window.addEventListener('pointermove', onPointerMove)

    corridorTimer = setTimeout(() => {
      corridorTimer = undefined
      endCorridor()
      scheduleClose()
    }, CORRIDOR_MAX_MS)
  }

  function scheduleOpen(): void {
    const delay = Math.max(0, options.openDelay())
    if (delay === 0) {
      options.open()
      return
    }

    openTimer = setTimeout(() => {
      openTimer = undefined
      options.open()
    }, delay)
  }

  function onTriggerEnter(): void {
    hovered = true
    clearTimers()

    // Вернулись на свой же пункт — ни коридор, ни отложенное закрытие больше не
    // нужны: курсор здесь, а не на пути отсюда.
    if (options.isOpen()) {
      deferredClose = false
      endCorridor()
      return
    }

    // Чужой коридор сильнее: курсор идёт к уже раскрытой панели, а этот пункт
    // просто оказался у него на пути. Раскрытие не отменяется, а откладывается
    // до конца коридора: `mouseenter` браузер отдаёт **до** первого `pointermove`
    // на новом элементе, и отказ здесь означал бы пункт, который не
    // открывается, пока курсор с него не уйдёт и не вернётся.
    if (options.travelling?.value)
      return

    scheduleOpen()
  }

  function onTriggerLeave(event: MouseEvent | PointerEvent): void {
    hovered = false
    clearTimeout(openTimer)
    openTimer = undefined

    if (!options.isOpen())
      return

    startCorridor({ x: event.clientX, y: event.clientY })
    scheduleClose()
  }

  function onPanelEnter(): void {
    deferredClose = false
    clearTimers()
    endCorridor()
  }

  function onPanelLeave(): void {
    scheduleClose()
  }

  /**
   * Отложенное раскрытие соседа. `flush: 'sync'` не мелочь: конец коридора и
   * раскрытие — одна цепочка событий указателя, и отложи её планировщик Vue до
   * следующего тика, порядок с таймерами зависел бы от того, успел ли кто-то
   * дождаться отрисовки.
   */
  if (options.travelling) {
    watch(options.travelling, (value) => {
      if (!value && hovered && !options.isOpen())
        scheduleOpen()
    }, { flush: 'sync' })
  }

  function stop(): void {
    deferredClose = false
    clearTimers()
    endCorridor()
  }

  onBeforeUnmount(stop)

  return { onTriggerEnter, onTriggerLeave, onPanelEnter, onPanelLeave, settle, stop }
}
