<script setup lang="ts" generic="T">
import { computed, nextTick, ref, watchEffect } from 'vue'

import GrCard, { type GrCardVariant } from '../GrCard'
import { useAnnouncer } from '../../composables/useAnnouncer'
import { useDragSort } from '../../composables/useDragSort'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { insertionIndex, moveItem } from '../../composables/internal/dragSortGeometry'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import type { GrSortableOrientation } from './grSortableListStyles'
import {
  contentClass,
  dividedClass,
  emptyClass,
  handleClass,
  handleDisabledClass,
  indicatorAfterClass,
  indicatorBeforeClass,
  listClass,
  rowDisabledClass,
  rowDraggingClass,
  rowFocusClass,
  rowGrabbedClass,
  rowLayoutClass,
} from './grSortableListStyles'

import IconGripVertical from '~icons/lucide/grip-vertical'

export interface GrSortableListProps<TItem = unknown> {
  /** Набор в текущем порядке. `v-model`: наружу уходит новый массив, вход не мутируется. */
  modelValue: TItem[]
  /** Ключ элемента: имя поля или функция. Без него — индекс. */
  itemKey?: string | ((item: TItem, index: number) => string | number)
  /** Список только для чтения: ни указателем, ни с клавиатуры. */
  disabled?: boolean
  /** Ось переноса. `horizontal` — ряд с переносом по ширине. */
  orientation?: GrSortableOrientation
  /** Поверхность под списком — вариант карточки. */
  variant?: GrCardVariant
  /** Разделители между строками. */
  divided?: boolean
  /** Тянуть можно только за ручку. Выключено — тянется вся строка. */
  handleOnly?: boolean
  /** Высота видимой части: список становится скроллером с автопрокруткой при переносе. */
  maxHeight?: number | string
  /** Текст пустого состояния. Слот `#empty` сильнее. */
  emptyText?: string
  /** Имя списка для скринридера. Не задано — берётся из локали. */
  ariaLabel?: string
}

export interface GrSortableListEmits<TItem = unknown> {
  (e: 'update:modelValue', value: TItem[]): void
  (e: 'move', from: number, to: number): void
  (e: 'change', value: TItem[]): void
}

