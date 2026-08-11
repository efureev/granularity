<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import { paneClass, rootClass, separatorClass } from './grSplitterStyles'
import {
  clampSize,
  shouldCollapse,
  sizeFromPointer,
  type GrSplitterBounds,
  type GrSplitterOrientation,
} from './splitterGeometry'

export type { GrSplitterOrientation } from './splitterGeometry'

/**
 * Пропы {@link GrSplitter}.
 *
 * Две панели и разделитель между ними. Размер первой панели — доля контейнера
 * в процентах: она переживает смену ширины окна и рендерится на сервере без
 * замеров.
 */
export interface GrSplitterProps {
  /** Доля первой панели в процентах. Поддерживает `v-model`; без него компонент помнит размер сам. */
  modelValue?: number
  /** Стартовая доля и точка возврата по двойному клику. */
  defaultSize?: number
  /** `horizontal` — панели рядом, `vertical` — одна над другой. */
  orientation?: GrSplitterOrientation
  /** Минимум первой панели в процентах. */
  min?: number
  /** Максимум первой панели в процентах. */
  max?: number
  /** Минимум второй панели: без него её можно задавить в ноль. */
  minEnd?: number
  /** Шаг стрелок. */
  step?: number
  /** Шаг стрелок с `Shift`. */
  bigStep?: number
  /** Разрешить сворачивание первой панели. */
  collapsible?: boolean
  /** Первая панель свёрнута. Поддерживает `v-model:collapsed`. */
  collapsed?: boolean
  /** Разделитель не тянется, не фокусируется и не отвечает на клавиши. */
  disabled?: boolean
  /** Имя разделителя для скринридера. Не задано — из локали. */
  ariaLabel?: string
}

export interface GrSplitterEmits {
  (e: 'update:modelValue', value: number): void
  (e: 'update:collapsed', value: boolean): void
  /** Конец жеста и каждый шаг с клавиатуры: сюда вешают сохранение раскладки. */
  (e: 'change', value: number): void
}

const props = withDefaults(defineProps<GrSplitterProps>(), {
  modelValue: undefined,
  defaultSize: 50,
  min: 10,
  max: 90,
  minEnd: 10,
  step: 1,
  bigStep: 10,
  collapsed: false,
  disabled: false,
  ariaLabel: undefined,
  // `undefined`, а не готовые значения: иначе `componentDefaults` до них не дошли бы.
  orientation: undefined,
  collapsible: undefined,
})

const emit = defineEmits<GrSplitterEmits>()

defineSlots<{
  /** Первая панель — та, чей размер задаёт модель. */
  start?: () => any
  /** Вторая панель: занимает остаток. */
  end?: () => any
}>()

const { t } = useGranularityTranslations()

const orientation = useGrComponentProp('GrSplitter', 'orientation', () => props.orientation, 'horizontal')
const collapsible = useGrComponentProp('GrSplitter', 'collapsible', () => props.collapsible, false)

const startId = useId()
const rootEl = ref<HTMLElement | null>(null)

const bounds = computed<GrSplitterBounds>(() => ({
  min: props.min,
  max: props.max,
  minEnd: props.minEnd,
}))

/**
 * Локальное состояние с синхронизацией из пропа — поддерживает и controlled
 * (`v-model`), и uncontrolled (сплиттер помнит размер сам), как `collapsed`
 * у `GrSidebar`.
 */
const sizeState = ref(clampSize(props.modelValue ?? props.defaultSize, bounds.value))
watch(() => props.modelValue, (value) => {
  if (value !== undefined) sizeState.value = clampSize(value, bounds.value)
})

const collapsedState = ref(props.collapsed)
watch(() => props.collapsed, value => (collapsedState.value = value))

/** Размер, к которому возвращает `Enter`: свёрнутость не должна его терять. */
const restoreSize = ref(sizeState.value)

/** Значение до начала жеста: `pointercancel` откатывает к нему. */
let sizeBeforeDrag = sizeState.value
let collapsedBeforeDrag = false

const isDragging = ref(false)

const isCollapsed = computed(() => collapsible.value && collapsedState.value)

