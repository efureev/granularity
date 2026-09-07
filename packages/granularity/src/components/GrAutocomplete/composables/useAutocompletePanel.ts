import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

import { filterOptions } from '../../shared/optionFilter'
import { buildOptionPanelRows } from '../../shared/optionPanel'
import type { OptionPanelItem, OptionPanelRow } from '../../shared/optionPanel'
import { isAutocompleteOptionGroup } from '../grAutocompleteStyles'
import type {
  GrAutocompleteOption,
  GrAutocompleteOptionOrGroup,
  GrAutocompleteValue,
} from '../GrAutocomplete.vue'

export type GrAutocompletePanelItem<TValue extends GrAutocompleteValue>
  = OptionPanelItem<GrAutocompleteOption<TValue>>

export type GrAutocompletePanelRow<TValue extends GrAutocompleteValue>
  = OptionPanelRow<GrAutocompleteOption<TValue>>

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
  optionsResolved: ComputedRef<GrAutocompleteOptionOrGroup<TValue>[]>
  /** Список без групп: по нему проверяется «такое значение уже есть». */
  flatOptions: ComputedRef<GrAutocompleteOption<TValue>[]>
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
  /** Плоский набор строк панели: заголовки групп идут в нём наравне с опциями. */
  panelItems: ComputedRef<GrAutocompletePanelItem<TValue>[]>
  /** Те же строки, собранные в группы для рендера. */
  panelRows: ComputedRef<GrAutocompletePanelRow<TValue>[]>
  /** Только опции — по ним ходит клавиатура и считается «список пуст». */
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

  /**
   * Строки панели: группы сохраняются, фильтр применяется к их содержимому, и
   * группа, у которой ничего не совпало, исчезает целиком вместе с заголовком —
   * заголовок над пустотой читается как сбой, а не как «здесь ничего нет».
   */
  const filteredItems = computed<GrAutocompletePanelItem<TValue>[]>(() => {
    const items: GrAutocompletePanelItem<TValue>[] = []

    options.optionsResolved.value.forEach((item, index) => {
      if (isAutocompleteOptionGroup(item)) {
        const matched = filterOptions(item.options, searchQuery.value, options.filter())
        if (!matched.length)
          return

        const groupKey = `__group__${index}`
        items.push({ kind: 'group', label: item.label, key: groupKey })
        for (const option of matched) {
          // Ключ с индексом группы: одинаковое `value` в разных группах больше
          // не даёт дубликат ключа.
          items.push({ kind: 'option', option, key: `${index}:${String(option.value)}`, groupKey })
        }
        return
      }

      if (filterOptions([item], searchQuery.value, options.filter()).length)
        items.push({ kind: 'option', option: item, key: `${index}:${String(item.value)}` })
    })

    return items
  })

  const belowMinQuery = computed(() =>
    options.minQueryLength() > 0 && options.query.value.trim().length < options.minQueryLength(),
  )

  /**
   * Опции к показу и навигации. Ниже `minQueryLength` — пусто: список ещё
   * относится к прошлому запросу, показывать его под подсказкой «введите ещё N»
   * значит дезинформировать.
   */
  const panelItems = computed<GrAutocompletePanelItem<TValue>[]>(() =>
    belowMinQuery.value ? [] : filteredItems.value,
  )

  const panelRows = computed<GrAutocompletePanelRow<TValue>[]>(() => buildOptionPanelRows(panelItems.value))

  const effectiveOptions = computed<GrAutocompleteOption<TValue>[]>(() =>
    panelItems.value.flatMap(item => (item.kind === 'option' ? [item.option] : [])),
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
    return !options.flatOptions.value.some(o => o.value === v || o.label === v)
  })

  const showEmpty = computed(() =>
    !options.isLoading.value && effectiveOptions.value.length === 0 && !canAddCustom.value,
  )

  return { searchQuery, belowMinQuery, panelItems, panelRows, effectiveOptions, canAddCustom, showEmpty }
}