const props = withDefaults(defineProps<GrSortableListProps<T>>(), {
  itemKey: undefined,
  disabled: false,
  orientation: 'vertical',
  variant: undefined,
  divided: true,
  handleOnly: true,
  maxHeight: undefined,
  emptyText: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<GrSortableListEmits<T>>()

defineSlots<{
  item?: (props: { item: T, index: number, dragging: boolean, grabbed: boolean }) => any
  handle?: (props: { item: T, index: number, disabled: boolean }) => any
  empty?: () => any
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()

const listEl = ref<HTMLElement | null>(null)
const rowEls = new Map<string, HTMLElement>()

const count = computed(() => props.modelValue.length)
const isEmpty = computed(() => count.value === 0)
const isVertical = computed(() => props.orientation === 'vertical')

function keyOf(item: T, index: number): string {
  if (typeof props.itemKey === 'function')
    return String(props.itemKey(item, index))
  if (typeof props.itemKey === 'string')
    return String((item as Record<string, unknown>)[props.itemKey])

  return String(index)
}

const keys = computed(() => props.modelValue.map((item, index) => keyOf(item, index)))

function indexOfKey(key: string): number {
  return keys.value.indexOf(key)
}

function registerRow(key: string, el: unknown): void {
  if (el instanceof HTMLElement) {
    rowEls.set(key, el)
    return
  }

  // Перестановка размонтирует старый узел уже после того, как встал новый:
  // снимаем запись, только если она протухла (приём из `GrTree`).
  const previous = rowEls.get(key)
  if (previous && !previous.isConnected)
    rowEls.delete(key)
}

const roving = useRovingFocus<string>({
  items: () => keys.value,
  elementFor: key => rowEls.get(key) ?? null,
  orientation: () => (isVertical.value ? 'vertical' : 'horizontal'),
  wrap: () => false,
})

function applyMove(from: number, to: number): void {
  if (from < 0 || to < 0 || from === to)
    return

  const next = moveItem(props.modelValue, from, to)
  emit('update:modelValue', next)
  emit('move', from, to)
  emit('change', next)
}

const sort = useDragSort<string, number>({
  items: () => keys.value,
  elementFor: key => rowEls.get(key) ?? null,
  orientation: () => props.orientation,
  scroller: () => (props.maxHeight === undefined ? null : listEl.value),
  disabled: () => props.disabled,
  resolveTarget: (hit, source) => insertionIndex(hit, indexOfKey(source), count.value),
  onDrop: (source, to) => applyMove(indexOfKey(source), to),
  onUpdate: (source, target, mode) => {
    // Объявляется только клавиатурный перенос: у мыши всё видно на экране, а
    // поток объявлений на каждом движении указателя делает диктор бесполезным.
    if (mode !== 'keyboard' || source === null)
      return

    const position = (target ?? indexOfKey(source)) + 1
    announce(t('gr.sortable.moved', 'Position {position} of {count}', { position, count: count.value }))
  },
})

const activeIndex = computed(() => (sort.source.value === null ? -1 : indexOfKey(sort.source.value)))

/** Куда встанет строка: индикатор рисуется на строке-соседе, а не отдельным узлом. */
function indicatorFor(index: number): 'before' | 'after' | null {
  const target = sort.target.value
  if (target === null || !sort.isActive.value || index === activeIndex.value)
    return null

  if (target === index)
    return target < activeIndex.value || activeIndex.value === -1 ? 'before' : 'after'

  return null
}

function rowClass(index: number, key: string): string[] {
  const grabbed = sort.mode.value === 'keyboard' && sort.source.value === key
  const dragging = sort.mode.value === 'pointer' && sort.source.value === key
  const indicator = indicatorFor(index)

  return [
    rowLayoutClass,
    rowFocusClass,
    props.disabled ? rowDisabledClass : '',
    grabbed ? rowGrabbedClass : '',
    dragging ? rowDraggingClass : '',
    indicator === 'before' ? indicatorBeforeClass : '',
    indicator === 'after' ? indicatorAfterClass : '',
  ]
}

function startPointer(key: string, event: PointerEvent): void {
  if (props.disabled)
    return

  sort.startFrom(key)(event)
}

function grab(key: string): void {
  sort.grab(key)
  if (sort.mode.value !== 'keyboard')
    return

  // Цель ставится до объявления: `setTarget` сам объявляет позицию, и обратный
  // порядок стёр бы более полное сообщение о захвате.
  sort.setTarget(indexOfKey(key))
  announce(t('gr.sortable.grabbed', 'Grabbed. Position {position} of {count}', {
    position: indexOfKey(key) + 1,
    count: count.value,
  }))
}

async function drop(key: string): Promise<void> {
  const target = sort.target.value
  sort.drop()

  announce(t('gr.sortable.dropped', 'Dropped at position {position} of {count}', {
    position: (target ?? 0) + 1,
    count: count.value,
  }))

  // Фокус остаётся на перенесённой строке: иначе после переноса он падает на
  // тело документа и клавиатурный сценарий обрывается на первом же шаге.
  await nextTick()
  await roving.focusKey(key)
}

function cancel(): void {
  if (!sort.isActive.value)
    return

  sort.cancel()
  announce(t('gr.sortable.cancelled', 'Move cancelled'))
}

function moveTargetBy(delta: number): void {
  const current = sort.target.value ?? activeIndex.value
  const next = Math.min(count.value - 1, Math.max(0, current + delta))

  if (next !== current)
    sort.setTarget(next)
}

function onRowKeydown(event: KeyboardEvent, key: string): void {
  if (props.disabled)
    return

  const forward = isVertical.value ? 'ArrowDown' : 'ArrowRight'
  const backward = isVertical.value ? 'ArrowUp' : 'ArrowLeft'
  const grabbed = sort.mode.value === 'keyboard'

  if (event.key === 'Escape') {
    if (!grabbed)
      return

    event.preventDefault()
    cancel()
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    if (grabbed)
      void drop(key)
    else grab(key)
    return
  }

  if (grabbed) {
    // Взятая строка забирает стрелки себе: двигается она, а не фокус.
    if (event.key === forward || event.key === backward) {
      event.preventDefault()
      moveTargetBy(event.key === forward ? 1 : -1)
    }
    return
  }

  roving.handleNavigationKeys(event)
}

/** Фокус ушёл из списка — взятая строка не может остаться взятой навсегда. */
function onFocusout(event: FocusEvent): void {
  if (sort.mode.value !== 'keyboard')
    return

  const next = event.relatedTarget as Node | null
  if (next && listEl.value?.contains(next))
    return

  cancel()
}

const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.sortable.empty', 'Nothing to sort yet'))
const resolvedLabel = computed(() => props.ariaLabel ?? t('gr.sortable.label', 'Sortable list'))
const handleLabel = computed(() => t('gr.sortable.handle', 'Reorder'))

const listStyle = computed(() => (props.maxHeight === undefined
  ? undefined
  : { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight, overflow: 'auto' }))

defineExpose({
  /** Программная перестановка — та же, что делает перенос. */
  move: (from: number, to: number) => applyMove(from, to),
  focusItem: (index: number) => roving.focusKey(keys.value[index]),
})

if (__GR_DEV__) {
  watchEffect(() => {
    if (!Array.isArray(props.modelValue)) {
      console.warn(
        `[granularity] GrSortableList: обязательный проп \`modelValue\` должен быть массивом — получено ${String(props.modelValue)}.`,
      )
    }
  })
}
</script>

<template>
  <GrCard :variant="variant">
    <div
      ref="listEl"
      role="list"
      data-gr-sortable
      :aria-label="resolvedLabel"
      :aria-disabled="disabled ? 'true' : undefined"
      :class="[listClass[orientation], divided ? dividedClass : '']"
      :style="listStyle"
      @focusout="onFocusout"
    >
      <div
        v-if="isEmpty"
        data-gr-sortable-empty
        :class="emptyClass"
      >
        <slot name="empty">
          {{ resolvedEmptyText }}
        </slot>
      </div>

      <div
        v-for="(item, index) in modelValue"
        v-else
        :key="keys[index]"
        :ref="el => registerRow(keys[index], el)"
        role="listitem"
        data-gr-sortable-item
        :tabindex="disabled ? -1 : roving.tabindexFor(keys[index])"
        :aria-roledescription="handleLabel"
        :aria-posinset="index + 1"
        :aria-setsize="count"
        :aria-grabbed="sort.mode.value === 'keyboard' && sort.source.value === keys[index] ? 'true' : undefined"
        :class="rowClass(index, keys[index])"
        @keydown="onRowKeydown($event, keys[index])"
        @focus="roving.setActive(keys[index])"
        @pointerdown="handleOnly ? undefined : startPointer(keys[index], $event)"
      >
        <button
          type="button"
          tabindex="-1"
          data-gr-sortable-handle
          :class="[handleClass, disabled ? handleDisabledClass : '']"
          :aria-label="handleLabel"
          :disabled="disabled"
          @pointerdown="startPointer(keys[index], $event)"
          @click.stop
        >
          <slot
            name="handle"
            :item="item"
            :index="index"
            :disabled="disabled"
          >
            <IconGripVertical class="block" aria-hidden="true" />
          </slot>
        </button>

        <div :class="contentClass">
          <slot
            name="item"
            :item="item"
            :index="index"
            :dragging="sort.mode.value === 'pointer' && sort.source.value === keys[index]"
            :grabbed="sort.mode.value === 'keyboard' && sort.source.value === keys[index]"
          >
            {{ item }}
          </slot>
        </div>
      </div>
    </div>
  </GrCard>
</template>
