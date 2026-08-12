import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, onBeforeUnmount } from 'vue'

import { useComboboxNavigation } from '../../../composables/useComboboxNavigation'
import { isComposingEvent } from '../../../internal/keyboard'
import type { GrSelectOption, GrSelectValue } from '../grSelectStyles'
import type { GrSelectPanelItem } from './useSelectPanelItems'

/**
 * Клавиатура ходит и по опциям, и по строке «Add …» (как в `GrAutocomplete`):
 * иначе при непустом списке Enter не мог бы выбрать подсвеченную опцию, а при
 * активной опции — закоммитить произвольное значение.
 */
export type GrSelectNavigableItem<TValue extends GrSelectValue> =
  | { kind: 'add' }
  | { kind: 'option', value: TValue, index: number }

/** Буфер typeahead живёт ровно столько: дальше набранное перестаёт быть словом. */
const TYPEAHEAD_RESET_MS = 600

export interface UseSelectNavigationOptions<TValue extends GrSelectValue> {
  panelItems: ComputedRef<GrSelectPanelItem<TValue>[]>
  flatOptions: ComputedRef<GrSelectOption<TValue>[]>
  canAddCustom: ComputedRef<boolean>
  sameValue: (a: unknown, b: unknown) => boolean
  isSelected: (value: TValue) => boolean

  open: Ref<boolean>
  locked: ComputedRef<boolean>
  showSearchInput: ComputedRef<boolean>
  virtualEnabled: ComputedRef<boolean>
  addOffset: ComputedRef<number>

  listboxId: string
  optionDomId: (index: number) => string
  /** Подвинуть окно виртуализации к строке набора. */
  scrollVirtualToIndex: (index: number) => void

  /** Действия выбора: они трогают модель и эмиты, поэтому живут в компоненте. */
  openDropdown: () => void
  closeDropdown: () => void
  addCustom: () => void
  toggleValue: (value: TValue) => void
}

export interface SelectNavigation<TValue extends GrSelectValue> {
  navigableItems: ComputedRef<GrSelectNavigableItem<TValue>[]>
  /** Индекс активного элемента: пишется и снаружи — строка «Add …» подсвечивается наведением. */
  activeIndex: Ref<number>
  activeItem: ComputedRef<GrSelectNavigableItem<TValue> | undefined>
  addOptionDomId: ComputedRef<string>
  activeValue: ComputedRef<TValue | undefined>
  activeDescendantId: ComputedRef<string | undefined>
  triggerActiveDescendant: ComputedRef<string | undefined>
  searchActiveDescendant: ComputedRef<string | undefined>
  onOptionHover: (panelIndex: number) => void
  onComboKeydown: (event: KeyboardEvent) => void
  initActiveIndex: () => void
  resetActive: () => void
}

