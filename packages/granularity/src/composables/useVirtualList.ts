import type { ComputedRef, Ref } from 'vue'
import { computed, onScopeDispose, ref, watch } from 'vue'

/**
 * Виртуализация длинного списка: в DOM живёт только окно вокруг вьюпорта.
 *
 * Композабл считает геометрию и отдаёт три числа — какой срез рисовать
 * (`range`), какой высоты держать распорку (`totalSize`) и на сколько сдвинуть
 * отрисованное (`offset`). Разметку строит потребитель: примитив ничего не
 * рендерит и ничего не знает про роли и клавиатуру своего списка.
 *
 * Скролл-протяжённость держат отступы контейнера, а не обёртки-распорки:
 * `paddingTop` за срезанное сверху, `paddingBottom` — за срезанное снизу. Так
 * отрисованные строки остаются **прямыми детьми** контейнера, и роль вроде
 * `tree` или `listbox` не теряет обязательных потомков.
 *
 * ```vue
 * const container = useTemplateRef('scroller')
 * const { range, totalSize, offset, offsetEnd, measure } = useVirtualList({
 *   container,
 *   count: () => rows.value.length,
 *   itemSize: 28,
 *   viewportSize: () => props.maxHeight,
 * })
 *
 * <div
 *   ref="scroller"
 *   role="tree"
 *   :style="{ overflow: 'auto', maxHeight: '280px', paddingTop: `${offset}px`, paddingBottom: `${offsetEnd}px` }"
 * >
 *   <Row v-for="i in window" :key="…" :ref="el => measure(i, el)" />
 * </div>
 * ```
 */

/** Куда поставить элемент относительно вьюпорта при прокрутке к нему. */
export type GrVirtualAlign = 'auto' | 'start' | 'center' | 'end'

export interface UseVirtualListOptions {
  /** Скроллящийся контейнер. До монтирования — `null`. */
  container: Ref<HTMLElement | null>
  /** Сколько элементов в списке. */
  count: () => number
  /**
   * Оценка высоты элемента. Фактическая берётся из замера, как только элемент
   * отрисован, — строки пакета заданы через `min-height`, и точного числа тут
   * знать неоткуда.
   */
  itemSize: number | ((index: number) => number)
  /**
   * Высота вьюпорта до первого замера контейнера. Нужна, чтобы **первый рендер
   * был детерминированным**: на сервере контейнера нет вовсе, а на клиенте он
   * ещё не измерен. Без неё сервер и клиент нарисовали бы разные окна и
   * гидрация разъехалась бы; с ней оба считают окно от одного числа.
   */
  viewportSize?: () => number | undefined
  /**
   * Зазор между элементами в пикселях (`gap` у flex/grid-контейнера).
   *
   * Замер элемента его не видит — `getBoundingClientRect` меряет коробку, а не
   * шаг раскладки. Без этого числа список считался бы короче, чем он есть,
   * и окно уползало бы тем сильнее, чем дальше прокрутка.
   */
  gap?: number
  /** Сколько элементов рисовать за пределами вьюпорта. По умолчанию `4`. */
  overscan?: number
}

export interface UseVirtualListReturn {
  /** Полуинтервал индексов к отрисовке: `[start, end)`. */
  range: ComputedRef<{ start: number, end: number }>
  /** Полная высота содержимого: распорка, которая держит скроллбар. */
  totalSize: ComputedRef<number>
  /** Отступ сверху: высота срезанного до окна. */
  offset: ComputedRef<number>
  /** Отступ снизу: высота срезанного после окна. */
  offsetEnd: ComputedRef<number>
  /** Регистрация отрисованного элемента: замер и подписка на изменение высоты. */
  measure: (index: number, el: Element | null) => void
  /** Прокрутка к элементу. Без выравнивания — минимальным движением. */
  scrollToIndex: (index: number, align?: GrVirtualAlign) => void
}

const DEFAULT_OVERSCAN = 4

/** Порог, ниже которого разницу замеров считаем шумом округления. */
const SIZE_EPSILON = 0.5

