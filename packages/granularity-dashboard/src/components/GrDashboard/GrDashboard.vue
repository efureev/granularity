<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, shallowRef, useId, watch } from 'vue'

import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useDragGesture } from '@feugene/granularity/composables/useDragGesture'
import { useGrComponentProp } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useRovingFocus } from '@feugene/granularity/composables/useRovingFocus'

import type {
  GrDashboardBreakpoint,
  GrDashboardBreakpoints,
  GrDashboardCols,
  GrDashboardCompaction,
  GrDashboardItemLayout,
  GrDashboardLayout,
  GrDashboardMetrics,
  GrDashboardResponsiveLayout,
} from '../../layout'
import {
  cellFromDelta,
  clampItem,
  colsFor,
  GR_DASHBOARD_BREAKPOINTS,
  GR_DASHBOARD_COLS,
  layoutFor,
  metricsOf,
  moveItem,
  rectOfItem,
  resizeItem,
  resolveBreakpoint,
  spanFromDelta,
  withBreakpointLayout,
} from '../../layout'
import DashboardPlaceholder from '../GrDashboardFrame/shared/DashboardPlaceholder.vue'
import { animatedClass, emptyClass, gridClass } from '../GrDashboardFrame/frameStyles'
import type { GrDashboardActiveGeometry, GrDashboardContext, GrDashboardItemBounds } from './context'
import { GR_DASHBOARD_KEY } from './context'
import type { GrDashboardMode } from './grDashboardStyles'
import { gridStyle } from './grDashboardStyles'

defineOptions({ name: 'GrDashboard', inheritAttrs: false })

export interface GrDashboardProps {
  /** Раскладка на каждый брейкпоинт. `v-model:layout`. */
  layout: GrDashboardResponsiveLayout
  /** Пороги ширины контейнера, от которых начинается брейкпоинт. */
  breakpoints?: GrDashboardBreakpoints
  /** Число колонок: мапой по брейкпоинтам или одним числом на всё. */
  cols?: GrDashboardCols | number
  /**
   * Брейкпоинт первого рендера. Ширины контейнера на сервере нет, поэтому и
   * сервер, и первый клиентский рендер берут его — уточнение приходит после
   * монтирования, и гидрация не расходится.
   */
  initialBreakpoint?: GrDashboardBreakpoint
  /** Высота строки сетки, px. */
  rowHeight?: number
  /** Зазор между виджетами, px. */
  gap?: number
  /** `view` — сетка только показывает; `edit` — появляются ручки. */
  mode?: GrDashboardMode
  draggable?: boolean
  resizable?: boolean
  compact?: GrDashboardCompaction
  /** Столкновение отменяет перемещение, а не толкает соседей. */
  preventCollision?: boolean
  /** Содержимое виджета монтируется по попаданию в окно. */
  lazy?: boolean
  ariaLabel?: string
}

export interface GrDashboardEmits {
  (e: 'update:layout', value: GrDashboardResponsiveLayout): void
  (e: 'layoutChange', value: GrDashboardLayout, breakpoint: GrDashboardBreakpoint): void
  (e: 'itemMove', id: string, from: GrDashboardItemLayout, to: GrDashboardItemLayout): void
  (e: 'itemResize', id: string, from: GrDashboardItemLayout, to: GrDashboardItemLayout): void
  (e: 'breakpointChange', breakpoint: GrDashboardBreakpoint, cols: number): void
}

const props = withDefaults(defineProps<GrDashboardProps>(), {
  breakpoints: () => GR_DASHBOARD_BREAKPOINTS,
  cols: () => GR_DASHBOARD_COLS,
  initialBreakpoint: 'lg',
  // `undefined`, а не готовые значения: иначе `componentDefaults` до них не дошли бы.
  rowHeight: undefined,
  gap: undefined,
  mode: undefined,
  draggable: undefined,
  resizable: undefined,
  compact: undefined,
  preventCollision: undefined,
  lazy: undefined,
})

const emit = defineEmits<GrDashboardEmits>()

