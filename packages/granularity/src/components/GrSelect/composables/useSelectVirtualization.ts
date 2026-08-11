import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

import { useVirtualList } from '../../../composables/useVirtualList'
import type { GrSelectValue } from '../grSelectStyles'
import type { GrSelectPanelItem, GrSelectPanelOptionRow, GrSelectPanelRow } from './useSelectPanelItems'

/**
 * Виртуализация панели `GrSelect`.
 *
 * Набор — `[«Add …»?] + panelItems`, то есть заголовки групп идут в нём наравне
 * с опциями: на экране они занимают такую же строку. Вложенную структуру групп
 * рендер пересобирает уже из окна.
 */

/** Оценки высоты строк: опция крупнее заголовка группы. Уточняются замером. */
const OPTION_SIZE_ESTIMATE = 36
const GROUP_LABEL_SIZE_ESTIMATE = 28

export interface UseSelectVirtualizationOptions<TValue extends GrSelectValue> {
  panelItems: ComputedRef<GrSelectPanelItem<TValue>[]>
  panelRows: ComputedRef<GrSelectPanelRow<TValue>[]>
  canAddCustom: ComputedRef<boolean>
  /** Контейнер списка: по нему считается окно и замеряются строки. */
  listboxEl: Ref<HTMLElement | null>
  enabled: () => boolean
  maxHeight: () => number
}

export interface SelectVirtualization<TValue extends GrSelectValue> {
  virtualEnabled: ComputedRef<boolean>
  /** Сдвиг набора: строка «Add …» стоит перед опциями. */
  addOffset: ComputedRef<number>
  scrollToIndex: (index: number) => void
  /** Замер строки: оценка высоты уточняется по реальному узлу. */
  measure: (index: number, el: Element | null) => void
  /** ARIA набора для опции; вне виртуализации набор виден по DOM. */
  optionSetProps: (index: number) => Record<string, number> | undefined
  addOptionSetProps: ComputedRef<Record<string, number> | undefined>
  showAddOption: ComputedRef<boolean>
  renderedPanelRows: ComputedRef<GrSelectPanelRow<TValue>[]>
  listboxStyle: ComputedRef<Record<string, string>>
}