/** Что видно на экране: свёрнутая панель — это ноль в треке, но не ноль в модели. */
const renderedSize = computed(() => (isCollapsed.value ? 0 : clampSize(sizeState.value, bounds.value)))

const gridStyle = computed(() => {
  const track = `${renderedSize.value}% var(--gr-splitter-size, 6px) 1fr`

  return orientation.value === 'horizontal'
    ? { gridTemplateColumns: track }
    : { gridTemplateRows: track }
})

/**
 * `aria-orientation` описывает **сам разделитель**, а не раскладку: панели,
 * стоящие рядом, разделяет вертикальная полоса.
 */
const separatorOrientation = computed(() => (orientation.value === 'horizontal' ? 'vertical' : 'horizontal'))

const label = computed(() => props.ariaLabel ?? t('gr.splitter.label', 'Resize panels'))

function setSize(next: number, commit: boolean): void {
  const value = clampSize(next, bounds.value)
  const changed = value !== sizeState.value

  sizeState.value = value
  if (changed) emit('update:modelValue', value)
  if (commit) emit('change', value)
}

function setCollapsed(value: boolean): void {
  if (collapsedState.value === value) return

  collapsedState.value = value
  emit('update:collapsed', value)
}

/**
 * Шаг размера. Свёрнутая панель на первое нажатие возвращается — двигать
 * то, чего не видно, значит менять раскладку вслепую.
 */
function moveBy(delta: number): void {
  if (isCollapsed.value) {
    setCollapsed(false)
    setSize(restoreSize.value, true)
    return
  }

  restoreSize.value = clampSize(sizeState.value + delta, bounds.value)
  setSize(sizeState.value + delta, true)
}

function toggleCollapsed(): void {
  if (!collapsible.value) return

  if (isCollapsed.value) {
    setCollapsed(false)
    setSize(restoreSize.value, true)
    return
  }

  restoreSize.value = sizeState.value
  setCollapsed(true)
  emit('change', 0)
}

function reset(): void {
  setCollapsed(false)
  restoreSize.value = clampSize(props.defaultSize, bounds.value)
  setSize(props.defaultSize, true)
}

// ————— Указатель.
function onPointerMove(event: PointerEvent): void {
  const rect = rootEl.value?.getBoundingClientRect()
  if (!rect) return

  // Против выделения текста под курсором во время жеста.
  event.preventDefault()

  const raw = sizeFromPointer(rect, event.clientX, event.clientY, orientation.value)

  if (collapsible.value && shouldCollapse(raw, bounds.value)) {
    if (!collapsedState.value) restoreSize.value = sizeState.value
    setCollapsed(true)
    return
  }

  setCollapsed(false)
  restoreSize.value = clampSize(raw, bounds.value)
  setSize(raw, false)
}

function stopListening(): void {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
}

function endDrag(commit: boolean): void {
  if (!isDragging.value) return

  isDragging.value = false
  stopListening()

  if (commit) {
    emit('change', renderedSize.value)
    return
  }

  // Оборванный жест (браузер забрал указатель) не коммитит ничего: раскладка
  // возвращается к той, что была до нажатия.
  setCollapsed(collapsedBeforeDrag)
  setSize(sizeBeforeDrag, false)
}

function onPointerUp(): void {
  endDrag(true)
}

function onPointerCancel(): void {
  endDrag(false)
}

function onPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  // Только основная кнопка: правый и средний клик перетаскиванием не считаются.
  if (event.button !== 0) return

  sizeBeforeDrag = sizeState.value
  collapsedBeforeDrag = collapsedState.value
  isDragging.value = true

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)
}

onBeforeUnmount(stopListening)