export function useSelectNavigation<TValue extends GrSelectValue>(
  options: UseSelectNavigationOptions<TValue>,
): SelectNavigation<TValue> {
  const navigableItems = computed<GrSelectNavigableItem<TValue>[]>(() => {
    const items: GrSelectNavigableItem<TValue>[] = options.canAddCustom.value ? [{ kind: 'add' }] : []

    options.panelItems.value.forEach((item, index) => {
      if (item.kind === 'option' && !item.option.disabled)
        items.push({ kind: 'option', value: item.option.value, index })
    })

    return items
  })

  const addOptionDomId = computed(() => `${options.listboxId}-add`)

  /** Прокрутка к активному: у виртуализации окно, затем доводка `scrollIntoView`. */
  async function scrollActiveIntoView(item: GrSelectNavigableItem<TValue>): Promise<void> {
    // Вне окна активной опции в DOM нет: `getElementById` вернул бы `null`,
    // прокрутка не случилась бы, а `aria-activedescendant` указал бы в пустоту.
    if (options.virtualEnabled.value)
      options.scrollVirtualToIndex(item.kind === 'add' ? 0 : item.index + options.addOffset.value)

    await nextTick()
    const id = item.kind === 'add' ? addOptionDomId.value : options.optionDomId(item.index)
    document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' })
  }

  const {
    activeIndex,
    activeItem,
    activeDescendantId,
    setActive,
    init: initActiveIndex,
    reset: resetActive,
    handleNavigationKeys,
  } = useComboboxNavigation<GrSelectNavigableItem<TValue>>({
    items: () => navigableItems.value,
    open: () => options.open.value,
    idOf: item => (item.kind === 'add' ? addOptionDomId.value : options.optionDomId(item.index)),
    initialIndex: () => navigableItems.value.findIndex(item => item.kind === 'option' && options.isSelected(item.value)),
    scrollTo: item => scrollActiveIntoView(item),
  })

  const activeValue = computed(() => (activeItem.value?.kind === 'option' ? activeItem.value.value : undefined))

  /** Navigable-индекс по позиции в `panelItems`: O(1) на hover вместо O(n). */
  const navigableIndexByPanelIndex = computed(() => {
    const map = new Map<number, number>()
    navigableItems.value.forEach((item, navIndex) => {
      if (item.kind === 'option') map.set(item.index, navIndex)
    })
    return map
  })

  function onOptionHover(panelIndex: number): void {
    const next = navigableIndexByPanelIndex.value.get(panelIndex)
    if (next !== undefined && next !== activeIndex.value) activeIndex.value = next
  }

  /**
   * `aria-activedescendant` работает только на элементе, который держит фокус.
   * С полем поиска фокус уходит в него, поэтому связка с активной опцией живёт
   * там же; на триггере она осталась бы немой.
   */
  const triggerActiveDescendant = computed(() => (
    options.showSearchInput.value ? undefined : activeDescendantId.value
  ))
  const searchActiveDescendant = computed(() => (
    options.showSearchInput.value ? activeDescendantId.value : undefined
  ))

  let typeaheadBuffer = ''
  let typeaheadTimer: ReturnType<typeof setTimeout> | null = null

  function typeahead(char: string): void {
    const lower = char.toLowerCase()
    // Повтор одной буквы — это «следующий на ту же букву», а не поиск «aa».
    const repeat = typeaheadBuffer.length === 1 && typeaheadBuffer === lower
    typeaheadBuffer = repeat ? lower : typeaheadBuffer + lower

    if (typeaheadTimer) clearTimeout(typeaheadTimer)
    typeaheadTimer = setTimeout(() => { typeaheadBuffer = '' }, TYPEAHEAD_RESET_MS)

    // Поиск циклически от следующей за активной (APG) — как в GrTree/GrDropdown:
    // повторная буква ведёт к следующему совпадению, а не возвращает к первому.
    const items = navigableItems.value
    const from = activeIndex.value
    for (let step = 1; step <= items.length; step += 1) {
      const idx = (from + step + items.length) % items.length
      const item = items[idx]
      if (item.kind !== 'option') continue
      const opt = options.flatOptions.value.find(o => options.sameValue(o.value, item.value))
      if (opt?.label.toLowerCase().startsWith(typeaheadBuffer)) {
        setActive(idx)
        return
      }
    }
  }

  function onComboKeydown(event: KeyboardEvent): void {
    // Клавиша во время IME-композиции принадлежит композиции: Enter коммитит её,
    // Esc отменяет, стрелки ходят по кандидатам.
    if (isComposingEvent(event)) return
    if (options.locked.value) return

    if (!options.open.value) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        options.openDropdown()
      }
      return
    }

    if (handleNavigationKeys(event)) return

    switch (event.key) {
      case 'Enter': {
        event.preventDefault()
        // Активный элемент сильнее `canAddCustom`: пользователь подсветил опцию
        // стрелками — Enter обязан выбрать её, а не добавить набранный запрос.
        const item = activeItem.value
        if (item?.kind === 'add') options.addCustom()
        else if (item?.kind === 'option') options.toggleValue(item.value)
        else if (options.canAddCustom.value) options.addCustom()
        break
      }
      case 'Tab':
        options.closeDropdown()
        break
      default:
        // typeahead — только когда нет поля ввода (иначе мешает вводу в search/custom-инпут).
        if (!options.showSearchInput.value && event.key.length === 1
          && !event.metaKey && !event.ctrlKey && !event.altKey)
          typeahead(event.key)
    }
  }

  onBeforeUnmount(() => {
    // Висячий таймер после размонтирования: буфер typeahead живёт 600 мс.
    if (typeaheadTimer) clearTimeout(typeaheadTimer)
  })

  return {
    navigableItems,
    activeIndex,
    activeItem,
    addOptionDomId,
    activeValue,
    activeDescendantId,
    triggerActiveDescendant,
    searchActiveDescendant,
    onOptionHover,
    onComboKeydown,
    initActiveIndex,
    resetActive,
  }
}
