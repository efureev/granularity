import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

import { useVirtualList } from '../../composables/useVirtualList'

/**
 * Панель списка опций с группами — общая машинерия `GrSelect` и `GrAutocomplete`.
 *
 * Модуль ничего не знает об опции: ему нужны только её место в наборе и
 * принадлежность группе. Поэтому он обобщён по типу опции, а не по типу
 * значения — иначе у двух компонентов с разными шкалами значений получилось бы
 * две копии одного алгоритма, и разошлись бы они молча.
 *
 * Разделение ответственности: **что показывать** решает компонент (у каждого
 * своя фильтрация — локальный матчер, серверный ответ, «добавить своё»), а
 * **как это разложить** — здесь.
 */

/** Элемент панели: заголовок группы либо опция. Плоский, в порядке отрисовки. */
export type OptionPanelItem<TOption>
  = | { kind: 'group', label: string, key: string }
  /** `groupKey` связывает опцию с заголовком её группы для скринридера. */
    | { kind: 'option', option: TOption, key: string, groupKey?: string }

export type OptionPanelOptionRow<TOption> = {
  option: TOption
  key: string
  /** Позиция в плоском наборе: из неё строится `id`, поэтому она не от значения. */
  index: number
}

export type OptionPanelGroupRow<TOption> = {
  kind: 'group'
  label: string
  key: string
  options: OptionPanelOptionRow<TOption>[]
  /**
   * Есть ли в этой отрисовке видимый заголовок. При виртуализации окно может
   * начаться серединой группы: обёртка нужна всё равно, а заголовка нет —
   * имя тогда идёт в `aria-label`.
   */
  labelVisible?: boolean
  /** Позиция заголовка в наборе — по ней его замеряет виртуализатор. */
  labelIndex?: number
}

export type OptionPanelRow<TOption>
  = | OptionPanelGroupRow<TOption>
    | ({ kind: 'option' } & OptionPanelOptionRow<TOption>)

/**
 * Плоский набор → строки для рендера: заголовок группы не сосед опций, а их
 * контейнер.
 *
 * Прямыми потомками `role="listbox"` обязаны быть только опции, иначе диктор
 * считает заголовок таким же элементом выбора. Имя группе даёт `aria-labelledby`
 * на её заголовке.
 *
 * `windowed` описывает срез: при виртуализации окно может начаться серединой
 * группы, и такая группа открывается **без** видимого заголовка — иначе её
 * опции оказались бы прямыми детьми listbox'а и потеряли имя набора.
 */
export function buildOptionPanelRows<TOption>(
  items: OptionPanelItem<TOption>[],
  options: {
    /** Смещение индексов, если срез начат не с нуля. */
    offset?: number
    windowed?: boolean
    /** Метки групп по ключу — нужны группе, чей заголовок остался выше окна. */
    groupLabels?: Map<string, string>
  } = {},
): OptionPanelRow<TOption>[] {
  const offset = options.offset ?? 0
  const rows: OptionPanelRow<TOption>[] = []
  let currentGroup: OptionPanelGroupRow<TOption> | undefined

  items.forEach((item, position) => {
    const index = position + offset

    if (item.kind === 'group') {
      currentGroup = {
        kind: 'group',
        label: item.label,
        key: item.key,
        options: [],
        ...(options.windowed ? { labelVisible: true, labelIndex: index } : {}),
      }
      rows.push(currentGroup)
      return
    }

    const row: OptionPanelOptionRow<TOption> = { option: item.option, key: item.key, index }

    if (item.groupKey) {
      if (!currentGroup || currentGroup.key !== item.groupKey) {
        // Заголовок остался выше окна: группу всё равно открываем, имя берём из
        // словаря и объявляем через `aria-label`.
        if (!options.windowed) {
          currentGroup = undefined
          rows.push({ kind: 'option', ...row })
          return
        }

        currentGroup = {
          kind: 'group',
          label: options.groupLabels?.get(item.groupKey) ?? '',
          key: item.groupKey,
          options: [],
          labelVisible: false,
        }
        rows.push(currentGroup)
      }

      currentGroup.options.push(row)
      return
    }

    currentGroup = undefined
    rows.push({ kind: 'option', ...row })
  })

  return rows
}

/** Оценки высоты строк: опция крупнее заголовка группы. Уточняются замером. */
const OPTION_SIZE_ESTIMATE = 36
const GROUP_LABEL_SIZE_ESTIMATE = 28

export interface UseOptionPanelVirtualizationOptions<TOption> {
  panelItems: ComputedRef<OptionPanelItem<TOption>[]>
  panelRows: ComputedRef<OptionPanelRow<TOption>[]>
  /** Есть ли перед опциями строка «добавить своё»: она сдвигает весь набор. */
  hasLeadingRow: ComputedRef<boolean>
  /** Контейнер списка: по нему считается окно и замеряются строки. */
  listboxEl: Ref<HTMLElement | null>
  enabled: () => boolean
  maxHeight: () => number
}

