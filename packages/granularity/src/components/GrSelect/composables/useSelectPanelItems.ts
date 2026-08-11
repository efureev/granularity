import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import { matchesOptionQuery, normalizeOptionQuery } from '../../shared/optionFilter'
import type {
  GrSelectOption,
  GrSelectOptionGroup,
  GrSelectOptionOrGroup,
  GrSelectValue,
} from '../grSelectStyles'

/**
 * Элемент рендера панели: либо заголовок группы, либо опция.
 * Группировка сохраняется, фильтрация по запросу скрывает пустые группы.
 */
export type GrSelectPanelItem<TValue extends GrSelectValue> =
  | { kind: 'group', label: string, key: string }
  /** `groupKey` связывает опцию с заголовком её группы для скринридера. */
  | { kind: 'option', option: GrSelectOption<TValue>, key: string, groupKey?: string }

export type GrSelectPanelOptionRow<TValue extends GrSelectValue> = {
  option: GrSelectOption<TValue>
  key: string
  index: number
}

export type GrSelectPanelRow<TValue extends GrSelectValue> =
  | {
    kind: 'group'
    label: string
    key: string
    options: GrSelectPanelOptionRow<TValue>[]
    /**
     * Есть ли в этой отрисовке видимый заголовок. При виртуализации окно может
     * начаться серединой группы: обёртка нужна всё равно, а заголовка нет —
     * имя тогда идёт в `aria-label`.
     */
    labelVisible?: boolean
    /** Позиция заголовка в `panelItems` — по ней его замеряет виртуализатор. */
    labelIndex?: number
  }
  | ({ kind: 'option' } & GrSelectPanelOptionRow<TValue>)

/**
 * Состав панели `GrSelect`: плоский набор строк, их группировка и признак
 * «набранное можно добавить».
 *
 * Отвечает только на вопрос «что показывать в списке». Окно виртуализации,
 * клавиатура и вид — не здесь.
 */
export interface UseSelectPanelItemsOptions<TValue extends GrSelectValue> {
  optionsResolved: ComputedRef<GrSelectOptionOrGroup<TValue>[]>
  flatOptions: ComputedRef<GrSelectOption<TValue>[]>
  isOptionGroup: (item: GrSelectOptionOrGroup<TValue>) => item is GrSelectOptionGroup<TValue>
  modelSingle: ComputedRef<TValue | ''>
  selectedValues: ComputedRef<TValue[]>
  hasModelInOptions: ComputedRef<boolean>
  sameValue: (a: unknown, b: unknown) => boolean
  /** Текст поиска: он же кандидат в кастомные значения. */
  query: () => string
  allowCustomValue: () => boolean
  filterable: () => boolean
  multiple: () => boolean
  isPanelView: () => boolean
}

export interface SelectPanelItems<TValue extends GrSelectValue> {
  panelItems: ComputedRef<GrSelectPanelItem<TValue>[]>
  panelRows: ComputedRef<GrSelectPanelRow<TValue>[]>
  canAddCustom: ComputedRef<boolean>
}

export function useSelectPanelItems<TValue extends GrSelectValue>(
  options: UseSelectPanelItemsOptions<TValue>,
): SelectPanelItems<TValue> {
  const panelItems = computed<GrSelectPanelItem<TValue>[]>(() => {
    const q = (options.allowCustomValue() || options.filterable()) ? normalizeOptionQuery(options.query()) : ''
    const items: GrSelectPanelItem<TValue>[] = []

    // Опция для кастомного значения, которого нет в options (single).
    if (options.allowCustomValue() && !options.multiple()
      && options.modelSingle.value !== '' && !options.hasModelInOptions.value) {
      const value = options.modelSingle.value
      const custom: GrSelectOption<TValue> = { value, label: String(value) }
      if (matchesOptionQuery(custom, q)) {
        items.push({ kind: 'option', option: custom, key: `__custom__${String(custom.value)}` })
      }
    }

    options.optionsResolved.value.forEach((item, index) => {
      if (options.isOptionGroup(item)) {
        const matched = item.options.filter(o => matchesOptionQuery(o, q))
        if (!matched.length) return
        const groupKey = `__group__${index}`
        items.push({ kind: 'group', label: item.label, key: groupKey })
        for (const option of matched) {
          // Ключ с индексом группы — одинаковое `value` в разных группах больше не даёт дубликат.
          items.push({ kind: 'option', option, key: `${index}:${String(option.value)}`, groupKey })
        }
        return
      }

      if (matchesOptionQuery(item, q)) {
        items.push({ kind: 'option', option: item, key: `${index}:${String(item.value)}` })
      }
    })

    return items
  })

  /**
   * Строки панели для рендера: заголовок группы больше не сосед опций, а их
   * контейнер. Прямыми потомками `role="listbox"` обязаны быть только опции, а
   * заголовок даёт имя группе через `aria-labelledby`.
   *
   * `index` — позиция опции в `panelItems`: из неё строится `id`, поэтому он не
   * зависит от значения (значение с пробелом дало бы невалидный `id`).
   */
  const panelRows = computed<GrSelectPanelRow<TValue>[]>(() => {
    const rows: GrSelectPanelRow<TValue>[] = []
    let currentGroup: Extract<GrSelectPanelRow<TValue>, { kind: 'group' }> | undefined

    panelItems.value.forEach((item, index) => {
      if (item.kind === 'group') {
        currentGroup = { kind: 'group', label: item.label, key: item.key, options: [] }
        rows.push(currentGroup)
        return
      }

      const row: GrSelectPanelOptionRow<TValue> = { option: item.option, key: item.key, index }

      if (item.groupKey && currentGroup && currentGroup.key === item.groupKey) {
        currentGroup.options.push(row)
        return
      }

      currentGroup = undefined
      rows.push({ kind: 'option', ...row })
    })

    return rows
  })

  const canAddCustom = computed(() => {
    if (!options.allowCustomValue()) return false
    if (!options.isPanelView()) return false
    // Кастомное значение набирается текстом, поэтому оно строковое —
    // при числовом `TValue` эта ветка неприменима (см. docs/components.md).
    const v = options.query().trim() as TValue
    if (!v) return false

    if (options.multiple()) {
      if (options.selectedValues.value.some(selected => options.sameValue(selected, v))) return false
      return !options.flatOptions.value.some(o => options.sameValue(o.value, v))
    }

    if (options.sameValue(v, options.modelSingle.value)) return false
    return !options.flatOptions.value.some(o => options.sameValue(o.value, v))
  })

  return { panelItems, panelRows, canAddCustom }
}
