import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'

/**
 * Roving tabindex: группа — одна остановка `Tab`, внутрь заходят стрелками.
 *
 * Механика написана в пакете шесть раз (`GrDropdownMenu`, `GrTree`, `GrTabs`,
 * `GrSegmented`, `GrRadio`, `GrInputTag`) и разошлась не стилистически, а по
 * существу: у одних кольцо зациклено, у других упирается в края; одни
 * пропускают выключенные элементы, другие намеренно нет; адресуются то
 * индексом, то ключом, то значением. Каждое расхождение здесь стало опцией —
 * поэтому опций много, и это дешевле, чем седьмая копия.
 *
 * Осознанно **не** обобщается активация: `Enter`/`Space` и «двигает ли стрелка
 * выбор» — доменная логика компонента. У `GrSegmented` и `GrRadio` стрелка
 * меняет значение, у `GrTree` и `GrInputTag` — нет, у `GrTabs` это проп.
 * Примитив ведёт фокус и отдаёт `onMove`; что делать с переездом, решает
 * компонент.
 *
 * Инвариант «ровно один элемент с `tabindex="0"`» держит `rovingKey`: это
 * `computed`, а не `ref`, поэтому при смене набора он самокорректируется в
 * момент чтения. Отдельная нормализация с `watch(..., { flush: 'sync' })`,
 * как в `GrTree`, больше не нужна.
 */

/** Какие стрелки ведут по набору. */
export type GrRovingOrientation = 'horizontal' | 'vertical' | 'both' | 'grid'

/** Край набора, в который упёрлось движение. */
export type GrRovingEdge = 'start' | 'end'

export interface UseRovingFocusOptions<TKey> {
  /** Ключи элементов в порядке отображения. Индекс, значение, opaque-ключ — что угодно сравнимое по `===`. */
  items: () => readonly TKey[]
  /**
   * DOM-узел элемента. Массив ref-ов, `Map`, `querySelector` — примитиву
   * безразлично, знать раскладку обязан компонент.
   */
  elementFor: (key: TKey) => HTMLElement | null | undefined
  /** Выключен ли элемент. Спрашивается только при `skipDisabled`. */
  isDisabled?: (key: TKey) => boolean
  /** По умолчанию `vertical`. */
  orientation?: () => GrRovingOrientation
  /** Ширина строки для `orientation: 'grid'`. Игнорируется в остальных режимах. */
  columns?: () => number
  /** Замкнуто ли кольцо. По умолчанию `true`. */
  wrap?: () => boolean
  /**
   * Пропускать выключенные при движении. По умолчанию `false`: в паттерне
   * `menu` выключенный пункт остаётся в обходе намеренно — `aria-disabled`
   * оставляет его фокусируемым, чтобы скринридер прочёл, что он есть.
   */
  skipDisabled?: () => boolean
  /**
   * Стартовый элемент, когда фокус в группе ещё не был — обычно выбранное
   * значение.
   *
   * **Выключенность здесь не проверяется, и это не упущение.** Проверить её
   * автоматически по `isDisabled` нельзя: у `GrSegmented` загружающийся сегмент
   * остановку `Tab` сохраняет, хотя для движения заблокирован, а у `GrRadio`
   * выключенный переключатель терять её обязан. Условие знает только вызывающий,
   * поэтому геттер обязан вернуть `undefined` для значения, которое не может
   * принять фокус. Забыть об этом — значит оставить группу без остановки `Tab`
   * вовсе: элемент с `tabindex="0"` будет назначен, но отрисует `-1`.
   */
  initialKey?: () => TKey | undefined
  /**
   * Позиция переехала — компонент решает, менять ли заодно выбор. Вызывается
   * **до** переноса фокуса: в `radiogroup` стрелка переносит выбор, и модель
   * обязана примениться раньше, чем сфокусируется целевой элемент.
   */
  onMove?: (key: TKey, previous: TKey | undefined) => void
  /**
   * Движение упёрлось в край при `wrap: false`. Вернул `true` — считаем клавишу
   * обработанной (кольцо `GrInputTag` так отдаёт фокус полю ввода, календарь —
   * листает месяц).
   */
  onOverflow?: (edge: GrRovingEdge, delta: number) => boolean
  /**
   * Донести элемент до экрана перед фокусом: виртуализация, `scrollIntoView`,
   * ожидание перерисовки после `onMove`. Вернул промис — фокус ждёт ровно его,
   * без добавленных примитивом тиков; вернул `undefined` — фокус остаётся
   * синхронным, чтобы не менять тайминг у компонентов, которые на него
   * полагаются.
   */
  beforeFocus?: (key: TKey) => void | Promise<void>
}