defineSlots<{
  default?: () => unknown
  empty?: () => unknown
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()

const rowHeight = useGrComponentProp('GrDashboard', 'rowHeight', () => props.rowHeight, 64)
const gap = useGrComponentProp('GrDashboard', 'gap', () => props.gap, 12)
const mode = useGrComponentProp('GrDashboard', 'mode', () => props.mode, 'view')
const draggable = useGrComponentProp('GrDashboard', 'draggable', () => props.draggable, true)
const resizable = useGrComponentProp('GrDashboard', 'resizable', () => props.resizable, true)
const compaction = useGrComponentProp('GrDashboard', 'compact', () => props.compact, 'vertical')
const preventCollision = useGrComponentProp('GrDashboard', 'preventCollision', () => props.preventCollision, false)
const lazy = useGrComponentProp('GrDashboard', 'lazy', () => props.lazy, false)

const rootId = useId()
const rootEl = ref<HTMLElement | null>(null)
const itemEls = new Map<string, HTMLElement>()
const handleEls = new Map<string, HTMLElement>()

/** Границы, объявленные виджетами. `reactive`, потому что читаются в `computed`. */
const bounds = reactive(new Map<string, GrDashboardItemBounds>())

// Ширина известна только в браузере: на сервере и в первом клиентском рендере
// работает `initialBreakpoint` (`docs/ssr.md`, правило 6).
const containerWidth = ref<number | null>(null)

const breakpoint = computed(() => (
  containerWidth.value === null
    ? props.initialBreakpoint
    : resolveBreakpoint(containerWidth.value, props.breakpoints)
))

const cols = computed(() => colsFor(breakpoint.value, props.cols))

const metrics = computed<GrDashboardMetrics>(() => metricsOf(
  containerWidth.value ?? 0,
  cols.value,
  rowHeight.value,
  gap.value,
))

const moveOptions = computed(() => ({
  cols: cols.value,
  compact: compaction.value,
  preventCollision: preventCollision.value,
}))

/** Раскладка брейкпоинта в том виде, в каком её объявило приложение. */
const declaredLayout = computed<GrDashboardLayout>(() => layoutFor(props.layout, breakpoint.value, {
  breakpoints: props.breakpoints,
  cols: props.cols,
}))

/**
 * Та же раскладка с наложенными границами виджетов.
 *
 * Берутся **только** границы: `title` виджет объявляет для ручек и объявлений,
 * и месту в раскладке он не принадлежит. Попади он сюда — уехал бы в
 * `update:layout` и дальше в хранилище, где протух бы при первой смене языка.
 */
const baseLayout = computed<GrDashboardLayout>(() => declaredLayout.value.map((item) => {
  const declared = bounds.get(item.id)
  if (!declared) return clampItem(item, cols.value)

  return clampItem({
    minW: declared.minW,
    minH: declared.minH,
    maxW: declared.maxW,
    maxH: declared.maxH,
    static: declared.static,
    ...item,
  }, cols.value)
}))

/**
 * Раскладка, которую видит пользователь во время жеста.
 *
 * Отдельная от `baseLayout`, потому что жест не коммитит ничего до отпускания:
 * оборванный `pointercancel` обязан вернуть раскладку в исходное состояние.
 */
const preview = shallowRef<GrDashboardLayout | null>(null)

const currentLayout = computed(() => preview.value ?? baseLayout.value)

const order = computed(() => currentLayout.value.map(item => item.id))

function itemFor(id: string): GrDashboardItemLayout | undefined {
  return currentLayout.value.find(item => item.id === id)
}

/**
 * Наружу уходит раскладка приложения с новыми координатами — и ничего сверх.
 *
 * Границы, объявленные пропами виджета, в модель не подмешиваются: они живут в
 * разметке, и дублировать их в сохраняемом JSON значит хранить две правды,
 * которые разойдутся на первой же правке шаблона.
 */
function commit(next: GrDashboardLayout): void {
  const declared = new Map(declaredLayout.value.map(item => [item.id, item]))

  const cleaned = next.map((item) => {
    const origin = declared.get(item.id)

    return origin ? { ...origin, x: item.x, y: item.y, w: item.w, h: item.h } : item
  })

  emit('update:layout', withBreakpointLayout(props.layout, breakpoint.value, cleaned))
  emit('layoutChange', cleaned, breakpoint.value)
}

// ————— Ширина контейнера и брейкпоинт.

let observer: ResizeObserver | null = null

/**
 * Нулевая ширина — это не «самый узкий экран», а «контейнер не отрисован»:
 * скрытая вкладка, свёрнутая панель, `display: none`. Принять её за брейкпоинт
 * значит перевести дашборд на две колонки и записать эту раскладку в модель —
 * молча и необратимо.
 */
function measure(): void {
  const width = rootEl.value?.getBoundingClientRect().width ?? 0
  if (width > 0) containerWidth.value = width
}

onMounted(() => {
  measure()

  // Наблюдатель один и на контейнере: он выбирает брейкпоинт, а не считает
  // пиксели виджетов — их раскладывает CSS Grid.
  if (typeof ResizeObserver === 'undefined') return

  observer = new ResizeObserver(measure)
  if (rootEl.value) observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

watch([breakpoint, cols], ([nextBreakpoint, nextCols], previous) => {
  if (previous && previous[0] === nextBreakpoint) return

  emit('breakpointChange', nextBreakpoint, nextCols)
})

// ————— Указательный жест.

interface DragState {
  id: string
  kind: 'move' | 'resize'
  origin: GrDashboardItemLayout
  metrics: GrDashboardMetrics
  pointerX: number
  pointerY: number
  cell: { x: number, y: number }
  span: { w: number, h: number }
}

const dragState = shallowRef<DragState | null>(null)
const activeGeometry = shallowRef<GrDashboardActiveGeometry | null>(null)

let pendingDx = 0
let pendingDy = 0
let frame: number | null = null

function writeVars(state: DragState): void {
  const el = itemEls.get(state.id)
  if (!el) return

  if (state.kind === 'move') {
    el.style.setProperty('--gr-dashboard-drag-x', `${pendingDx}px`)
    el.style.setProperty('--gr-dashboard-drag-y', `${pendingDy}px`)
    return
  }

  const rect = rectOfItem(state.origin, state.metrics)
  el.style.setProperty('--gr-dashboard-resize-w', `${Math.max(0, rect.width + pendingDx)}px`)
  el.style.setProperty('--gr-dashboard-resize-h', `${Math.max(0, rect.height + pendingDy)}px`)
}

function clearVars(id: string): void {
  const el = itemEls.get(id)
  if (!el) return

  for (const name of ['--gr-dashboard-drag-x', '--gr-dashboard-drag-y', '--gr-dashboard-resize-w', '--gr-dashboard-resize-h'])
    el.style.removeProperty(name)
}

/**
 * Кадр жеста: переменные пишутся всегда, раскладка пересчитывается только при
 * смене целевой ячейки. Именно это отделяет один перерисованный виджет от всех.
 */
function flush(): void {
  frame = null
  const state = dragState.value
  if (!state) return

  writeVars(state)

  if (state.kind === 'move') {
    const cell = cellFromDelta(state.origin, state.metrics, pendingDx, pendingDy)
    if (cell.x === state.cell.x && cell.y === state.cell.y) return

    state.cell = cell
    preview.value = moveItem(baseLayout.value, state.id, cell, moveOptions.value)
    return
  }

  const span = spanFromDelta(state.origin, state.metrics, pendingDx, pendingDy)
  if (span.w === state.span.w && span.h === state.span.h) return

  state.span = span
  preview.value = resizeItem(baseLayout.value, state.id, span, moveOptions.value)
}

function scheduleFlush(event: PointerEvent): void {
  const state = dragState.value
  if (!state) return

  pendingDx = event.clientX - state.pointerX
  pendingDy = event.clientY - state.pointerY

  frame ??= requestAnimationFrame(flush)
}

function finishGesture(commitResult: boolean): void {
  const state = dragState.value
  if (!state) return

  // Отложенный кадр доигрывается, а не отменяется: движение и отпускание могут
  // прийти внутри одного кадра, и отменённый кадр потерял бы последний сдвиг —
  // виджет вернулся бы на предпоследнюю ячейку.
  if (frame !== null) {
    cancelAnimationFrame(frame)
    flush()
  }

  clearVars(state.id)

  const next = preview.value
  dragState.value = null
  activeGeometry.value = null
  preview.value = null
  pendingDx = 0
  pendingDy = 0

  if (!commitResult || !next) return

  const to = next.find(item => item.id === state.id)
  if (!to) return
  if (to.x === state.origin.x && to.y === state.origin.y && to.w === state.origin.w && to.h === state.origin.h) return

  if (state.kind === 'move') emit('itemMove', state.id, state.origin, to)
  else emit('itemResize', state.id, state.origin, to)

  commit(next)
}

const gesture = useDragGesture({
  disabled: () => mode.value !== 'edit',
  onMove: (event) => {
    // Примитив `preventDefault` не зовёт: у слайдера и у сетки гасится разное.
    // Здесь — выделение текста под курсором во время переноса.
    event.preventDefault()
    scheduleFlush(event)
  },
  onEnd: () => finishGesture(true),
  onCancel: () => finishGesture(false),
})

function beginGesture(id: string, kind: 'move' | 'resize', event: PointerEvent): void {
  const origin = itemFor(id)
  if (!origin || origin.static) return
  if (kind === 'move' && !draggable.value) return
  if (kind === 'resize' && !resizable.value) return

  // Метрика снимается один раз: замер на каждое движение — это принудительный
  // reflow сорок раз в секунду.
  const snapshot = metricsOf(
    rootEl.value?.getBoundingClientRect().width ?? metrics.value.width,
    cols.value,
    rowHeight.value,
    gap.value,
  )

  dragState.value = {
    id,
    kind,
    origin,
    metrics: snapshot,
    pointerX: event.clientX,
    pointerY: event.clientY,
    cell: { x: origin.x, y: origin.y },
    span: { w: origin.w, h: origin.h },
  }

  activeGeometry.value = { id, kind, rect: rectOfItem(origin, snapshot) }
  preview.value = baseLayout.value
  gesture.start(event)
}

/**
 * `Esc` во время указательного жеста слушаем сами: браузер `pointercancel` на
 * него не шлёт, а бросить начатое пользователь вправе.
 */
function onWindowKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !dragState.value) return

  event.preventDefault()
  gesture.stop(false)
}

watch(() => gesture.isDragging.value, (dragging) => {
  if (typeof window === 'undefined') return

  if (dragging) window.addEventListener('keydown', onWindowKeydown, true)
  else window.removeEventListener('keydown', onWindowKeydown, true)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onWindowKeydown, true)
})

