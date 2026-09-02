<script setup lang="ts" generic="TItem extends Record<string, unknown> = Record<string, unknown>">
import { computed, nextTick, ref, useId, watch } from 'vue'

import { useAnnouncer } from '../../composables/useAnnouncer'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrButton from '../GrButton'
import GrButtonGroup from '../GrButtonGroup'
import GrCheckbox from '../GrCheckbox'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import GrInput from '../GrInput'
import { matchesQueryParts, normalizeOptionQuery } from '../shared/optionFilter'
import type { GrComponentSize } from '../shared/sizes'
import {
  grTransferActionsClass,
  grTransferEmptyClass,
  grTransferHeaderClass,
  grTransferMarkClass,
  grTransferOptionClass,
  grTransferPanelClass,
  grTransferSearchClass,
  transferActionIconClass,
  transferActionInertClass,
  transferCounterClass,
  transferLabelClass,
  transferListBase,
  transferMarkIconClass,
  transferRootBase,
  transferStatusClass,
  transferTitleClass,
} from './grTransferStyles'
import type { GrTransferDirection, GrTransferKey, GrTransferSide } from './transferModel'
import {
  edgeTarget,
  insertKeys,
  keyAfterRemoval,
  normalizeKeys,
  removeKeys,
  splitByModel,
  stepTarget,
} from './transferModel'
import type { GrTransferDragSession, GrTransferDropSpot } from './useTransferDrag'
import { useTransferDrag } from './useTransferDrag'
import type { GrTransferSelection } from './transferSelection'
import {
  allVisibleState,
  applySelect,
  emptySelection,
  pruneSelection,
  selectIntentFrom,
  toggleAllVisible,
} from './transferSelection'

import IconCheck from '~icons/lucide/check'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'

export type GrTransferItemKey<T> = string | ((item: T) => GrTransferKey)
export type GrTransferItemLabel<T> = string | ((item: T) => string)
export type GrTransferItemFlag<T> = string | ((item: T) => boolean)

export interface GrTransferProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Каталог целиком: обе панели — одна его раскладка. */
  items: T[]
  /** Ключи правой панели **в её порядке**: порядок и есть значение. */
  modelValue: GrTransferKey[]
  itemKey?: GrTransferItemKey<T>
  itemLabel?: GrTransferItemLabel<T>
  itemDisabled?: GrTransferItemFlag<T>
  /** Имя левой панели. Это доступное имя её `listbox`, а не украшение. */
  sourceTitle?: string
  /** Имя правой панели. */
  targetTitle?: string
  /** Поле поиска в каждой панели. */
  searchable?: boolean
  /** Свой матчер: встроенный ищет по `itemLabel`, а строка может показывать больше. */
  filter?: (item: T, query: string) => boolean
  /** Правую панель можно переставлять. */
  sortable?: boolean
  /** Перетаскивание строк указателем. Усиление поверх кнопок, а не контракт. */
  draggable?: boolean
  /** Высота панелей: обе одинаковы и прокручиваются внутри себя. */
  maxHeight?: number | string
  size?: GrComponentSize
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  ariaLabel?: string
}