function readSize(el: Element): number {
  const box = el.getBoundingClientRect().height
  if (box > 0) return box

  // jsdom не считает layout: `getBoundingClientRect` там всегда нулевой, а
  // `offsetHeight` тест может задать сам.
  return (el as HTMLElement).offsetHeight ?? 0
}

export function useVirtualList(options: UseVirtualListOptions): UseVirtualListReturn {
  const overscan = Math.max(0, Math.trunc(options.overscan ?? DEFAULT_OVERSCAN))
  const gap = Math.max(0, options.gap ?? 0)
  const estimateOf = typeof options.itemSize === 'function'
    ? options.itemSize
    : () => options.itemSize as number

  const scrollTop = ref(0)
  const measuredViewport = ref(0)

  const measured = new Map<number, number>()
  const observedIndex = new WeakMap<Element, number>()

  // `ResizeObserver` нет ни на сервере, ни в jsdom. Без него композабл работает
  // на оценках и явных замерах из `measure()` — это рабочий режим, а не отказ.
  const hasResizeObserver = typeof ResizeObserver !== 'undefined'
  const sizeObserver = hasResizeObserver
    ? new ResizeObserver((entries) => {
        for (const entry of entries) {
          const index = observedIndex.get(entry.target)
          if (index !== undefined) applySize(index, readSize(entry.target))
        }
      })
    : null
  const viewportObserver = hasResizeObserver ? new ResizeObserver(() => syncViewport()) : null
  let attachedTo: HTMLElement | null = null
  let offsets: number[] = [0]
  /** До какого индекса префикс-суммы актуальны. */
  let builtTo = 0

  /** Шаг раскладки: коробка элемента плюс зазор до следующего. */
  function sizeAt(index: number): number {
    return (measured.get(index) ?? estimateOf(index)) + gap
  }

  /**
   * Достраивает префикс-суммы до нужного индекса.
   *
   * Замер инвалидирует хвост от своего индекса, а не весь массив: иначе каждая
   * отрисованная строка стоила бы полного пересчёта по всему списку.
   */
  function buildTo(index: number): void {
    const limit = Math.min(index, options.count())
    while (builtTo < limit) {
      offsets[builtTo + 1] = offsets[builtTo] + sizeAt(builtTo)
      builtTo += 1
    }
  }

  function offsetAt(index: number): number {
    buildTo(index)
    return offsets[Math.min(Math.max(index, 0), builtTo)] ?? 0
  }

  function invalidateFrom(index: number): void {
    if (index < builtTo) builtTo = Math.max(0, index)
  }

  /** Последний индекс, чьё начало не ниже `px`. */
  function indexAt(px: number): number {
    const count = options.count()
    if (count === 0) return 0

    buildTo(count)

    let low = 0
    let high = builtTo
    while (low < high) {
      const mid = (low + high + 1) >> 1
      if ((offsets[mid] ?? 0) <= px) low = mid
      else high = mid - 1
    }

    return Math.min(low, count - 1)
  }

  function viewportSize(): number {
    return measuredViewport.value || options.viewportSize?.() || 0
  }

  /**
   * Геометрия окна одним снимком.
   *
   * Считается явно, а не `computed`'ом поверх смещений: массив префикс-сумм
   * мутируется на месте (иначе каждый замер пересоздавал бы десять тысяч чисел),
   * и вывести из него реактивную зависимость нечем — трекер увидел бы только те
   * индексы, которые пересчитывались в последний проход.
   */
  const geometry = ref({ start: 0, end: 0, offset: 0, offsetEnd: 0, total: 0 })

  function recompute(): void {
    const count = options.count()
    if (count === 0) {
      geometry.value = { start: 0, end: 0, offset: 0, offsetEnd: 0, total: 0 }
      return
    }

    const totalSize = offsetAt(count)
    const height = viewportSize()

    // Высота неизвестна (контейнера нет и оценки не дали) — рисуем всё: меньше
    // «списка целиком» отрисовать нечего без риска, что до замера так и не
    // дойдёт ни одна строка.
    if (height <= 0) {
      geometry.value = { start: 0, end: count, offset: 0, offsetEnd: 0, total: totalSize }
      return
    }

    const start = Math.max(0, indexAt(scrollTop.value) - overscan)
    const end = Math.min(count, indexAt(scrollTop.value + height) + 1 + overscan)

    geometry.value = {
      start,
      end,
      offset: offsetAt(start),
      offsetEnd: Math.max(0, totalSize - offsetAt(end)),
      total: totalSize,
    }
  }

  const range = computed(() => ({ start: geometry.value.start, end: geometry.value.end }))
  const total = computed(() => geometry.value.total)
  const offset = computed(() => geometry.value.offset)
  const offsetEnd = computed(() => geometry.value.offsetEnd)

  function syncScrollTop(): void {
    const el = options.container.value
    if (!el) return

    scrollTop.value = el.scrollTop
    recompute()
  }

  function syncViewport(): void {
    const el = options.container.value
    if (!el) return

    measuredViewport.value = el.clientHeight
    recompute()
  }

  function measure(index: number, el: Element | null): void {
    if (!el) return

    observedIndex.set(el, index)
    sizeObserver?.observe(el)

    applySize(index, readSize(el))
  }

  function applySize(index: number, size: number): void {
    if (size <= 0) return

    const previous = measured.get(index)
    if (previous !== undefined && Math.abs(previous - size) < SIZE_EPSILON) return

    // Считаем смещение ДО правки: строка ниже вьюпорта позицию не двигает, а
    // строка выше — двигает всё содержимое под курсором.
    const start = offsetAt(index)
    const delta = size - (previous ?? estimateOf(index))

    measured.set(index, size)
    invalidateFrom(index)

    const el = options.container.value
    // Компенсация: без неё уточнение высоты уже прокрученных строк выглядит как
    // рывок списка вверх или вниз ровно в момент замера.
    if (delta !== 0 && start < scrollTop.value && el) {
      el.scrollTop += delta
      scrollTop.value = el.scrollTop
    }

    recompute()
  }

  function scrollToIndex(index: number, align: GrVirtualAlign = 'auto'): void {
    const el = options.container.value
    const count = options.count()
    if (!el || count === 0) return

    const clamped = Math.min(Math.max(index, 0), count - 1)
    const start = offsetAt(clamped)
    const size = sizeAt(clamped)
    const height = el.clientHeight || viewportSize()
    const end = start + size

    let next: number
    switch (align) {
      case 'start':
        next = start
        break
      case 'end':
        next = end - height
        break
      case 'center':
        next = start + size / 2 - height / 2
        break
      case 'auto':
        if (start < el.scrollTop) next = start
        else if (end > el.scrollTop + height) next = end - height
        else return
        break
    }

    el.scrollTop = Math.max(0, Math.min(next, offsetAt(count) - height))
    scrollTop.value = el.scrollTop
    recompute()
  }

  function detach(): void {
    if (!attachedTo) return
    attachedTo.removeEventListener('scroll', syncScrollTop)
    viewportObserver?.unobserve(attachedTo)
    attachedTo = null
  }

  // Первый снимок до всякого монтирования: на сервере и на первом клиентском
  // рендере контейнера ещё нет, а окно уже должно быть посчитано — и одинаково.
  recompute()

  watch(options.container, (el) => {
    detach()
    if (!el) return

    attachedTo = el
    el.addEventListener('scroll', syncScrollTop, { passive: true })
    viewportObserver?.observe(el)
    syncViewport()
    syncScrollTop()
  }, { immediate: true })

  // Длина списка изменилась. Сокращение дополнительно чистит хвост смещений и
  // замеров: он относится к строкам, которых больше нет.
  watch(() => options.count(), (count) => {
    if (count < builtTo) truncate(count)
    recompute()
  })

  function truncate(count: number): void {
    builtTo = count
    offsets = offsets.slice(0, count + 1)
    for (const index of [...measured.keys()]) {
      if (index >= count) measured.delete(index)
    }
  }

  onScopeDispose(() => {
    detach()
    sizeObserver?.disconnect()
    viewportObserver?.disconnect()
  })

  return { range, totalSize: total, offset, offsetEnd, measure, scrollToIndex }
}
