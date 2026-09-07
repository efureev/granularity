import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick } from 'vue'

import { useComboboxNavigation } from '../../../composables/useComboboxNavigation'
import type { GrAutocompletePanelItem } from './useAutocompletePanel'
import type { GrAutocompleteOption, GrAutocompleteValue } from '../GrAutocomplete.vue'

/**
 * Клавиатурная навигация ходит и по опциям, и по варианту «добавить своё»:
 * иначе при непустом списке Enter всегда уходил бы в активную опцию, и
 * закоммитить произвольное значение с клавиатуры было бы нечем.
 */
export type GrAutocompleteNavigableItem<TValue extends GrAutocompleteValue>
  = | { kind: 'add' }
  /**
   * `index` — позиция в `panelItems`, а не среди опций: заголовки групп занимают
   * в наборе такие же строки, и по этому же индексу считаются `id` опции и окно
   * виртуализации. Индекс «среди опций» разошёлся бы с обоими, как только
   * появилась первая группа.
   */
    | { kind: 'option', option: GrAutocompleteOption<TValue>, index: number }

export interface UseAutocompleteNavigationOptions<TValue extends GrAutocompleteValue> {
  panelItems: ComputedRef<GrAutocompletePanelItem<TValue>[]>
  canAddCustom: ComputedRef<boolean>
  selectedValues: ComputedRef<TValue[]>
  open: Ref<boolean>
  virtual: () => boolean
  /** Сдвиг окна из-за строки «Add …» — из модуля виртуализации. */
  addOffset: ComputedRef<number>
  scrollToIndex: (index: number) => void
  optionDomId: (index: number) => string
  addOptionDomId: ComputedRef<string>
}

export interface AutocompleteNavigation<TValue extends GrAutocompleteValue> {
  navigableItems: ComputedRef<Array<GrAutocompleteNavigableItem<TValue>>>
  isSelected: (value: TValue) => boolean
  /** Индекс навигации по позиции строки в панели — для наведения мышью. */
  navigableIndexOfPanelIndex: (index: number) => number
  activeIndex: Ref<number>
  activeItem: ComputedRef<GrAutocompleteNavigableItem<TValue> | undefined>
  activeDescendantId: ComputedRef<string | undefined>
  activeValue: ComputedRef<TValue | undefined>
  initActiveIndex: () => void
  resetActive: () => void
  handleNavigationKeys: (event: KeyboardEvent) => boolean
}

export function useAutocompleteNavigation<TValue extends GrAutocompleteValue>(
  options: UseAutocompleteNavigationOptions<TValue>,
): AutocompleteNavigation<TValue> {
  type Item = GrAutocompleteNavigableItem<TValue>

  const navigableItems = computed<Item[]>(() => {
    const items: Item[] = options.canAddCustom.value ? [{ kind: 'add' }] : []

    options.panelItems.value.forEach((item, index) => {
      if (item.kind === 'option' && !item.option.disabled)
        items.push({ kind: 'option', option: item.option, index })
    })

    return items
  })

  function isSelected(value: TValue): boolean {
    return options.selectedValues.value.includes(value)
  }

  /**
   * Navigable-индекс по позиции в `panelItems` — O(1) на каждое движение мыши
   * вместо поиска по значению.
   *
   * Поиск по значению здесь ещё и неверен: одно и то же значение может стоять в
   * двух группах, и наведение на вторую опцию подсвечивало бы первую.
   */
  const navigableIndexByPanelIndex = computed(() => {
    const map = new Map<number, number>()
    navigableItems.value.forEach((item, navIndex) => {
      if (item.kind === 'option')
        map.set(item.index, navIndex)
    })
    return map
  })

  function navigableIndexOfPanelIndex(index: number): number {
    return navigableIndexByPanelIndex.value.get(index) ?? -1
  }

  /** Прокрутка к активному: сперва окно виртуального списка, затем доводка. */
  async function scrollActiveIntoView(item: Item): Promise<void> {
    // Вне окна активной опции в DOM нет: `getElementById` вернул бы `null`,
    // прокрутка не случилась бы, а `aria-activedescendant` указал бы в пустоту.
    if (options.virtual())
      options.scrollToIndex(item.kind === 'add' ? 0 : item.index + options.addOffset.value)

    await nextTick()
    const id = item.kind === 'add' ? options.addOptionDomId.value : options.optionDomId(item.index)
    document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' })
  }

  const {
    activeIndex,
    activeItem,
    activeDescendantId,
    init: initActiveIndex,
    reset: resetActive,
    handleNavigationKeys,
  } = useComboboxNavigation<Item>({
    items: () => navigableItems.value,
    open: () => options.open.value,
    idOf: item => (item.kind === 'add' ? options.addOptionDomId.value : options.optionDomId(item.index)),
    initialIndex: () => navigableItems.value.findIndex(
      item => item.kind === 'option' && isSelected(item.option.value),
    ),
    scrollTo: item => scrollActiveIntoView(item),
  })

  const activeValue = computed(() => (
    activeItem.value?.kind === 'option' ? activeItem.value.option.value : undefined
  ))

  return {
    navigableItems,
    isSelected,
    navigableIndexOfPanelIndex,
    activeIndex,
    activeItem,
    activeDescendantId,
    activeValue,
    initActiveIndex,
    resetActive,
    handleNavigationKeys,
  }
}