export interface GrTransferEmits {
  (e: 'update:modelValue', value: GrTransferKey[]): void
  (e: 'change', value: GrTransferKey[]): void
  (e: 'transfer', keys: GrTransferKey[], direction: GrTransferDirection): void
  (e: 'search', query: string, side: GrTransferSide): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrTransferProps<TItem>>(), {
  itemKey: undefined,
  itemLabel: undefined,
  itemDisabled: undefined,
  sourceTitle: undefined,
  targetTitle: undefined,
  searchable: true,
  filter: undefined,
  sortable: true,
  draggable: undefined,
  maxHeight: undefined,
  size: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrTransferEmits>()

defineSlots<{
  /** Своя строка. Слот доменный: у соседей `item` — строка списка, здесь тоже. */
  item?: (props: {
    item: TItem
    side: GrTransferSide
    index: number
    selected: boolean
    disabled: boolean
  }) => unknown
  /** Своя шапка панели: имя, счётчик, отметка «выбрать всё». */
  header?: (props: {
    side: GrTransferSide
    title: string
    selected: number
    total: number
    shown: number
  }) => unknown
  /** Своя колонка кнопок между панелями. */
  actions?: (props: {
    toTarget: () => void
    toSource: () => void
    canToTarget: boolean
    canToSource: boolean
  }) => unknown
  /** Пустая панель. `filtered` — пусто из-за поиска, а не по сути. */
  empty?: (props: { side: GrTransferSide, filtered: boolean }) => unknown
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTransfer' })
const resolvedDraggable = useGrComponentProp('GrTransfer', 'draggable', () => props.draggable, true)

const {
  disabled: isDisabled,
  readonly: isReadonly,
  invalid: isInvalid,
  required: isRequired,
  locked: isLocked,
  id: fieldId,
  labelId: fieldLabelId,
  describedBy,
} = useGrFormControl(() => props)

const rootEl = ref<HTMLElement | null>(null)
const uid = useId()
const sourceTitleId = `${uid}-source-title`
const targetTitleId = `${uid}-target-title`
const sourceListId = `${uid}-source-list`
const targetListId = `${uid}-target-list`

if (__GR_DEV__) {
  if (!Array.isArray(props.items)) {
    console.warn(
      `[granularity] GrTransfer: обязательный проп \`items\` должен быть массивом — получено ${typeof props.items}.`,
    )
  }
  if (!Array.isArray(props.modelValue)) {
    console.warn(
      `[granularity] GrTransfer: обязательный проп \`modelValue\` должен быть массивом — получено ${typeof props.modelValue}.`,
    )
  }
}

/**
 * Синтетический ключ для элемента без своего: общий ключ пометил бы выбранными
 * все строки разом. Приём и причина — из `GrDataTable`.
 */
const syntheticKeys = new WeakMap<object, string>()
let syntheticCount = 0
let warnedSynthetic = false

function keyOf(item: TItem): GrTransferKey {
  // Фолбэк здесь, а не в `withDefaults`: у дженерик-компонента вывод дефолта
  // не снимает опциональность, и `item[source]` переставал типизироваться.
  const source = props.itemKey ?? 'id'
  const value = typeof source === 'function' ? source(item) : item[source]

  if (typeof value === 'string' && value !== '')
    return value
  if (typeof value === 'number')
    return value

  const known = syntheticKeys.get(item)
  if (known !== undefined)
    return known

  syntheticCount += 1
  const generated = `${uid}-synthetic-${syntheticCount}`
  syntheticKeys.set(item, generated)

  if (__GR_DEV__ && !warnedSynthetic) {
    warnedSynthetic = true
    console.warn(
      '[granularity] GrTransfer: у элемента нет значения `itemKey` — выдан временный ключ. '
      + 'Он не переживёт перезагрузку данных, и `modelValue` с ним не сойдётся: задайте `itemKey`.',
    )
  }

  return generated
}

function labelOf(item: TItem): string {
  const source = props.itemLabel ?? 'label'

  return typeof source === 'function' ? source(item) : String(item[source] ?? '')
}

function disabledOf(item: TItem): boolean {
  const source = props.itemDisabled ?? 'disabled'

  return typeof source === 'function' ? source(item) : Boolean(item[source])
}

const split = computed(() => splitByModel(props.items ?? [], keyOf, props.modelValue ?? []))

if (__GR_DEV__) {
  watch(split, (value) => {
    if (value.duplicated.length > 0) {
      console.warn(
        `[granularity] GrTransfer: ключи повторяются в \`items\` (${value.duplicated.join(', ')}) — `
        + 'рисуется первый элемент с таким ключом.',
      )
    }
    if (value.unresolved.length > 0 && (props.items?.length ?? 0) > 0) {
      console.warn(
        `[granularity] GrTransfer: ключи из \`modelValue\` не найдены в \`items\` (${value.unresolved.join(', ')}). `
        + 'Они сохранены в значении, но не показаны: каталог мог ещё не приехать.',
      )
    }
  }, { immediate: true })
}

const queries = ref<Record<GrTransferSide, string>>({ source: '', target: '' })
const selections = ref<Record<GrTransferSide, GrTransferSelection>>({
  source: emptySelection,
  target: emptySelection,
})

function itemsOf(side: GrTransferSide): TItem[] {
  return side === 'source' ? split.value.source : split.value.target
}

function matches(item: TItem, query: string): boolean {
  if (props.filter)
    return props.filter(item, query)

  return matchesQueryParts([labelOf(item)], normalizeOptionQuery(query))
}

function visibleOf(side: GrTransferSide): TItem[] {
  const query = queries.value[side]
  if (!props.searchable || normalizeOptionQuery(query) === '')
    return itemsOf(side)

  return itemsOf(side).filter(item => matches(item, query))
}

const visible = computed<Record<GrTransferSide, TItem[]>>(() => ({
  source: visibleOf('source'),
  target: visibleOf('target'),
}))

const visibleKeys = computed<Record<GrTransferSide, GrTransferKey[]>>(() => ({
  source: visible.value.source.map(keyOf),
  target: visible.value.target.map(keyOf),
}))

function selectableOf(side: GrTransferSide): (key: GrTransferKey) => boolean {
  return (key) => {
    const item = itemsOf(side).find(candidate => keyOf(candidate) === key)

    return item !== undefined && !disabledOf(item)
  }
}

// Состав каталога сменился — выделение чистится от исчезнувших ключей.
watch(split, () => {
  selections.value = {
    source: pruneSelection(selections.value.source, split.value.source.map(keyOf)),
    target: pruneSelection(selections.value.target, split.value.target.map(keyOf)),
  }
})

const titles = computed<Record<GrTransferSide, string>>(() => ({
  source: props.sourceTitle ?? t('gr.transfer.sourceTitle', 'Available'),
  target: props.targetTitle ?? t('gr.transfer.targetTitle', 'Selected'),
}))

function setSelection(side: GrTransferSide, next: GrTransferSelection): void {
  selections.value = { ...selections.value, [side]: next }
}

function toggleAll(side: GrTransferSide): void {
  if (isDisabled.value)
    return

  setSelection(side, toggleAllVisible(selections.value[side], visibleKeys.value[side], selectableOf(side)))
}

/** Что реально уедет: отмеченное минус запрещённое. Скрытое поиском — уезжает. */
function movableOf(side: GrTransferSide): GrTransferKey[] {
  const selectable = selectableOf(side)
  const order = itemsOf(side).map(keyOf)

  return order.filter(key => selections.value[side].keys.has(key) && selectable(key))
}

const canToTarget = computed(() => !isLocked.value && movableOf('source').length > 0)
const canToSource = computed(() => !isLocked.value && movableOf('target').length > 0)

function commit(next: GrTransferKey[]): void {
  emit('update:modelValue', next)
  emit('change', next)
}

async function transfer(keys: GrTransferKey[], direction: GrTransferDirection): Promise<void> {
  if (isLocked.value || keys.length === 0)
    return

  const from: GrTransferSide = direction === 'toTarget' ? 'source' : 'target'
  const to: GrTransferSide = direction === 'toTarget' ? 'target' : 'source'
  const model = normalizeKeys(props.modelValue ?? [])

  const nextFocus = keyAfterRemoval(visibleKeys.value[from], keys, rovingOf(from).rovingKey.value)

  commit(direction === 'toTarget' ? insertKeys(model, keys, null) : removeKeys(model, keys))

  // Выделение переезжает вместе со строками: `Alt`+стрелка сразу ставит их на
  // место, а возврат — одно нажатие.
  selections.value = {
    ...selections.value,
    [from]: emptySelection,
    [to]: { keys: new Set(keys), anchor: keys[0] },
  }

  emit('transfer', keys, direction)
  announce(t('gr.transfer.moved', '{count} moved to {list}', {
    count: keys.length,
    n: keys.length,
    list: titles.value[to],
  }))

  await nextTick()
  if (nextFocus !== undefined)
    void rovingOf(from).focusKey(nextFocus)
  else void rovingOf(to).focusKey(keys[0])
}

function transferSelected(direction: GrTransferDirection): void {
  const side: GrTransferSide = direction === 'toTarget' ? 'source' : 'target'
  const keys = movableOf(side)
  if (keys.length > 0) {
    void transfer(keys, direction)
    return
  }

  // Ничего не отмечено — переносится строка под фокусом: так `Enter` работает
  // сразу, без обязательного предварительного `Space`.
  const focused = rovingOf(side).rovingKey.value
  if (focused !== undefined && selectableOf(side)(focused))
    void transfer([focused], direction)
}

/** Перестановка отключена, пока панель отфильтрована: см. `docs/components/GrTransfer.md`. */
const reorderAllowed = computed(() => props.sortable
  && !isLocked.value
  && normalizeOptionQuery(queries.value.target) === '')

function reorder(target: GrTransferKey | null | undefined, keys: GrTransferKey[]): void {
  if (target === undefined || keys.length === 0)
    return

  const model = normalizeKeys(props.modelValue ?? [])
  commit(insertKeys(model, keys, target))

  const position = removeKeys(model, keys).findIndex(key => key === target)
  announce(t('gr.transfer.reordered', 'Position {position} of {count}', {
    position: (position < 0 ? model.length - keys.length : position) + 1,
    count: model.length,
  }))
}

function moveBlock(delta: 1 | -1): void {
  const keys = movableOf('target')
  const moving = keys.length > 0 ? keys : blockUnderFocus('target')
  if (moving.length === 0)
    return

  if (!reorderAllowed.value) {
    if (props.sortable && !isLocked.value)
      announce(t('gr.transfer.reorderFiltered', 'Reordering is off while a search is active'))
    return
  }

  reorder(stepTarget(normalizeKeys(props.modelValue ?? []), moving, delta), moving)
}

function moveBlockToEdge(edge: 'start' | 'end'): void {
  const keys = movableOf('target')
  const moving = keys.length > 0 ? keys : blockUnderFocus('target')
  if (moving.length === 0 || !reorderAllowed.value)
    return

  reorder(edgeTarget(normalizeKeys(props.modelValue ?? []), moving, edge), moving)
}

function blockUnderFocus(side: GrTransferSide): GrTransferKey[] {
  const focused = rovingOf(side).rovingKey.value

  return focused !== undefined && selectableOf(side)(focused) ? [focused] : []
}

const sourceRows = ref<Map<GrTransferKey, HTMLElement>>(new Map())
const targetRows = ref<Map<GrTransferKey, HTMLElement>>(new Map())
const searchEls = ref<Record<GrTransferSide, HTMLElement | null>>({ source: null, target: null })
const panelEls = ref<Record<GrTransferSide, HTMLElement | null>>({ source: null, target: null })
const listEls = ref<Record<GrTransferSide, HTMLElement | null>>({ source: null, target: null })

function rowsOf(side: GrTransferSide): Map<GrTransferKey, HTMLElement> {
  return side === 'source' ? sourceRows.value : targetRows.value
}

function registerRow(side: GrTransferSide, key: GrTransferKey, el: Element | null): void {
  const map = rowsOf(side)
  if (el instanceof HTMLElement)
    map.set(key, el)
  else map.delete(key)
}

function makeRoving(side: GrTransferSide) {
  return useRovingFocus<GrTransferKey>({
    items: () => visibleKeys.value[side],
    elementFor: key => rowsOf(side).get(key) ?? null,
    orientation: () => 'vertical',
    // Кольцо не замкнуто: замкнутое делает `Shift`-диапазоны бессмысленными.
    wrap: () => false,
    // Выключенная строка остаётся достижимой — иначе AT не прочтёт, что она есть.
    skipDisabled: () => false,
    onOverflow: (edge) => {
      if (edge !== 'start')
        return false

      // Вверх из первой строки — в поле поиска своей панели (приём `GrTreeSelect`).
      const input = searchEls.value[side]?.querySelector('input')
      if (!input)
        return false

      input.focus()
      return true
    },
  })
}

const sourceRoving = makeRoving('source')
const targetRoving = makeRoving('target')

function rovingOf(side: GrTransferSide) {
  return side === 'source' ? sourceRoving : targetRoving
}

const dragging = useTransferDrag({
  disabled: () => isLocked.value || !resolvedDraggable.value,
  visibleKeys: side => visibleKeys.value[side],
  rowEl: (side, key) => rowsOf(side).get(key) ?? null,
  panelEl: side => panelEls.value[side],
  scrollerEl: side => listEls.value[side],
  // Взялись за отмеченную строку — едет всё выделение; за чужую — только она.
  blockFor: (side, key) => {
    const selectable = selectableOf(side)
    if (!selectable(key))
      return []

    const chosen = movableOf(side)

    return chosen.includes(key) ? chosen : [key]
  },
  allowSameSide: side => side === 'target' && reorderAllowed.value,
  onDrop: (session, spot) => {
    const model = normalizeKeys(props.modelValue ?? [])

    if (spot.side === session.side) {
      reorder(spot.before, [...session.keys])
      return
    }

    if (spot.side === 'target') {
      commit(insertKeys(model, [...session.keys], spot.before))
      emit('transfer', [...session.keys], 'toTarget')
      announce(t('gr.transfer.moved', '{count} moved to {list}', {
        count: session.keys.length,
        n: session.keys.length,
        list: titles.value.target,
      }))
      return
    }

    commit(removeKeys(model, [...session.keys]))
    emit('transfer', [...session.keys], 'toSource')
    announce(t('gr.transfer.moved', '{count} moved to {list}', {
      count: session.keys.length,
      n: session.keys.length,
      list: titles.value.source,
    }))
  },
  onCancel: () => announce(t('gr.transfer.cancelled', 'Move cancelled')),
})

/**
 * Вызов через обработчик, а не `@pointerdown="dragging.startFrom(...)"`: Vue
 * считает такое выражение инлайн-инструкцией и возвращённую функцию
 * выбрасывает — жест не начинался бы вовсе. Приём `GrSortableList`.
 */
function onRowPointerDown(side: GrTransferSide, key: GrTransferKey, event: PointerEvent): void {
  dragging.startFrom(side, key)(event)
}

function indicatorFor(side: GrTransferSide, key: GrTransferKey): 'before' | 'after' | null {
  const spot: GrTransferDropSpot | null = dragging.spot.value
  if (!spot || spot.side !== side)
    return null

  if (spot.before === key)
    return 'before'

  const keys = visibleKeys.value[side]

  return spot.before === null && keys[keys.length - 1] === key ? 'after' : null
}

function isDraggingKey(side: GrTransferSide, key: GrTransferKey): boolean {
  const session: GrTransferDragSession | null = dragging.session.value

  return session !== null && session.side === side && session.keys.includes(key)
}

function onOptionClick(side: GrTransferSide, key: GrTransferKey, event: MouseEvent): void {
  // Клик после протяжки выделение не трогает: иначе любое перетаскивание
  // схлопывало бы блок в одну строку ровно в момент отпускания.
  if (isDisabled.value || dragging.consumeClick())
    return

  rovingOf(side).setActive(key)
  setSelection(side, applySelect(
    selections.value[side],
    key,
    selectIntentFrom(event),
    visibleKeys.value[side],
    selectableOf(side),
  ))
}

function extendRange(side: GrTransferSide, key: GrTransferKey): void {
  setSelection(side, applySelect(
    selections.value[side],
    key,
    { mode: 'range', additive: false },
    visibleKeys.value[side],
    selectableOf(side),
  ))
}

function onListKeydown(side: GrTransferSide, event: KeyboardEvent): void {
  if (isDisabled.value || visibleKeys.value[side].length === 0)
    return

  const roving = rovingOf(side)
  const current = roving.rovingKey.value

  if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'A')) {
    event.preventDefault()
    toggleAll(side)
    return
  }

  if (event.key === ' ') {
    event.preventDefault()
    if (current === undefined)
      return

    if (event.shiftKey) {
      extendRange(side, current)
    }
    else {
      setSelection(side, applySelect(
        selections.value[side],
        current,
        { mode: 'toggle', additive: true },
        visibleKeys.value[side],
        selectableOf(side),
      ))
    }
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    transferSelected(side === 'source' ? 'toTarget' : 'toSource')
    return
  }

  if (side === 'target' && event.altKey) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveBlock(event.key === 'ArrowDown' ? 1 : -1)
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      moveBlockToEdge(event.key === 'Home' ? 'start' : 'end')
      return
    }
  }

  // Стрелки и `Home`/`End` ведёт примитив; `Shift` растягивает диапазон следом.
  if (!roving.handleNavigationKeys(event))
    return

  const next = roving.rovingKey.value
  if (event.shiftKey && next !== undefined)
    extendRange(side, next)
}