// ————— Клавиатура.

const grabbedId = ref<string | null>(null)
const keyboardOrigin = shallowRef<GrDashboardItemLayout | null>(null)

const roving = useRovingFocus<string>({
  items: () => order.value,
  elementFor: id => handleEls.get(id) ?? null,
  orientation: () => 'both',
  wrap: () => false,
})

function titleOf(id: string): string {
  return bounds.get(id)?.title ?? t('grDashboard.item.untitled', 'Widget')
}

function announcePosition(key: string, fallback: string, item: GrDashboardItemLayout): void {
  announce(t(key, fallback, {
    title: titleOf(item.id),
    col: item.x + 1,
    row: item.y + 1,
    w: item.w,
    h: item.h,
  }))
}

function grab(id: string): void {
  const item = itemFor(id)
  if (!item || item.static || !draggable.value) return

  grabbedId.value = id
  keyboardOrigin.value = item
  announcePosition('grDashboard.item.grabbed', '{title} grabbed. Column {col}, row {row}', item)
}

function drop(): void {
  const id = grabbedId.value
  grabbedId.value = null
  keyboardOrigin.value = null
  if (!id) return

  const item = itemFor(id)
  if (item) announcePosition('grDashboard.item.dropped', '{title} moved. Column {col}, row {row}', item)
}