export interface UseRovingFocusReturn<TKey> {
  /** Элемент, который держит `tabindex="0"`. Никогда не «никто» при непустом наборе. */
  rovingKey: ComputedRef<TKey | undefined>
  /** `0` для роверного элемента, `-1` для всех остальных. */
  tabindexFor: (key: TKey) => 0 | -1
  /** Сделать активным без переноса фокуса — для синхронизации с мышью (`@focus`, `@click`). */
  setActive: (key: TKey) => void
  /**
   * Забыть явно наведённый фокус: остановка `Tab` возвращается к производной
   * (`initialKey` → первый доступный). Нужно, когда набор опустел, — иначе
   * устаревший ключ всплывёт, как только элементы появятся снова.
   */
  reset: () => void
  /** Сделать активным и перенести фокус. */
  focusKey: (key: TKey) => Promise<void>
  /** Сдвиг на `delta` позиций от текущего. Вернёт `false`, если движение не состоялось. */
  moveBy: (delta: number) => boolean
  /** На край набора (в `grid` — на край текущей строки). */
  moveToEdge: (edge: GrRovingEdge) => boolean
  /**
   * Стрелки, `Home`, `End` по объявленной ориентации. Возвращает `true`, если
   * клавиша обработана (с `preventDefault`) — остальное компонент разбирает сам.
   */
  handleNavigationKeys: (event: KeyboardEvent) => boolean
}