export interface OptionPanelVirtualization<TOption> {
  virtualEnabled: ComputedRef<boolean>
  /** Сдвиг набора: ведущая строка стоит перед опциями. */
  addOffset: ComputedRef<number>
  scrollToIndex: (index: number) => void
  /** Замер строки: оценка высоты уточняется по реальному узлу. */
  measure: (index: number, el: Element | null) => void
  /** ARIA набора для опции; вне виртуализации набор виден по DOM. */
  optionSetProps: (index: number) => Record<string, number> | undefined
  leadingRowSetProps: ComputedRef<Record<string, number> | undefined>
  showLeadingRow: ComputedRef<boolean>
  renderedPanelRows: ComputedRef<OptionPanelRow<TOption>[]>
  listboxStyle: ComputedRef<Record<string, string>>
}

/**
 * Виртуализация панели с группами.
 *
 * Набор — `[ведущая строка?] + panelItems`, то есть заголовки групп идут в нём
 * наравне с опциями: на экране они занимают такую же строку. Вложенную
 * структуру групп рендер пересобирает уже из окна.
 */
export function useOptionPanelVirtualization<TOption>(
  options: UseOptionPanelVirtualizationOptions<TOption>,
): OptionPanelVirtualization<TOption> {
  const virtualEnabled = computed(() => options.enabled())
  const addOffset = computed(() => (options.hasLeadingRow.value ? 1 : 0))
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
   * ведущей строкой образуют набор уровня listbox'а.
   */
  const optionSets = computed(() => {
    const sizes = new Map<string, number>()
    const positions = new Map<number, { setKey: string, posInSet: number }>()
    const ROOT = '__root__'

    let rootCount = options.hasLeadingRow.value ? 1 : 0

    options.panelItems.value.forEach((item, index) => {
      if (item.kind === 'group')
        return

      const setKey = item.groupKey ?? ROOT
      const next = (sizes.get(setKey) ?? (setKey === ROOT ? rootCount : 0)) + 1
      sizes.set(setKey, next)
      positions.set(index, { setKey, posInSet: next })
      if (setKey === ROOT)
        rootCount = next
    })

    if (options.hasLeadingRow.value && !sizes.has(ROOT))
      sizes.set(ROOT, rootCount)

    return { sizes, positions, ROOT }
  })

  /** ARIA набора: объявляем только при виртуализации — иначе набор виден по DOM. */
  function optionSetProps(index: number): Record<string, number> | undefined {
    if (!virtualEnabled.value)
      return undefined

    const position = optionSets.value.positions.get(index)
    if (!position)
      return undefined

    return {
      'aria-setsize': optionSets.value.sizes.get(position.setKey) ?? 1,
      'aria-posinset': position.posInSet,
    }
  }

  /** ARIA ведущей строки: она первая в наборе уровня listbox'а. */
  const leadingRowSetProps = computed<Record<string, number> | undefined>(() => {
    if (!virtualEnabled.value)
      return undefined
    return {
      'aria-setsize': optionSets.value.sizes.get(optionSets.value.ROOT) ?? 1,
      'aria-posinset': 1,
    }
  })

  /** Метка группы по её ключу: окно может начаться ниже заголовка. */
  const groupLabels = computed(() => {
    const labels = new Map<string, string>()
    for (const item of options.panelItems.value) {
      if (item.kind === 'group')
        labels.set(item.key, item.label)
    }
    return labels
  })

  /** Видна ли ведущая строка: вне окна её рисовать нельзя — она элемент набора. */
  const showLeadingRow = computed(() => {
    if (!options.hasLeadingRow.value)
      return false
    return !virtualEnabled.value || virtualizer.range.value.start === 0
  })

  const renderedPanelRows = computed<OptionPanelRow<TOption>[]>(() => {
    if (!virtualEnabled.value)
      return options.panelRows.value

    const items = options.panelItems.value
    const { start, end } = virtualizer.range.value
    const from = Math.max(0, start - addOffset.value)
    const to = Math.min(items.length, Math.max(0, end - addOffset.value))

    return buildOptionPanelRows(items.slice(from, to), {
      offset: from,
      windowed: true,
      groupLabels: groupLabels.value,
    })
  })

  const listboxStyle = computed(() => {
    const base: Record<string, string> = { maxHeight: `${options.maxHeight()}px` }
    if (!virtualEnabled.value)
      return base

    return { ...base, ...virtualizer.spacerStyle.value }
  })

  return {
    virtualEnabled,
    addOffset,
    scrollToIndex: index => virtualizer.scrollToIndex(index),
    measure: (index, el) => virtualizer.measure(index, el),
    optionSetProps,
    leadingRowSetProps,
    showLeadingRow,
    renderedPanelRows,
    listboxStyle,
  }
}