function cancelKeyboard(): void {
  const id = grabbedId.value
  const origin = keyboardOrigin.value
  grabbedId.value = null
  keyboardOrigin.value = null
  if (!id || !origin) return

  commit(moveItem(baseLayout.value, id, { x: origin.x, y: origin.y }, moveOptions.value))
  announce(t('grDashboard.item.cancelled', 'Move cancelled'))
}

function moveGrabbedBy(dx: number, dy: number): void {
  const id = grabbedId.value
  if (!id) return

  const item = itemFor(id)
  if (!item) return

  const next = moveItem(baseLayout.value, id, { x: item.x + dx, y: item.y + dy }, moveOptions.value)
  commit(next)

  const moved = next.find(entry => entry.id === id)
  if (moved) announcePosition('grDashboard.item.moved', 'Column {col}, row {row}', moved)
}

const ARROW_DELTA: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

function onHandleKeydown(id: string, event: KeyboardEvent): void {
  if (mode.value !== 'edit') return

  const grabbed = grabbedId.value === id

  if (event.key === 'Escape') {
    if (!grabbed) return

    event.preventDefault()
    cancelKeyboard()
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    if (grabbed) drop()
    else grab(id)
    return
  }

  if (grabbed) {
    // Взятый виджет забирает стрелки себе: двигается он, а не фокус.
    const delta = ARROW_DELTA[event.key]
    if (!delta) return

    event.preventDefault()
    moveGrabbedBy(delta[0], delta[1])
    return
  }

  roving.handleNavigationKeys(event)
}

