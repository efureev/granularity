import type { ComputedRef, Ref } from 'vue'
import { computed, ref, watch } from 'vue'

/**
 * Активный элемент списка комбобокса (`aria-activedescendant`-паттерн).
 *
 * Одна и та же механика — activeIndex, циклический кламп, id активного, скролл
 * к нему, инициализация при открытии — была написана в пакете четырежды
 * (Select, Autocomplete, CommandPalette, частично Dropdown) и уже расходилась
 * до P1: Enter в Select активировал не тот элемент, что был подсвечен.
 * «Кто активен» обязан быть один на всех.
 *
 * Осознанно **не** обобщается активация: Enter/Tab/typeahead/Space — доменная
 * логика компонента (у Select — `add|option|fallback`, у палитры —
 * `selectItem`). Примитив отдаёт состояние и механические клавиши
 * (`handleNavigationKeys`), активацию компонент делает сам по `activeItem`.
 */
export interface UseComboboxNavigationOptions<TItem> {
  /** Навигируемые элементы (без disabled) в порядке отображения. */
  items: () => readonly TItem[]
  /** Открыт ли комбобокс — `activeDescendantId` существует только при открытом. */
  open: () => boolean
  /** DOM id элемента — цель `aria-activedescendant`. */
  idOf: (item: TItem, index: number) => string
  /**
   * Стартовый индекс для `init()` (обычно выбранное значение). Не задан или
   * вне диапазона — первый элемент, при пустом списке — `-1`.
   */
  initialIndex?: () => number
  /**
   * Донести активный элемент до экрана. Виртуализация и `scrollIntoView` —
   * забота компонента: только он знает свой контейнер и смещения окна.
   */
  scrollTo?: (item: TItem, index: number) => void | Promise<void>
}

export interface UseComboboxNavigationReturn<TItem> {
  activeIndex: Ref<number>
  activeItem: ComputedRef<TItem | undefined>
  activeDescendantId: ComputedRef<string | undefined>
  /** Циклический кламп + прокрутка к элементу. */
  setActive: (index: number) => void
  /** Активировать стартовый элемент (вызывается при открытии). */
  init: () => void
  /** Сброс активного (вызывается при закрытии; палитра сбрасывает в `0`). */
  reset: (index?: number) => void
  /**
   * Механические клавиши: `ArrowDown`/`ArrowUp`/`Home`/`End`. Возвращает
   * `true`, если клавиша обработана (с `preventDefault`), — остальное
   * компонент разбирает сам.
   */
  handleNavigationKeys: (event: KeyboardEvent) => boolean
}

export function useComboboxNavigation<TItem>(
  options: UseComboboxNavigationOptions<TItem>,
): UseComboboxNavigationReturn<TItem> {
  const activeIndex = ref(-1)

  const activeItem = computed<TItem | undefined>(() =>
    activeIndex.value >= 0 ? options.items()[activeIndex.value] : undefined,
  )

  const activeDescendantId = computed(() => {
    if (!options.open()) return undefined
    const item = activeItem.value
    if (item === undefined) return undefined
    return options.idOf(item, activeIndex.value)
  })

  function clamp(index: number): number {
    const len = options.items().length
    if (len === 0) return -1
    return ((index % len) + len) % len
  }

  function setActive(index: number): void {
    activeIndex.value = clamp(index)

    const item = activeItem.value
    if (item !== undefined) void options.scrollTo?.(item, activeIndex.value)
  }

  function init(): void {
    const len = options.items().length
    if (len === 0) {
      activeIndex.value = -1
      return
    }

    const preferred = options.initialIndex?.() ?? -1
    activeIndex.value = preferred >= 0 && preferred < len ? preferred : 0
  }

  function reset(index = -1): void {
    activeIndex.value = index
  }

  // Список изменился (фильтрация, remote-ответ) — активный не должен указывать
  // мимо. За верхнюю границу — на последний; пустого активного при непустом
  // списке не бывает.
  watch(options.items, (items) => {
    if (!options.open()) return
    if (activeIndex.value >= items.length) activeIndex.value = items.length - 1
    if (activeIndex.value < 0 && items.length) activeIndex.value = 0
  })

  function handleNavigationKeys(event: KeyboardEvent): boolean {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive(activeIndex.value + 1)
        return true
      case 'ArrowUp':
        event.preventDefault()
        setActive(activeIndex.value - 1)
        return true
      case 'Home':
        event.preventDefault()
        setActive(0)
        return true
      case 'End':
        event.preventDefault()
        setActive(options.items().length - 1)
        return true
      default:
        return false
    }
  }

  return { activeIndex, activeItem, activeDescendantId, setActive, init, reset, handleNavigationKeys }
}
