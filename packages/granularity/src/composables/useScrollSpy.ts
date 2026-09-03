import type { Ref } from 'vue'
import { onMounted, onScopeDispose, readonly, ref, watch } from 'vue'

import {
  activeSectionId,
  isScrollableOverflow,
  isScrolledToEnd,
  scrollSpyRootMargin,
  scrollSpyTargetTop,
} from './internal/scrollSpyGeometry'

/**
 * Отслеживание того, до какого раздела дочитали.
 *
 * Композабл владеет всем, что следует из **положения прокрутки**: линией
 * активации, выбором раздела, прокруткой к нему и закрепом на время этой
 * прокрутки. Всё, что следует из того, что пункт оглавления является
 * **ссылкой** — разметка, `aria-current`, модификаторы клика, — остаётся у
 * компонента `GrScrollSpy`.
 *
 * ```ts
 * const spy = useScrollSpy({
 *   sections: () => ids.value,
 *   offset: () => headerHeight.value,
 *   onChange: id => emit('activeChange', id),
 * })
 * ```
 */

export interface UseScrollSpyOptions {
  /**
   * Идентификаторы разделов. Порядок задаёт порядок пунктов у потребителя, но
   * на ответ не влияет: активный выбирается по геометрии.
   */
  sections: () => readonly string[]
  /**
   * Элемент раздела. По умолчанию — `document.getElementById`.
   *
   * Дефолт не догадка: идентификаторы разделов и есть цели ссылок `#id`, то
   * есть DOM-id по определению жанра.
   */
  elementFor?: (id: string) => HTMLElement | null | undefined
  /** Скроллпорт. Не задан — ищется от первого раздела, не найден — документ. */
  scroller?: () => HTMLElement | null | undefined
  /**
   * Отступ линии активации от верха скроллпорта, **в пикселях**.
   *
   * Именно число, а не CSS-длина: резолв `4rem` или `var(...)` требует
   * `getComputedStyle`, то есть DOM, — а композабл обязан оставаться
   * проверяемым без него. Длину резолвит потребитель.
   */
  offset?: () => number
  /** Наблюдение выключено: `active` сбрасывается в `null`. */
  disabled?: () => boolean
  /** Активный сменился. Зовётся на смене, а не на каждой записи наблюдателя. */
  onChange?: (id: string | null, previous: string | null) => void
}

export interface UseScrollSpyReturn {
  /** Активный раздел. `null` — линия ещё не дошла до первого. */
  active: Readonly<Ref<string | null>>
  /** Прокрутить к разделу и закрепить его активным до следующей прокрутки. */
  scrollTo: (id: string, options?: { behavior?: ScrollBehavior }) => void
  /** Перечитать отступ, скроллпорт и геометрию. */
  refresh: () => void
  /** Закрепить активным вручную: страницу прокручивает не оглавление. */
  pin: (id: string | null) => void
}

/**
 * Порог простоя прокрутки, после которого она считается осевшей.
 *
 * Не догадка о длительности анимации — длину плавной прокрутки браузер
 * выбирает сам от расстояния, и любой фиксированный таймаут либо короток, либо
 * длинен. Это стандартный полифилл `scrollend`: порог обязан превышать
 * межкадровый интервал потока событий с запасом на джанк и оставаться короче
 * осмысленной паузы пользователя.
 */
const SETTLE_IDLE_MS = 120

/** Насколько близко к цели считается «доехали». */
const SETTLE_EPSILON = 2