export function useRovingFocus<TKey>(
  options: UseRovingFocusOptions<TKey>,
): UseRovingFocusReturn<TKey> {
  const activeKey: Ref<TKey | undefined> = ref()

  const orientation = (): GrRovingOrientation => options.orientation?.() ?? 'vertical'
  const wraps = (): boolean => options.wrap?.() ?? true
  const skips = (): boolean => options.skipDisabled?.() ?? false
  const disabled = (key: TKey): boolean => options.isDisabled?.(key) ?? false

  function firstFocusable(items: readonly TKey[]): TKey | undefined {
    if (!skips())
      return items[0]
    return items.find(key => !disabled(key)) ?? items[0]
  }

  /**
   * Роверный элемент. Порядок: явно активный (если ещё в наборе) → стартовый →
   * первый доступный. Именно здесь живёт инвариант «ровно один `tabindex=0`»:
   * пока набор непуст, ответ не бывает пустым.
   */
  const rovingKey = computed<TKey | undefined>(() => {
    const items = options.items()
    if (items.length === 0)
      return undefined

    const active = activeKey.value
    if (active !== undefined && items.includes(active))
      return active

    const initial = options.initialKey?.()
    if (initial !== undefined && items.includes(initial))
      return initial

    return firstFocusable(items)
  })

  function tabindexFor(key: TKey): 0 | -1 {
    return rovingKey.value === key ? 0 : -1
  }

  function setActive(key: TKey): void {
    activeKey.value = key
  }

  function reset(): void {
    activeKey.value = undefined
  }

  function focusKey(key: TKey): Promise<void> {
    const previous = rovingKey.value
    activeKey.value = key

    // Состояние — до фокуса: `onMove` часто меняет модель (в `radiogroup`
    // стрелка переносит выбор), и компонент вправе рассчитывать, что к моменту
    // фокуса оно уже применено.
    if (key !== previous)
      options.onMove?.(key, previous)

    const focusNow = (): void => {
      options.elementFor(key)?.focus()
    }

    const pending = options.beforeFocus?.(key)
    if (pending && typeof pending.then === 'function') {
      return pending.then(focusNow)
    }

    focusNow()
    return Promise.resolve()
  }

  /**
   * Индекс цели после сдвига. `undefined` — движение невозможно: упёрлись в
   * край без зацикливания либо весь набор выключен.
   */
  function targetIndex(from: number, delta: number): number | undefined {
    const items = options.items()
    const len = items.length
    if (len === 0 || delta === 0)
      return undefined

    let index = from

    // Шагов не больше размера набора: полный оборот без единого доступного
    // элемента означает, что двигаться некуда. Шаг на каждой итерации тот же —
    // выключенный элемент в сетке перешагивается по вертикали, сохраняя
    // колонку; прыжок «вбок» был бы неожиданным.
    for (let attempt = 0; attempt < len; attempt += 1) {
      const next = index + delta

      if (next < 0 || next >= len) {
        if (!wraps())
          return undefined
        // Зацикливание по модулю набора. Колонку это сохраняет, когда длина
        // кратна ширине строки — у календарной сетки 42 = 6 × 7 так и есть.
        index = ((next % len) + len) % len
      }
      else {
        index = next
      }

      if (!skips() || !disabled(items[index]))
        return index
    }

    return undefined
  }

  function currentIndex(): number {
    const items = options.items()
    const key = rovingKey.value
    return key === undefined ? -1 : items.indexOf(key)
  }

  function moveBy(delta: number): boolean {
    const items = options.items()
    // `rovingKey` пуст только при пустом наборе — двигаться нечем.
    const from = currentIndex()
    if (from < 0)
      return false

    const target = targetIndex(from, delta)
    if (target === undefined) {
      const edge: GrRovingEdge = delta > 0 ? 'end' : 'start'
      return options.onOverflow?.(edge, delta) ?? false
    }

    void focusKey(items[target])
    return true
  }

  function rowBounds(index: number): [number, number] {
    const len = options.items().length
    const width = Math.max(1, options.columns?.() ?? len)
    const row = Math.floor(index / width)
    return [row * width, Math.min(row * width + width - 1, len - 1)]
  }

  function moveToEdge(edge: GrRovingEdge): boolean {
    const items = options.items()
    if (items.length === 0)
      return false

    const from = currentIndex()
    // В сетке `Home`/`End` — края строки (в календаре это начало и конец
    // недели); в линейных режимах — края всего набора.
    const [start, end] = orientation() === 'grid' && from >= 0
      ? rowBounds(from)
      : [0, items.length - 1]

    const target = edge === 'start' ? start : end
    if (!skips()) {
      void focusKey(items[target])
      return true
    }

    const direction = edge === 'start' ? 1 : -1
    for (let index = target; index >= start && index <= end; index += direction) {
      const key = items[index]
      if (!disabled(key)) {
        void focusKey(key)
        return true
      }
    }
    return false
  }

  /** Шаг вперёд/назад по объявленной ориентации; `0` — клавиша этой оси не касается. */
  function deltaForKey(key: string): number {
    const mode = orientation()
    const columns = Math.max(1, options.columns?.() ?? 1)

    switch (key) {
      case 'ArrowRight':
        return mode === 'vertical' ? 0 : 1
      case 'ArrowLeft':
        return mode === 'vertical' ? 0 : -1
      case 'ArrowDown':
        if (mode === 'horizontal')
          return 0
        return mode === 'grid' ? columns : 1
      case 'ArrowUp':
        if (mode === 'horizontal')
          return 0
        return mode === 'grid' ? -columns : -1
      default:
        return 0
    }
  }

  function handleNavigationKeys(event: KeyboardEvent): boolean {
    if (event.altKey || event.ctrlKey || event.metaKey)
      return false

    if (event.key === 'Home' || event.key === 'End') {
      const moved = moveToEdge(event.key === 'Home' ? 'start' : 'end')
      if (moved)
        event.preventDefault()
      return moved
    }

    const delta = deltaForKey(event.key)
    if (delta === 0)
      return false

    const moved = moveBy(delta)
    if (moved)
      event.preventDefault()
    return moved
  }

  return { rovingKey, tabindexFor, setActive, reset, focusKey, moveBy, moveToEdge, handleNavigationKeys }
}
