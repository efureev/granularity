import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

import { useVirtualList } from '../../../composables/useVirtualList'
import type { GrAutocompleteOption, GrAutocompleteValue } from '../GrAutocomplete.vue'

/** Оценка высоты опции: `py-2` вокруг строки кегля `sm`. Уточняется замером. */
const OPTION_SIZE_ESTIMATE = 36

/**
 * Виртуализация панели `GrAutocomplete`.
 *
 * Набор — `[«Add …»?] + effectiveOptions`, тот же, по которому ходит клавиатура.
 * Иначе верхняя распорка вытолкнула бы строку «Add …» вниз: она отрисована
 * внутри listbox'а первой и является полноценной опцией. Отсюда `addOffset`,
 * который сдвигает окно виртуализатора относительно индексов в списке опций.
 */
export interface UseAutocompleteVirtualOptions<TValue extends GrAutocompleteValue> {
  /** Контейнер списка: по нему считается окно и замеряются строки. */
  listboxEl: Ref<HTMLElement | null>
  effectiveOptions: ComputedRef<GrAutocompleteOption<TValue>[]>
  canAddCustom: ComputedRef<boolean>
  virtual: () => boolean
  dropdownMaxHeight: () => number
}

export interface AutocompleteVirtual<TValue extends GrAutocompleteValue> {
  /** Сдвиг окна из-за строки «Add …»: она идёт нулевым элементом набора. */
  addOffset: ComputedRef<number>
  virtualCount: ComputedRef<number>
  virtualizer: ReturnType<typeof useVirtualList>
  showAddOption: ComputedRef<boolean>
  renderedOptions: ComputedRef<Array<{ option: GrAutocompleteOption<TValue>, index: number }>>
  optionSetProps: (virtualIndex: number) => Record<string, number> | undefined
  listboxStyle: ComputedRef<Record<string, string>>
}

export function useAutocompleteVirtual<TValue extends GrAutocompleteValue>(
  options: UseAutocompleteVirtualOptions<TValue>,
): AutocompleteVirtual<TValue> {
  const addOffset = computed(() => (options.canAddCustom.value ? 1 : 0))
  const virtualCount = computed(() => options.effectiveOptions.value.length + addOffset.value)

  const virtualizer = useVirtualList({
    container: options.listboxEl,
    count: () => (options.virtual() ? virtualCount.value : 0),
    // Фильтрация/remote-ответ пересобирают набор — замеры прошлого невалидны.
    source: () => options.effectiveOptions.value,
    itemSize: OPTION_SIZE_ESTIMATE,
    // Панель скрыта `v-show`, пока закрыта, поэтому `clientHeight` контейнера —
    // ноль. Окно считается от объявленной высоты до первого настоящего замера.
    viewportSize: () => options.dropdownMaxHeight(),
  })

  /** Виден ли «Add …»: вне виртуального окна его рисовать нельзя — он элемент набора. */
  const showAddOption = computed(() => {
    if (!options.canAddCustom.value)
      return false
    return !options.virtual() || virtualizer.range.value.start === 0
  })

  /** Опции к отрисовке вместе с их абсолютным индексом в `effectiveOptions`. */
  const renderedOptions = computed(() => {
    const all = options.effectiveOptions.value
    if (!options.virtual())
      return all.map((option, index) => ({ option, index }))

    const { start, end } = virtualizer.range.value
    const from = Math.max(0, start - addOffset.value)
    const to = Math.max(0, end - addOffset.value)

    return all.slice(from, to).map((option, offset) => ({ option, index: from + offset }))
  })

  /**
   * Размер набора и позиция в нём объявляются только при виртуализации: в обычном
   * режиме диктор выводит их из DOM, а при неполном наборе получил бы «3 из 15»
   * на списке в десять тысяч.
   */
  function optionSetProps(virtualIndex: number): Record<string, number> | undefined {
    if (!options.virtual())
      return undefined
    return { 'aria-setsize': virtualCount.value, 'aria-posinset': virtualIndex + 1 }
  }

  const listboxStyle = computed(() => {
    const base: Record<string, string> = { maxHeight: `${options.dropdownMaxHeight()}px` }
    if (!options.virtual())
      return base

    return {
      ...base,
      ...virtualizer.spacerStyle.value,
    }
  })

  return { addOffset, virtualCount, virtualizer, showAddOption, renderedOptions, optionSetProps, listboxStyle }
}