export function useScrollSpy(options: UseScrollSpyOptions): UseScrollSpyReturn {
  const active = ref<string | null>(null)

  let observer: IntersectionObserver | null = null
  /** Идёт ли наблюдение: без него выводить активный раздел не из чего. */
  let observing = false
  /** Элемент, чей `scrollTop` двигаем. Для окна — `document.scrollingElement`. */
  let portEl: HTMLElement | null = null
  /** Корень наблюдателя: `null` для вьюпорта. */
  let portRoot: Element | null = null
  /** Куда вешать `scroll`: на элемент или на документ. */
  let portEvents: EventTarget | null = null
  let isDocumentPort = true

  let appliedOffsetPx = 0
  let lastAtEnd = false

  let pinnedId: string | null = null
  let pendingTop: number | null = null
  let settled = true
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  const warnedMissing = new Set<string>()

  function element(id: string): HTMLElement | null {
    const custom = options.elementFor?.(id)
    if (custom !== undefined)
      return custom ?? null

    return typeof document === 'undefined' ? null : document.getElementById(id)
  }

  function portTop(): number {
    if (!portEl)
      return 0

    return isDocumentPort ? 0 : portEl.getBoundingClientRect().top
  }

  function portMaxScroll(): number {
    return portEl ? portEl.scrollHeight - portEl.clientHeight : 0
  }

  function measureOffset(): number {
    const value = options.offset?.() ?? 0

    return Number.isFinite(value) ? Math.max(0, value) : 0
  }

  /**
   * Скроллпорт ищется от **первого раздела**, а не от места вызова: оглавление
   * обычно стоит рядом с содержимым, отдельной колонкой, и обход предков от
   * него привёл бы не туда. Скроллпорт определяют разделы, за ними и следим.
   *
   * Документ представляем через `document.scrollingElement`, а не через
   * `window`: так остаётся один кодовый путь для окна и для коробки, и клик
   * становится проверяемым — `window.scrollTo` в jsdom заглушка, печатающая
   * «Not implemented», а `Element.scrollTop` там обычное хранимое свойство.
   */
  function resolvePort(): void {
    const explicit = options.scroller?.()

    if (explicit) {
      portEl = explicit
      portRoot = explicit
      portEvents = explicit
      isDocumentPort = false

      return
    }

    if (typeof document !== 'undefined' && typeof getComputedStyle === 'function') {
      const ids = options.sections()
      const first = ids.length > 0 ? element(ids[0]) : null
      let current = first?.parentElement ?? null

      // До `<body>`, не включая его: `useScrollLock` вешает на него
      // `overflow: hidden` на время открытой модалки.
      while (current && current !== document.body) {
        if (isScrollableOverflow(getComputedStyle(current).overflowY)) {
          portEl = current
          portRoot = current
          portEvents = current
          isDocumentPort = false

          return
        }

        current = current.parentElement
      }
    }

    // `scrollingElement` предпочтителен, но существует не везде — в jsdom его нет
    // вовсе, и без фолбэка прокрутка молча не выполнялась бы, а тест этого не
    // увидел бы: ранний выход исключения не бросает.
    portEl = (typeof document === 'undefined'
      ? null
      : document.scrollingElement ?? document.documentElement) as HTMLElement | null
    // `null`, а не `documentElement`: по спецификации это разные корни, и Safari
    // исторически расходился на втором.
    portRoot = null
    portEvents = typeof document === 'undefined' ? null : document
    isDocumentPort = true
  }

  function setActive(next: string | null): void {
    if (next === active.value)
      return

    const previous = active.value
    active.value = next
    options.onChange?.(next, previous)
  }

  function warnMissing(id: string): void {
    if (!__GR_DEV__ || warnedMissing.has(id))
      return

    warnedMissing.add(id)
    console.warn(
      `[granularity] useScrollSpy: раздела #${id} нет в документе — пункт оглавления `
      + 'останется неактивным, а клик по нему ничего не сделает. Обычно это опечатка в '
      + 'идентификаторе; если раздел дорисовывается позже, предупреждение можно не читать.',
    )
  }

  function recompute(): void {
    if (pinnedId !== null)
      return

    // Не наблюдаем — значит не знаем. Один замер на монтировании был бы верен
    // ровно до первой прокрутки, а дальше подсветка врала бы молча.
    if (!observing) {
      setActive(null)

      return
    }

    const rects: { id: string, top: number }[] = []

    for (const id of options.sections()) {
      const el = element(id)

      if (!el) {
        warnMissing(id)
        continue
      }

      rects.push({ id, top: el.getBoundingClientRect().top })
    }

    setActive(activeSectionId(rects, portTop() + appliedOffsetPx, lastAtEnd))
  }

  function clearIdleTimer(): void {
    if (idleTimer !== null) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
  }

  function restartIdleTimer(): void {
    clearIdleTimer()
    idleTimer = setTimeout(() => {
      idleTimer = null
      settled = true
    }, SETTLE_IDLE_MS)
  }

  function unpin(): void {
    if (pinnedId === null)
      return

    pinnedId = null
    pendingTop = null
    settled = true
    clearIdleTimer()
    recompute()
  }

  function onScroll(): void {
    const top = portEl?.scrollTop ?? 0
    const atEnd = isScrolledToEnd(top, portMaxScroll())

    if (atEnd !== lastAtEnd) {
      lastAtEnd = atEnd
      recompute()
    }

    if (pinnedId === null)
      return

    // Отпускаем на первом событии прокрутки **после** того, как она осела. Это
    // и есть ответ на перетаскивание полосы прокрутки: ни `wheel`, ни
    // `touchstart` там не приходят, а `scroll` есть всегда.
    if (settled) {
      unpin()

      return
    }

    if (pendingTop !== null && Math.abs(top - pendingTop) <= SETTLE_EPSILON) {
      settled = true

      return
    }

    if (!hasScrollEnd())
      restartIdleTimer()
  }

  function onScrollEnd(): void {
    settled = true
  }

  /**
   * Пользователь перехватил прокрутку. Закреп снимается немедленно: браузер
   * плавную прокрутку в этот момент отменяет, и цели мы не достигнем никогда.
   */
  function onUserScrollIntent(): void {
    unpin()
  }

  function hasScrollEnd(): boolean {
    return typeof window !== 'undefined' && 'onscrollend' in window
  }

  function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
  }

  function detach(): void {
    observer?.disconnect()
    observer = null
    observing = false
    clearIdleTimer()

    if (portEvents) {
      portEvents.removeEventListener('scroll', onScroll)
      portEvents.removeEventListener('scrollend', onScrollEnd)
      portEvents.removeEventListener('wheel', onUserScrollIntent)
      portEvents.removeEventListener('touchstart', onUserScrollIntent)
      portEvents.removeEventListener('keydown', onUserScrollIntent)
    }
  }

  function attach(): void {
    detach()

    if (options.disabled?.() === true) {
      pinnedId = null
      pendingTop = null
      setActive(null)

      return
    }

    resolvePort()
    appliedOffsetPx = measureOffset()
    lastAtEnd = isScrolledToEnd(portEl?.scrollTop ?? 0, portMaxScroll())

    if (portEvents) {
      portEvents.addEventListener('scroll', onScroll, { passive: true })
      portEvents.addEventListener('scrollend', onScrollEnd)
      portEvents.addEventListener('wheel', onUserScrollIntent, { passive: true })
      portEvents.addEventListener('touchstart', onUserScrollIntent, { passive: true })
      portEvents.addEventListener('keydown', onUserScrollIntent)
    }

    // Наблюдателя может не быть вовсе (сервер, jsdom, старый движок). Тогда
    // подсветки нет, и это правильная деградация: подсветить первый раздел
    // значило бы поставить `aria-current` на пункт, который активным не
    // является, — то есть солгать диктору. Прокрутка по клику при этом работает.
    if (typeof IntersectionObserver === 'undefined')
      return

    observing = true
    observer = new IntersectionObserver(handle, {
      root: portRoot,
      rootMargin: scrollSpyRootMargin(appliedOffsetPx),
      // Второй порог удвоил бы вызовы, не создав ни одной новой развилки:
      // ответ считается по прямоугольникам, а не по доле пересечения.
      threshold: 0,
    })

    for (const id of options.sections()) {
      const el = element(id)

      if (el)
        observer.observe(el)
      else
        warnMissing(id)
    }
  }

  function handle(): void {
    recompute()

    // Самоизлечение: dev-сервер UnoCSS отдаёт правила по требованию, и в момент
    // монтирования CSS-длина отступа могла ещё не разрешиться — тогда линия
    // собрана из нуля. Пересобираем, как только замер разошёлся с применённым.
    if (measureOffset() !== appliedOffsetPx)
      attach()
  }

  function scrollTo(id: string, scrollOptions?: { behavior?: ScrollBehavior }): void {
    const el = element(id)

    if (!el || !portEl) {
      warnMissing(id)

      return
    }

    appliedOffsetPx = measureOffset()

    const top = scrollSpyTargetTop(
      portEl.scrollTop,
      el.getBoundingClientRect().top,
      portTop(),
      appliedOffsetPx,
      portMaxScroll(),
    )

    // Подсветка переезжает сразу, до всякой прокрутки: иначе она добежала бы по
    // промежуточным пунктам, пока плавная прокрутка едет к цели.
    pin(id)
    pendingTop = top
    settled = false

    const behavior = scrollOptions?.behavior ?? (prefersReducedMotion() ? 'auto' : 'smooth')

    // Не `portEl.scrollTo?.(…) ?? (portEl.scrollTop = top)`: метод возвращает
    // `undefined`, и правая часть выполнилась бы всегда.
    if (typeof portEl.scrollTo === 'function')
      portEl.scrollTo({ top, behavior })
    else
      portEl.scrollTop = top

    if (!hasScrollEnd())
      restartIdleTimer()
  }

  function pin(id: string | null): void {
    if (id === null) {
      unpin()

      return
    }

    pinnedId = id
    setActive(id)
  }

  function refresh(): void {
    attach()
    recompute()
  }

  onMounted(refresh)
  onScopeDispose(detach)

  // `flush: 'post'` обязателен: до обновления DOM новых разделов ещё нет, и
  // наблюдатель повесился бы на пустоту.
  watch(
    () => [options.sections(), options.disabled?.(), options.scroller?.()] as const,
    () => {
      if (pinnedId !== null && !options.sections().includes(pinnedId))
        unpin()

      refresh()
    },
    { flush: 'post' },
  )

  return { active: readonly(active), scrollTo, refresh, pin }
}