function onSearchKeydown(side: GrTransferSide, event: KeyboardEvent): void {
  if (event.key !== 'ArrowDown')
    return

  const first = visibleKeys.value[side][0]
  if (first === undefined)
    return

  event.preventDefault()
  void rovingOf(side).focusKey(first)
}

function onSearch(side: GrTransferSide, value: string): void {
  queries.value = { ...queries.value, [side]: value }
  emit('search', value, side)
}

const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
})

const panelStyle = computed(() => ({
  maxHeight: props.maxHeight === undefined
    ? 'var(--gr-transfer-panel-max-h, 18rem)'
    : typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
}))

function counterText(side: GrTransferSide): string {
  return t('gr.transfer.selected', '{count} of {total}', {
    count: selections.value[side].keys.size,
    total: itemsOf(side).length,
  })
}

function shownText(side: GrTransferSide): string {
  return t('gr.transfer.shown', 'Showing {shown} of {total}', {
    shown: visible.value[side].length,
    total: itemsOf(side).length,
  })
}

function emptyText(side: GrTransferSide): string {
  return normalizeOptionQuery(queries.value[side]) === ''
    ? t('gr.transfer.empty', 'Nothing here yet')
    : t('gr.transfer.emptyFiltered', 'Nothing matches the search')
}

