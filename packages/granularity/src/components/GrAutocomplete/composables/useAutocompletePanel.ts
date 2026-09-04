import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

import { filterOptions } from '../../shared/optionFilter'
import type { GrAutocompleteOption, GrAutocompleteValue } from '../GrAutocomplete.vue'

/**
 * Состав панели `GrAutocomplete`: что показывать под запросом.
 *
 * Три решения, которые легко перепутать между собой. При `fetchOptions`
 * локальный матчер выключается — он отсеял бы то, что сервер уже прислал в
 * ответ на этот же запрос. Ниже `minQueryLength` список пуст, а не «прошлый»:
 * показывать старый набор под подсказкой «введите ещё N» значит
 * дезинформировать. А «Add …» не предлагается, если такое значение или подпись
 * уже есть среди опций.
 */
export interface UseAutocompletePanelOptions<TValue extends GrAutocompleteValue> {
  optionsResolved: ComputedRef<GrAutocompleteOption<TValue>[]>
  /** Введённый текст без нормализации: тримит уже сам модуль. */
  query: Ref<string>
  /** Пользователь начал ввод — до этого single-режим показывает весь список. */
  dirty: Ref<boolean>
  filterable: () => boolean
  filter: () => ((option: GrAutocompleteOption<TValue>, query: string) => boolean) | undefined
  fetchOptions: () => unknown
  multiple: () => boolean
  minQueryLength: () => number
  allowCustomValue: () => boolean
  selectedValues: ComputedRef<TValue[]>
  modelSingle: ComputedRef<TValue | ''>
  isLoading: ComputedRef<boolean>
}

export interface AutocompletePanel<TValue extends GrAutocompleteValue> {
  searchQuery: ComputedRef<string>
  belowMinQuery: ComputedRef<boolean>
  effectiveOptions: ComputedRef<GrAutocompleteOption<TValue>[]>
  canAddCustom: ComputedRef<boolean>
  showEmpty: ComputedRef<boolean>
}

export function useAutocompletePanel<TValue extends GrAutocompleteValue>(
  options: UseAutocompletePanelOptions<TValue>,
): AutocompletePanel<TValue> {
  const searchQuery = computed(() => {
    // При `fetchOptions` фильтрует сервер: локальный матчер отсеял бы то, что он
    // уже прислал в ответ на этот же запрос.
    if (!options.filterable() || options.fetchOptions())
      return ''
    // single: пока пользователь не начал вводить — показываем весь список.
    if (!options.multiple() && !options.dirty.value)
      return ''
    return options.query.value.trim()
  })

  const filteredOptions = computed<GrAutocompleteOption<TValue>[]>(() =>
    filterOptions(options.optionsResolved.value, searchQuery.value, options.filter()),
  )

  const belowMinQuery = computed(() =>
    options.minQueryLength() > 0 && options.query.value.trim().length < options.minQueryLength(),
  )

  /**
   * Опции к показу и навигации. Ниже `minQueryLength` — пусто: список ещё
   * относится к прошлому запросу, показывать его под подсказкой «введите ещё N»
   * значит дезинформировать.
   */
  const effectiveOptions = computed<GrAutocompleteOption<TValue>[]>(() =>
    belowMinQuery.value ? [] : filteredOptions.value,
  )

  const canAddCustom = computed(() => {
    if (!options.allowCustomValue())
      return false
    // Кастомное значение набирается текстом — оно строковое по природе;
    // при числовом `TValue` эта ветка неприменима (см. docs/components.md).
    const v = options.query.value.trim() as TValue
    if (!v)
      return false
    if (options.multiple() && options.selectedValues.value.includes(v))
      return false
    if (!options.multiple() && v === options.modelSingle.value)
      return false
    // Не предлагаем «Add», если такое значение/метка уже есть среди опций.
    return !options.optionsResolved.value.some(o => o.value === v || o.label === v)
  })

  const showEmpty = computed(() =>
    !options.isLoading.value && effectiveOptions.value.length === 0 && !canAddCustom.value,
  )

  return { searchQuery, belowMinQuery, effectiveOptions, canAddCustom, showEmpty }
}