export function useSelectVirtualization<TValue extends GrSelectValue>(
  options: UseSelectVirtualizationOptions<TValue>,
): SelectVirtualization<TValue> {
  const virtualEnabled = computed(() => options.enabled())
  const addOffset = computed(() => (options.canAddCustom.value ? 1 : 0))
  const virtualCount = computed(() => options.panelItems.value.length + addOffset.value)

  const virtualizer = useVirtualList({
    container: options.listboxEl,
    count: () => (virtualEnabled.value ? virtualCount.value : 0),
    // Фильтрация пересобирает набор строк — замеры прошлого набора невалидны.
    source: () => options.panelItems.value,
    itemSize: (index) => {
      const item = options.panelItems.value[index - addOffset.value]
      return item?.kind === 'group' ? GROUP_LABEL_SIZE_ESTIMATE : OPTION_SIZE_ESTIMATE
    },
    // Панель закрыта — контейнера в раскладке нет, `clientHeight` нулевой.
    viewportSize: () => options.maxHeight(),
  })

  /**
   * Позиция и размер набора для каждой опции.
   *
   * Набор — не весь список: опция внутри `role="group"` принадлежит набору своей
   * группы, и `aria-posinset` отсчитывается от неё. Опции вне групп вместе с
   * кнопкой «Add …» образуют набор уровня listbox'а.
   */
  const optionSets = computed(() => {
    const sizes = new Map<string, number>()
    const positions = new Map<number, { setKey: string, posInSet: number }>()
    const ROOT = '__root__'

    let rootCount = options.canAddCustom.value ? 1 : 0

    options.panelItems.value.forEach((item, index) => {
      if (item.kind === 'group') return

      const setKey = item.groupKey ?? ROOT
      const next = (sizes.get(setKey) ?? (setKey === ROOT ? rootCount : 0)) + 1
      sizes.set(setKey, next)
      positions.set(index, { setKey, posInSet: next })
      if (setKey === ROOT) rootCount = next
    })

    if (options.canAddCustom.value && !sizes.has(ROOT)) sizes.set(ROOT, rootCount)

    return { sizes, positions, ROOT }
  })

  /** ARIA набора: объявляем только при виртуализации — иначе набор виден по DOM. */
  function optionSetProps(index: number): Record<string, number> | undefined {
    if (!virtualEnabled.value) return undefined

    const position = optionSets.value.positions.get(index)
    if (!position) return undefined

    return {
      'aria-setsize': optionSets.value.sizes.get(position.setKey) ?? 1,
      'aria-posinset': position.posInSet,
    }
  }

  /** ARIA для кнопки «Add …»: она первая в наборе уровня listbox'а. */
  const addOptionSetProps = computed<Record<string, number> | undefined>(() => {
    if (!virtualEnabled.value) return undefined
    return {
      'aria-setsize': optionSets.value.sizes.get(optionSets.value.ROOT) ?? 1,
      'aria-posinset': 1,
    }
  })

  /** Метка группы по её ключу: окно может начаться ниже заголовка. */
  const groupLabels = computed(() => {
    const labels = new Map<string, string>()
    for (const item of options.panelItems.value) {
      if (item.kind === 'group') labels.set(item.key, item.label)
    }
    return labels
  })

  /** Виден ли «Add …»: вне окна его рисовать нельзя — он элемент набора. */
  const showAddOption = computed(() => {
    if (!options.canAddCustom.value) return false
    return !virtualEnabled.value || virtualizer.range.value.start === 0
  })

  /**
   * Строки к отрисовке. При виртуализации группы пересобираются из среза
   * `panelItems`: группа, начатая выше окна, всё равно открывается — иначе её
   * опции оказались бы прямыми детьми listbox'а и потеряли имя набора.
   */
  const renderedPanelRows = computed<GrSelectPanelRow<TValue>[]>(() => {
    if (!virtualEnabled.value) return options.panelRows.value

    const items = options.panelItems.value
    const { start, end } = virtualizer.range.value
    const from = Math.max(0, start - addOffset.value)
    const to = Math.min(items.length, Math.max(0, end - addOffset.value))

    const rows: GrSelectPanelRow<TValue>[] = []
    let currentGroup: Extract<GrSelectPanelRow<TValue>, { kind: 'group' }> | undefined

    for (let index = from; index < to; index++) {
      const item = items[index]

      if (item.kind === 'group') {
        currentGroup = {
          kind: 'group',
          label: item.label,
          key: item.key,
          options: [],
          labelVisible: true,
          labelIndex: index,
        }
        rows.push(currentGroup)
        continue
      }

      const row: GrSelectPanelOptionRow<TValue> = { option: item.option, key: item.key, index }

      if (item.groupKey) {
        if (!currentGroup || currentGroup.key !== item.groupKey) {
          currentGroup = {
            kind: 'group',
            label: groupLabels.value.get(item.groupKey) ?? '',
            key: item.groupKey,
            options: [],
            labelVisible: false,
          }
          rows.push(currentGroup)
        }
        currentGroup.options.push(row)
        continue
      }

      currentGroup = undefined
      rows.push({ kind: 'option', ...row })
    }

    return rows
  })

  const listboxStyle = computed(() => {
    const base: Record<string, string> = { maxHeight: `${options.maxHeight()}px` }
    if (!virtualEnabled.value) return base

    return {
      ...base,
      ...virtualizer.spacerStyle.value,
    }
  })

  return {
    virtualEnabled,
    addOffset,
    scrollToIndex: index => virtualizer.scrollToIndex(index),
    measure: (index, el) => virtualizer.measure(index, el),
    optionSetProps,
    addOptionSetProps,
    showAddOption,
    renderedPanelRows,
    listboxStyle,
  }
}