function onResizeKeydown(id: string, event: KeyboardEvent): void {
  if (mode.value !== 'edit' || !resizable.value) return

  const item = itemFor(id)
  if (!item) return

  const step = event.shiftKey ? 3 : 1
  let w = item.w
  let h = item.h

  switch (event.key) {
    case 'ArrowLeft': w -= step; break
    case 'ArrowRight': w += step; break
    case 'ArrowUp': h -= step; break
    case 'ArrowDown': h += step; break
    case 'Home': w = item.minW ?? 1; h = item.minH ?? 1; break
    case 'End': w = item.maxW ?? cols.value; h = item.maxH ?? h; break
    default: return
  }

  event.preventDefault()
  const next = resizeItem(baseLayout.value, id, { w, h }, moveOptions.value)
  commit(next)

  const resized = next.find(entry => entry.id === id)
  if (resized) announcePosition('grDashboard.item.resized', '{title}, {w} by {h}', resized)
}

/** Взятое не может остаться взятым навсегда: фокус ушёл — перенос отменён. */
function onFocusout(event: FocusEvent): void {
  if (!grabbedId.value) return

  const next = event.relatedTarget as Node | null
  if (next && rootEl.value?.contains(next)) return

  cancelKeyboard()
}

// ————— Контекст.

const context: GrDashboardContext = {
  mode,
  cols,
  draggable,
  resizable,
  lazy,
  layout: currentLayout,
  order,
  itemFor,
  activeGeometry,
  grabbedId,
  registerItem: (id, declared) => {
    bounds.set(id, declared)
  },
  unregisterItem: (id) => {
    bounds.delete(id)
    itemEls.delete(id)
    handleEls.delete(id)
  },
  setHandleElement: (id, el) => {
    if (el) handleEls.set(id, el)
    else handleEls.delete(id)
  },
  setItemElement: (id, el) => {
    if (el) itemEls.set(id, el)
    else itemEls.delete(id)
  },
  startMove: (id, event) => beginGesture(id, 'move', event),
  startResize: (id, event) => beginGesture(id, 'resize', event),
  onHandleKeydown,
  onResizeKeydown,
  onHandleFocus: id => roving.setActive(id),
  tabindexFor: id => roving.tabindexFor(id),
  dragLabelFor: id => t('grDashboard.item.dragHandle', 'Move {title}', { title: titleOf(id) }),
  resizeLabelFor: (id) => {
    const item = itemFor(id)

    return t('grDashboard.item.resizeHandle', 'Resize {title}, {w} by {h}', {
      title: titleOf(id),
      w: item?.w ?? 1,
      h: item?.h ?? 1,
    })
  },
}

provide(GR_DASHBOARD_KEY, context)

defineExpose({ breakpoint, cols })

const placeholderCell = computed(() => {
  const state = dragState.value

  return state ? (preview.value?.find(item => item.id === state.id) ?? null) : null
})

const rootClass = computed(() => [gridClass, dragState.value ? '' : animatedClass])
const label = computed(() => props.ariaLabel ?? t('grDashboard.dashboard.label', 'Dashboard'))
</script>

<template>
  <div
    :id="rootId"
    ref="rootEl"
    v-bind="$attrs"
    data-gr-dashboard
    :data-mode="mode"
    :data-breakpoint="breakpoint"
    role="group"
    :aria-label="label"
    :class="rootClass"
    :style="gridStyle(metrics)"
    @focusout="onFocusout"
  >
    <DashboardPlaceholder :cell="placeholderCell" />
    <slot />
    <slot v-if="order.length === 0" name="empty">
      <p :class="emptyClass">
        {{ t('grDashboard.dashboard.empty', 'No widgets yet') }}
      </p>
    </slot>
  </div>
</template>