function isFiltered(side: GrTransferSide): boolean {
  return normalizeOptionQuery(queries.value[side]) !== ''
}

function allState(side: GrTransferSide): 'checked' | 'indeterminate' | 'unchecked' {
  return allVisibleState(selections.value[side], visibleKeys.value[side], selectableOf(side))
}

function focusSide(side: GrTransferSide): void {
  const roving = rovingOf(side)
  const key = roving.rovingKey.value ?? visibleKeys.value[side][0]

  if (key !== undefined) {
    void roving.focusKey(key)
    return
  }

  searchEls.value[side]?.querySelector('input')?.focus()
}

defineExpose({
  focus: () => focusSide('target'),
  blur: () => {
    const active = document.activeElement
    if (active instanceof HTMLElement && rootEl.value?.contains(active))
      active.blur()
  },
  focusSide,
  transfer: (keys: GrTransferKey[], direction: GrTransferDirection) => void transfer(keys, direction),
  selectAll: (side: GrTransferSide) => toggleAll(side),
  clearSelection: (side?: GrTransferSide) => {
    if (side) {
      setSelection(side, emptySelection)
      return
    }
    selections.value = { source: emptySelection, target: emptySelection }
  },
})
</script>

<template>
  <div
    ref="rootEl"
    data-gr-transfer
    role="group"
    :class="transferRootBase"
    :aria-label="ariaLabel"
    :aria-disabled="isDisabled ? 'true' : undefined"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div
      v-for="side in (['source', 'target'] as GrTransferSide[])"
      :key="side"
      :ref="el => { panelEls[side] = el as HTMLElement | null }"
      :data-gr-transfer-panel="side"
      :class="grTransferPanelClass(dragging.spot.value?.side === side)"
      :style="panelStyle"
    >
      <slot
        name="header"
        :side="side"
        :title="titles[side]"
        :selected="selections[side].keys.size"
        :total="itemsOf(side).length"
        :shown="visible[side].length"
      >
        <div :class="grTransferHeaderClass(resolvedSize)">
          <!--
            Над пустой панелью отметка не рисуется вовсе, а не рисуется
            выключенной: выключенный орган управления сообщает, что выбирать
            есть что. Тот же довод, что у стрелок `GrCarousel` на краю.
          -->
          <GrCheckbox
            v-if="visible[side].length > 0"
            :model-value="allState(side) === 'checked'"
            :indeterminate="allState(side) === 'indeterminate'"
            :disabled="isDisabled"
            :size="resolvedSize"
            :aria-label="t('gr.transfer.selectAll', 'Select everything shown')"
            @update:model-value="toggleAll(side)"
          />
          <span
            :id="side === 'source' ? sourceTitleId : targetTitleId"
            :class="transferTitleClass"
          >{{ titles[side] }}</span>
          <span :class="transferCounterClass">{{ counterText(side) }}</span>
        </div>
      </slot>

      <div
        v-if="searchable"
        :ref="el => { searchEls[side] = el as HTMLElement | null }"
        :class="grTransferSearchClass(resolvedSize)"
      >
        <GrInput
          :model-value="queries[side]"
          type="search"
          clearable
          :size="resolvedSize"
          :disabled="isDisabled"
          :placeholder="t('gr.transfer.search', 'Search')"
          :aria-label="`${titles[side]} — ${t('gr.transfer.search', 'Search')}`"
          @update:model-value="(value: string) => onSearch(side, value)"
          @keydown="(event: KeyboardEvent) => onSearchKeydown(side, event)"
        />
      </div>

      <p :class="transferStatusClass" role="status" aria-live="polite">
        {{ isFiltered(side) ? shownText(side) : '' }}
      </p>

      <!--
        Список рисуется всегда, даже пустым: на нём висят `aria-required`,
        `aria-invalid` и связь с текстом ошибки, и исчезать они обязаны меньше
        всего именно тогда, когда поле пустое.
      -->
      <div
        :id="side === 'source' ? sourceListId : (fieldId ?? targetListId)"
        :ref="el => { listEls[side] = el as HTMLElement | null }"
        :data-gr-transfer-list="side"
        role="listbox"
        aria-multiselectable="true"
        :class="transferListBase"
        :aria-labelledby="side === 'target' && fieldLabelId
          ? `${fieldLabelId} ${targetTitleId}`
          : (side === 'source' ? sourceTitleId : targetTitleId)"
        :aria-describedby="side === 'target' ? describedBy : undefined"
        :aria-invalid="side === 'target' && isInvalid ? 'true' : undefined"
        :aria-required="side === 'target' && isRequired ? 'true' : undefined"
        :aria-readonly="side === 'target' && isReadonly ? 'true' : undefined"
        :aria-disabled="isDisabled ? 'true' : undefined"
        @keydown="(event: KeyboardEvent) => onListKeydown(side, event)"
      >
        <div
          v-for="(item, index) in visible[side]"
          :key="keyOf(item)"
          :ref="el => registerRow(side, keyOf(item), el as Element | null)"
          data-gr-transfer-option
          role="option"
          :aria-selected="selections[side].keys.has(keyOf(item)) ? 'true' : 'false'"
          :aria-disabled="disabledOf(item) ? 'true' : undefined"
          :tabindex="rovingOf(side).tabindexFor(keyOf(item))"
          :class="grTransferOptionClass({
            size: resolvedSize,
            selected: selections[side].keys.has(keyOf(item)),
            disabled: disabledOf(item),
            dragging: isDraggingKey(side, keyOf(item)),
            indicator: indicatorFor(side, keyOf(item)),
          })"
          @pointerdown="(event: PointerEvent) => onRowPointerDown(side, keyOf(item), event)"
          @click="(event: MouseEvent) => onOptionClick(side, keyOf(item), event)"
          @focus="rovingOf(side).setActive(keyOf(item))"
          @dblclick="!disabledOf(item) && transfer([keyOf(item)], side === 'source' ? 'toTarget' : 'toSource')"
        >
          <span
            aria-hidden="true"
            :class="grTransferMarkClass(resolvedSize, selections[side].keys.has(keyOf(item)))"
          >
            <IconCheck
              v-if="selections[side].keys.has(keyOf(item))"
              :class="transferMarkIconClass"
            />
          </span>
          <slot
            name="item"
            :item="item"
            :side="side"
            :index="index"
            :selected="selections[side].keys.has(keyOf(item))"
            :disabled="disabledOf(item)"
          >
            <span :class="transferLabelClass">{{ labelOf(item) }}</span>
          </slot>
        </div>
      </div>

      <!-- Текст пустоты — сосед списка, а не его потомок: потомки роли презентационны. -->
      <slot v-if="visible[side].length === 0" name="empty" :side="side" :filtered="isFiltered(side)">
        <p :class="grTransferEmptyClass(resolvedSize)">
          {{ emptyText(side) }}
        </p>
      </slot>
    </div>

    <div :class="grTransferActionsClass(resolvedSize)" style="order: 1">
      <slot
        name="actions"
        :to-target="() => transferSelected('toTarget')"
        :to-source="() => transferSelected('toSource')"
        :can-to-target="canToTarget"
        :can-to-source="canToSource"
      >
        <GrButtonGroup orientation="vertical" attached :size="resolvedSize">
          <GrButton
            data-gr-transfer-to-target
            variant="secondary"
            :aria-disabled="canToTarget ? undefined : 'true'"
            :class="canToTarget ? '' : transferActionInertClass"
            :aria-label="t('gr.transfer.toTarget', 'Move to selected')"
            @click="canToTarget && transferSelected('toTarget')"
          >
            <IconChevronRight :class="transferActionIconClass" aria-hidden="true" />
          </GrButton>
          <GrButton
            data-gr-transfer-to-source
            variant="secondary"
            :aria-disabled="canToSource ? undefined : 'true'"
            :class="canToSource ? '' : transferActionInertClass"
            :aria-label="t('gr.transfer.toSource', 'Move back to available')"
            @click="canToSource && transferSelected('toSource')"
          >
            <IconChevronLeft :class="transferActionIconClass" aria-hidden="true" />
          </GrButton>
        </GrButtonGroup>
      </slot>
    </div>
  </div>
</template>

<style>
/*
 * Колонка кнопок стоит между панелями, а в DOM идёт после них: так `Tab`
 * проходит левую панель целиком до кнопок, а `order` ставит её на место.
 * Порядок DOM менять нельзя — в RTL он перевернётся сам вместе с флексом.
 */
[data-gr-transfer] > [data-gr-transfer-panel='source'] { order: 0; }
[data-gr-transfer] > [data-gr-transfer-panel='target'] { order: 2; }

/*
 * Гашение кнопки, которой некуда переносить. Селектор по атрибуту внутри корня
 * сильнее одноклассовой утилиты `GrButton`, поэтому фон не зависит от порядка
 * правил в собранном CSS. Фоном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста.
 */
[data-gr-transfer] button[aria-disabled='true'] {
  background: var(--gr-muted);
  color: var(--gr-disabled-fg);
}
</style>