// ————— Клавиатура.
const decreaseKey = computed(() => (orientation.value === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'))
const increaseKey = computed(() => (orientation.value === 'horizontal' ? 'ArrowRight' : 'ArrowDown'))

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return

  const step = event.shiftKey ? props.bigStep : props.step

  if (event.key === decreaseKey.value) moveBy(-step)
  else if (event.key === increaseKey.value) moveBy(step)
  else if (event.key === 'Home') moveBy(-100)
  else if (event.key === 'End') moveBy(100)
  else if (event.key === 'Enter') toggleCollapsed()
  else return

  // Дошли сюда — клавиша наша: страница не должна ещё и прокрутиться.
  event.preventDefault()
}

function onDoubleClick(): void {
  if (props.disabled) return

  reset()
}
</script>

<template>
  <div
    ref="rootEl"
    data-gr-splitter
    :data-orientation="orientation"
    :data-dragging="isDragging ? '' : undefined"
    :data-collapsed="isCollapsed ? '' : undefined"
    :class="rootClass"
    :style="gridStyle"
  >
    <div
      :id="startId"
      data-gr-splitter-pane="start"
      :class="paneClass"
    >
      <slot name="start" />
    </div>

    <div
      data-gr-splitter-separator
      role="separator"
      :tabindex="disabled ? undefined : 0"
      :aria-orientation="separatorOrientation"
      :aria-label="label"
      :aria-controls="startId"
      :aria-valuenow="Math.round(renderedSize)"
      :aria-valuemin="Math.round(min)"
      :aria-valuemax="Math.round(max)"
      :aria-disabled="disabled ? 'true' : undefined"
      :class="separatorClass"
      @pointerdown="onPointerDown"
      @keydown="onKeydown"
      @dblclick="onDoubleClick"
    />

    <div
      data-gr-splitter-pane="end"
      :class="paneClass"
    >
      <slot name="end" />
    </div>
  </div>
</template>

<style>
[data-gr-splitter-separator] {
  background-color: var(--gr-splitter-color, var(--gr-brd));
}

/*
 * Зона захвата шире видимой полосы: шесть пикселей мышью не берутся, а делать
 * ради этого полосу толще — значит красить раскладку под удобство мыши.
 */
[data-gr-splitter-separator]::before {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--gr-splitter-hit, 4px));
}

/* Насечка: короткая полоса посередине — единственный видимый намёк, что это ручка. */
[data-gr-splitter-separator]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: var(--gr-radius-full);
  background-color: var(--gr-splitter-hover-color, var(--gr-muted-fg));
  opacity: 0;
  transform: translate(-50%, -50%);
  transition: opacity var(--gr-duration-fast) var(--gr-ease-out);
}

[data-gr-splitter][data-orientation='horizontal'] [data-gr-splitter-separator] {
  cursor: col-resize;
}

[data-gr-splitter][data-orientation='horizontal'] [data-gr-splitter-separator]::after {
  width: 2px;
  height: var(--gr-splitter-grip, 24px);
}

[data-gr-splitter][data-orientation='vertical'] [data-gr-splitter-separator] {
  cursor: row-resize;
}

[data-gr-splitter][data-orientation='vertical'] [data-gr-splitter-separator]::after {
  width: var(--gr-splitter-grip, 24px);
  height: 2px;
}

[data-gr-splitter-separator]:hover {
  background-color: var(--gr-splitter-hover-color, var(--gr-muted-fg));
}

[data-gr-splitter-separator]:hover::after,
[data-gr-splitter-separator]:focus-visible::after {
  opacity: 1;
}

/* На залитой полосе насечка читается только вырезом — цветом страницы. */
[data-gr-splitter-separator]:hover::after,
[data-gr-splitter][data-dragging] [data-gr-splitter-separator]::after {
  background-color: var(--gr-bg);
}

/* Во время жеста полоса подсвечена, даже если курсор ушёл с неё. */
[data-gr-splitter][data-dragging] [data-gr-splitter-separator] {
  background-color: var(--gr-splitter-active-color, var(--gr-primary));
}

[data-gr-splitter][data-dragging] [data-gr-splitter-separator]::after {
  opacity: 1;
}

/* Жест не должен попутно выделять текст в панелях. */
[data-gr-splitter][data-dragging] {
  user-select: none;
}

[data-gr-splitter-separator][aria-disabled='true'] {
  cursor: default;
}

[data-gr-splitter-separator][aria-disabled='true']::after {
  display: none;
}
</style>
