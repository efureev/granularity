<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, shallowRef, useId, watch } from 'vue'

import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useDragGesture } from '@feugene/granularity/composables/useDragGesture'
import { useGrComponentProp } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useRovingFocus } from '@feugene/granularity/composables/useRovingFocus'

import type { GrDashboardTransfer, GrDashboardTransferPoint } from '../../composables/useDashboardTransfer'
import { useDashboardTransfer } from '../../composables/useDashboardTransfer'
import type {
  GrDashboardBreakpoint,
  GrDashboardBreakpoints,
  GrDashboardCell,
  GrDashboardCols,
  GrDashboardCompaction,
  GrDashboardItemLayout,
  GrDashboardLayout,
  GrDashboardMetrics,
  GrDashboardResponsiveLayout,
  GrDashboardSpan,
} from '../../layout'
import {
  addItem,
  cellFromDelta,
  cellFromPoint,
  clampItem,
  colsFor,
  GR_DASHBOARD_BREAKPOINTS,
  GR_DASHBOARD_COLS,
  layoutFor,
  metricsOf,
  moveItem,
  rectOfItem,
  removeItem,
  resizeItem,
  resolveBreakpoint,
  rowsForHeight,
  spanFromDelta,
  withBreakpointLayout,
} from '../../layout'
import DashboardPlaceholder from '../GrDashboardFrame/shared/DashboardPlaceholder.vue'
import TransferGhost from '../GrDashboardFrame/shared/TransferGhost.vue'
import { animatedClass, emptyTextClass, emptyWrapClass, gridClass } from '../GrDashboardFrame/frameStyles'
import type {
  GrDashboardActiveGeometry,
  GrDashboardContext,
  GrDashboardDropEvent,
  GrDashboardItemBounds,
} from './context'
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
  /**
   * Сетка принимает виджеты, перетаскиваемые из каталога.
   *
   * Работает только в `mode="edit"`. Проп нужен там, где сеток на странице
   * несколько, а принимать должна одна.
   */
  droppable?: boolean
  /**
   * Из сетки можно утащить виджет в соседний дашборд.
   *
   * Отдельно от `droppable`: принимать и отдавать — разные разрешения. Архивный
   * дашборд принимает виджеты, но своих не отдаёт.
   */
  transferable?: boolean
  ariaLabel?: string
}

export interface GrDashboardEmits {
  (e: 'update:layout', value: GrDashboardResponsiveLayout): void
  (e: 'layoutChange', value: GrDashboardLayout, breakpoint: GrDashboardBreakpoint): void
  (e: 'itemMove', id: string, from: GrDashboardItemLayout, to: GrDashboardItemLayout): void
  (e: 'itemResize', id: string, from: GrDashboardItemLayout, to: GrDashboardItemLayout): void
  /**
   * Виджет с `auto-height` подстроился под содержимое.
   *
   * Отдельно от `itemResize` потому, что это не действие пользователя:
   * приложение, которое считает раскладку грязной по правкам, иначе спрашивало
   * бы «сохранить изменения?» после загрузки данных в виджет.
   */
  (e: 'itemAutoResize', id: string, from: GrDashboardItemLayout, to: GrDashboardItemLayout): void
  (e: 'breakpointChange', breakpoint: GrDashboardBreakpoint, cols: number): void
  /** Виджет попросил открыть свои настройки: нажата встроенная кнопка-шестерёнка. */
  (e: 'itemSettings', id: string): void
  /**
   * В сетку бросили виджет из каталога.
   *
   * Сетка сообщает **что и куда**, а кладёт приложение — тем же `addItem`, что
   * и по кнопке каталога. Иначе в раскладке появился бы виджет, для которого
   * приложение не рисовало разметки.
   */
  (e: 'itemDrop', event: GrDashboardDropEvent): void
  /**
   * Виджет уехал в другую сетку.
   *
   * Из своей раскладки сетка убирает его сама — удаление однозначно, разметки
   * для него не нужно, в отличие от вставки. Событие говорит приложению, что
   * произошло, и несёт ту же нагрузку, что уехала в `itemDrop` приёмника.
   */
  (e: 'itemTransferOut', id: string, transfer: GrDashboardTransfer): void
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
  droppable: undefined,
  transferable: undefined,
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
const droppable = useGrComponentProp('GrDashboard', 'droppable', () => props.droppable, true)
const transferable = useGrComponentProp('GrDashboard', 'transferable', () => props.transferable, true)

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
  compact: compaction.value,
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
  if (!declared)
    return clampItem(item, cols.value)

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

/**
 * Фантом переноса из каталога.
 *
 * Пока указатель над сеткой, предпросмотр считается **тем же** `addItem`, что
 * уедет в `itemDrop`: соседи расступаются по-настоящему, и подложка не врёт.
 * Наружу фантом при этом не выходит нигде — ни в `order` (а значит, и в
 * стрелочную навигацию по ручкам), ни в контекст, ни тем более в `commit`,
 * который незнакомые идентификаторы пропускает насквозь и записал бы его в
 * модель приложения, а оттуда в хранилище.
 */
const GR_TRANSFER_ID = '__gr-dashboard-transfer__'

const transferCell = shallowRef<GrDashboardCell | null>(null)

const currentLayout = computed(() => {
  const layout = preview.value ?? baseLayout.value

  return transferCell.value === null ? layout : layout.filter(item => item.id !== GR_TRANSFER_ID)
})

const order = computed(() => currentLayout.value.map(item => item.id))

function itemFor(id: string): GrDashboardItemLayout | undefined {
  return currentLayout.value.find(item => item.id === id)
}

/**
 * Что виджету разрешено. Правило сетки — общее, виджет вправе его сузить.
 *
 * Ответ живёт здесь, а не только в разметке: спрятать ручку мало — жест и
 * клавиатура идут через контекст, и запрет, который держится на «кнопку не
 * отрисовали», снимается первым же программным вызовом.
 */
function canMove(id: string): boolean {
  return (bounds.get(id)?.draggable ?? draggable.value) && !itemFor(id)?.static
}

function canResizeItem(id: string): boolean {
  return (bounds.get(id)?.resizable ?? resizable.value) && !itemFor(id)?.static
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
 * Наблюдатель тел виджетов — один на сетку. Тело виджета прокручивается, когда
 * содержимое не влезло, и в этот момент обязано встать в таб-порядок: иначе до
 * него не добраться с клавиатуры (axe: `scrollable-region-focusable`).
 */
const bodyCallbacks = new Map<HTMLElement, () => void>()
let bodyObserver: ResizeObserver | null = null

function ensureBodyObserver(): ResizeObserver | null {
  if (bodyObserver || typeof ResizeObserver === 'undefined')
    return bodyObserver

  bodyObserver = new ResizeObserver((entries) => {
    for (const entry of entries) bodyCallbacks.get(entry.target as HTMLElement)?.()
  })

  return bodyObserver
}

/**
 * Нулевая ширина — это не «самый узкий экран», а «контейнер не отрисован»:
 * скрытая вкладка, свёрнутая панель, `display: none`. Принять её за брейкпоинт
 * значит перевести дашборд на две колонки и записать эту раскладку в модель —
 * молча и необратимо.
 */
function measure(): void {
  const width = rootEl.value?.getBoundingClientRect().width ?? 0
  if (width > 0)
    containerWidth.value = width
}

onMounted(() => {
  measure()

  // Наблюдатель один и на контейнере: он выбирает брейкпоинт, а не считает
  // пиксели виджетов — их раскладывает CSS Grid.
  if (typeof ResizeObserver === 'undefined')
    return

  observer = new ResizeObserver(measure)
  if (rootEl.value)
    observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  bodyObserver?.disconnect()
  bodyObserver = null
  bodyCallbacks.clear()
})

watch([breakpoint, cols], ([nextBreakpoint, nextCols], previous) => {
  if (previous && previous[0] === nextBreakpoint)
    return

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
  if (!el)
    return

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
  if (!el)
    return

  for (const name of ['--gr-dashboard-drag-x', '--gr-dashboard-drag-y', '--gr-dashboard-resize-w', '--gr-dashboard-resize-h'])
    el.style.removeProperty(name)
}

// ————— Перенос виджетов: и приём из каталога, и отдача в соседний дашборд.

// Объявляется раньше обоих блоков: на модель ссылаются и кадр жеста, и приём.
const transfer = useDashboardTransfer()

// ————— Перенос в соседний дашборд: жест за ручку, ушедший за край своей сетки.

/** Виджет, который сейчас несут наружу. `null` — переноса нет. */
const carriedAway = shallowRef<GrDashboardTransfer | null>(null)
const carriedAwayId = computed(() => carriedAway.value?.id ?? null)

function canTransferOut(id: string): boolean {
  const item = itemFor(id)

  return transferable.value && item !== undefined && !item.static && canMove(id)
}

function transferOf(item: GrDashboardItemLayout): GrDashboardTransfer {
  return {
    id: item.id,
    title: titleOf(item.id),
    size: { w: item.w, h: item.h },
    minW: item.minW,
    minH: item.minH,
    maxW: item.maxW,
    maxH: item.maxH,
    source: 'dashboard',
    from: rootId,
  }
}

function isInsideOwnGrid(x: number, y: number): boolean {
  const rect = rootEl.value?.getBoundingClientRect()
  if (!rect)
    return true

  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

/**
 * Виджет уехал в чужую сетку: из своей он уходит, соседи уплотняются.
 *
 * Превью честно показывает, что останется, — так же, как при обычном переносе.
 * Разметку виджета по-прежнему рисует приложение, поэтому сам элемент прячется
 * по `carriedAwayId`, а не остаётся без `grid-area`.
 */
function beginTransferOut(state: NonNullable<typeof dragState.value>, at: GrDashboardTransferPoint): void {
  const payload = transferOf(state.origin)

  carriedAway.value = payload
  clearVars(state.id)
  preview.value = removeItem(baseLayout.value, state.id, moveOptions.value)
  transfer.adopt(payload)
  transfer.moveTo(at)
}

/** Указатель вернулся домой: сессия сворачивается, обычный перенос продолжается. */
function endTransferOut(): void {
  if (!carriedAway.value)
    return

  carriedAway.value = null
  transfer.release(false)
}

/**
 * Кадр жеста: переменные пишутся всегда, раскладка пересчитывается только при
 * смене целевой ячейки. Именно это отделяет один перерисованный виджет от всех.
 */
function flush(): void {
  frame = null
  const state = dragState.value
  if (!state)
    return

  writeVars(state)

  if (state.kind === 'move') {
    const at = { x: state.pointerX + pendingDx, y: state.pointerY + pendingDy }

    if (carriedAway.value) {
      if (isInsideOwnGrid(at.x, at.y)) {
        endTransferOut()
      }
      else {
        transfer.moveTo(at)
        return
      }
    }
    else if (!isInsideOwnGrid(at.x, at.y) && canTransferOut(state.id) && transfer.hasTargetAt(at)) {
      beginTransferOut(state, at)
      return
    }

    const cell = cellFromDelta(state.origin, state.metrics, pendingDx, pendingDy)
    if (cell.x === state.cell.x && cell.y === state.cell.y)
      return

    state.cell = cell
    preview.value = moveItem(baseLayout.value, state.id, cell, moveOptions.value)
    return
  }

  const span = spanFromDelta(state.origin, state.metrics, pendingDx, pendingDy)
  if (span.w === state.span.w && span.h === state.span.h)
    return

  state.span = span
  preview.value = resizeItem(baseLayout.value, state.id, pinAutoHeight(state.id, span), moveOptions.value)
}

function scheduleFlush(event: PointerEvent): void {
  const state = dragState.value
  if (!state)
    return

  pendingDx = event.clientX - state.pointerX
  pendingDy = event.clientY - state.pointerY

  frame ??= requestAnimationFrame(flush)
}

function finishGesture(commitResult: boolean): void {
  const state = dragState.value
  if (!state)
    return

  // Виджет на весу над чужой сеткой: исход решает она, а не наша арифметика.
  // Приёмник эмитит свой `itemDrop`, мы убираем виджет у себя — но только если
  // он действительно куда-то лёг.
  if (carriedAway.value) {
    const payload = carriedAway.value
    const landed = commitResult && transfer.hasTargetAt(transfer.point.value)

    carriedAway.value = null
    transfer.release(commitResult)

    clearVars(state.id)
    dragState.value = null
    activeGeometry.value = null
    preview.value = null
    pendingDx = 0
    pendingDy = 0

    if (!landed)
      return

    emit('itemTransferOut', state.id, payload)
    commit(removeItem(baseLayout.value, state.id, moveOptions.value))

    return
  }

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

  if (!commitResult || !next)
    return

  const to = next.find(item => item.id === state.id)
  if (!to)
    return
  if (to.x === state.origin.x && to.y === state.origin.y && to.w === state.origin.w && to.h === state.origin.h)
    return

  if (state.kind === 'move')
    emit('itemMove', state.id, state.origin, to)
  else emit('itemResize', state.id, state.origin, to)

  commit(next)
}

// ————— Приём виджета из каталога.

function phantomOf(payload: GrDashboardTransfer): GrDashboardItemLayout {
  return {
    id: GR_TRANSFER_ID,
    x: 0,
    y: 0,
    w: payload.size.w,
    h: payload.size.h,
    minW: payload.minW,
    minH: payload.minH,
    maxW: payload.maxW,
    maxH: payload.maxH,
  }
}

/**
 * Метрика читается **раз в кадр**, а не один раз на жест.
 *
 * У своего переноса между нажатием и отпусканием проходят доли секунды; здесь
 * между нажатием в каталоге и броском — секунды, за которые страница успевает
 * прокрутиться колесом.
 */
function transferOver(payload: GrDashboardTransfer, at: GrDashboardTransferPoint): void {
  const rect = rootEl.value?.getBoundingClientRect()
  if (!rect)
    return

  const snapshot = metricsOf(rect.width, cols.value, rowHeight.value, gap.value)
  const cell = cellFromPoint(snapshot, at.x - rect.left, at.y - rect.top, payload.size)
  const previous = transferCell.value
  if (previous && previous.x === cell.x && previous.y === cell.y)
    return

  transferCell.value = cell
  preview.value = addItem(baseLayout.value, phantomOf(payload), moveOptions.value, cell)
}

function transferLeave(): void {
  if (transferCell.value === null)
    return

  transferCell.value = null
  preview.value = null
}

function transferDrop(payload: GrDashboardTransfer): void {
  const cell = transferCell.value
  if (!cell)
    return

  emit('itemDrop', {
    transfer: payload,
    cell,
    breakpoint: breakpoint.value,
    options: moveOptions.value,
  })
}

// Регистрация — своим блоком, а не в общем `onMounted`: `enabled` спрашивает
// состояние собственного жеста, объявленное ниже.
let unregisterTarget: (() => void) | null = null

onMounted(() => {
  unregisterTarget = transfer.registerTarget({
    rect: () => rootEl.value?.getBoundingClientRect() ?? null,
    enabled: () => mode.value === 'edit' && droppable.value && dragState.value === null,
    over: transferOver,
    leave: transferLeave,
    drop: transferDrop,
  })
})

onBeforeUnmount(() => {
  unregisterTarget?.()
  unregisterTarget = null
})

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
  // Два жеста разом делили бы один `preview`, и раскладка досталась бы тому,
  // кто отпустил позже.
  if (transfer.isTransferring.value)
    return

  const origin = itemFor(id)
  if (!origin || origin.static)
    return
  if (kind === 'move' && !canMove(id))
    return
  if (kind === 'resize' && !canResizeItem(id))
    return

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
  if (event.key !== 'Escape' || !dragState.value)
    return

  event.preventDefault()
  gesture.stop(false)
}

watch(() => gesture.isDragging.value, (dragging) => {
  if (typeof window === 'undefined')
    return

  if (dragging)
    window.addEventListener('keydown', onWindowKeydown, true)
  else window.removeEventListener('keydown', onWindowKeydown, true)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined')
    window.removeEventListener('keydown', onWindowKeydown, true)
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
  if (!item || item.static || !canMove(id))
    return

  grabbedId.value = id
  keyboardOrigin.value = item
  announcePosition('grDashboard.item.grabbed', '{title} grabbed. Column {col}, row {row}', item)
}

function drop(): void {
  const id = grabbedId.value
  grabbedId.value = null
  keyboardOrigin.value = null
  if (!id)
    return

  const item = itemFor(id)
  if (item)
    announcePosition('grDashboard.item.dropped', '{title} moved. Column {col}, row {row}', item)
}

function cancelKeyboard(): void {
  const id = grabbedId.value
  const origin = keyboardOrigin.value
  grabbedId.value = null
  keyboardOrigin.value = null
  if (!id || !origin)
    return

  const from = itemFor(id)
  const next = moveItem(baseLayout.value, id, { x: origin.x, y: origin.y }, moveOptions.value)
  commit(next)

  // Возврат — такой же перенос, как и стрелки до него: каждая из них уже
  // сообщила о переезде, и без этого эмита цепочка событий оборвалась бы не
  // там, где виджет стоит на самом деле.
  const restored = next.find(entry => entry.id === id)
  if (from && restored && (restored.x !== from.x || restored.y !== from.y))
    emit('itemMove', id, from, restored)

  announce(t('grDashboard.item.cancelled', 'Move cancelled'))
}

function moveGrabbedBy(dx: number, dy: number): void {
  const id = grabbedId.value
  if (!id)
    return

  const item = itemFor(id)
  if (!item)
    return

  const next = moveItem(baseLayout.value, id, { x: item.x + dx, y: item.y + dy }, moveOptions.value)
  commit(next)

  const moved = next.find(entry => entry.id === id)
  if (!moved)
    return

  // Клавиатура эмитит `itemMove` наравне с указателем: приложение, слушающее
  // событие, иначе видело бы только половину переносов.
  if (moved.x !== item.x || moved.y !== item.y)
    emit('itemMove', id, item, moved)

  announcePosition('grDashboard.item.moved', 'Column {col}, row {row}', moved)
}

const ARROW_DELTA: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

function onHandleKeydown(id: string, event: KeyboardEvent): void {
  if (mode.value !== 'edit')
    return

  const grabbed = grabbedId.value === id

  if (event.key === 'Escape') {
    if (!grabbed)
      return

    event.preventDefault()
    cancelKeyboard()
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    if (grabbed)
      drop()
    else grab(id)
    return
  }

  if (grabbed) {
    // Взятый виджет забирает стрелки себе: двигается он, а не фокус.
    const delta = ARROW_DELTA[event.key]
    if (!delta)
      return

    event.preventDefault()
    moveGrabbedBy(delta[0], delta[1])
    return
  }

  roving.handleNavigationKeys(event)
}

function onResizeKeydown(id: string, event: KeyboardEvent): void {
  if (mode.value !== 'edit' || !canResizeItem(id))
    return

  const item = itemFor(id)
  if (!item)
    return

  const step = event.shiftKey ? 3 : 1
  let w = item.w
  let h = item.h

  switch (event.key) {
    case 'ArrowLeft': w -= step; break
    case 'ArrowRight': w += step; break
    case 'ArrowUp': h -= step; break
    case 'ArrowDown': h += step; break
    case 'Home':
      w = item.minW ?? 1
      h = item.minH ?? 1
      break
    case 'End':
      w = item.maxW ?? cols.value
      h = item.maxH ?? h
      break
    default: return
  }

  event.preventDefault()
  applyResize(id, { w, h })
}

/**
 * Растягивание в обход жеста: клавиатура и программный вызов из контекста.
 *
 * `false` означает «не поместилось». Отличить это от «получилось» можно только
 * здесь: `resizeItem` при отказе молча отдаёт исходную раскладку, и вызывающий,
 * показавший форму, принял бы отказ за успех.
 */
function applyResize(id: string, span: GrDashboardSpan): boolean {
  if (mode.value !== 'edit' || !canResizeItem(id))
    return false

  const from = itemFor(id)
  if (!from)
    return false

  const next = resizeItem(baseLayout.value, id, pinAutoHeight(id, span), moveOptions.value)
  const to = next.find(entry => entry.id === id)
  if (!to || (to.w === from.w && to.h === from.h))
    return false

  emit('itemResize', id, from, to)
  commit(next)
  announcePosition('grDashboard.item.resized', '{title}, {w} by {h}', to)

  return true
}

// ————— Авто-высота: содержимое виджета решает, сколько строк он занимает.

/** Запрошенная содержимым высота в пикселях, по виджетам. */
const contentHeights = new Map<string, number>()
let autoFrame: number | null = null

/**
 * Применяет накопленные замеры одним пакетом.
 *
 * Мимо `applyResize`: тот требует режима редактирования и объявляет результат в
 * живой регион. Авто-высота — не действие пользователя: в просмотре она обязана
 * работать так же, а диктору сообщать не о чем.
 */
function flushAutoHeights(): void {
  autoFrame = null
  if (contentHeights.size === 0)
    return

  let next = baseLayout.value
  const changed: [string, GrDashboardItemLayout, GrDashboardItemLayout][] = []

  for (const [id, px] of contentHeights) {
    const from = next.find(entry => entry.id === id)
    if (!from)
      continue

    const rows = rowsForHeight(px, metrics.value)
    if (rows === from.h)
      continue

    const applied = resizeItem(next, id, { w: from.w, h: rows }, moveOptions.value)
    const to = applied.find(entry => entry.id === id)
    if (!to || to.h === from.h)
      continue

    next = applied
    changed.push([id, from, to])
  }

  if (changed.length === 0)
    return

  for (const [id, from, to] of changed) emit('itemAutoResize', id, from, to)
  commit(next)
}

function scheduleAutoHeights(): void {
  if (autoFrame !== null)
    return

  autoFrame = typeof requestAnimationFrame === 'undefined'
    ? (queueMicrotask(flushAutoHeights), -1)
    : requestAnimationFrame(flushAutoHeights)
}

/**
 * Высоту виджета с `auto-height` определяет содержимое, а не пользователь:
 * запрошенный `h` затёр бы следующий же замер. Уголок и стрелки меняют такому
 * виджету только ширину.
 */
function pinAutoHeight(id: string, span: GrDashboardSpan): GrDashboardSpan {
  if (!contentHeights.has(id))
    return span

  return { w: span.w, h: itemFor(id)?.h ?? span.h }
}

function reportContentHeight(id: string, px: number | null): void {
  if (px === null) {
    contentHeights.delete(id)
    return
  }

  if (contentHeights.get(id) === px)
    return

  contentHeights.set(id, px)
  scheduleAutoHeights()
}

/** Взятое не может остаться взятым навсегда: фокус ушёл — перенос отменён. */
function onFocusout(event: FocusEvent): void {
  if (!grabbedId.value)
    return

  const next = event.relatedTarget as Node | null
  if (next && rootEl.value?.contains(next))
    return

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
    if (el)
      handleEls.set(id, el)
    else handleEls.delete(id)
  },
  setItemElement: (id, el) => {
    if (el)
      itemEls.set(id, el)
    else itemEls.delete(id)
  },
  observeBody: (el, onResize) => {
    bodyCallbacks.set(el, onResize)
    ensureBodyObserver()?.observe(el)
  },
  unobserveBody: (el) => {
    bodyCallbacks.delete(el)
    bodyObserver?.unobserve(el)
  },
  startMove: (id, event) => beginGesture(id, 'move', event),
  startResize: (id, event) => beginGesture(id, 'resize', event),
  onHandleKeydown,
  onResizeKeydown,
  onHandleFocus: id => roving.setActive(id),
  requestSettings: id => emit('itemSettings', id),
  canResize: canResizeItem,
  carriedAwayId,
  resizeItemTo: applyResize,
  reportContentHeight,
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
  if (state)
    return preview.value?.find(item => item.id === state.id) ?? null

  return transferCell.value === null ? null : (preview.value?.find(item => item.id === GR_TRANSFER_ID) ?? null)
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

    <!-- Пока виджет несут в соседний дашборд, за указателем едет тот же
         призрак, что и у каталога: источник у переноса разный, вид — один. -->
    <TransferGhost
      v-if="carriedAway"
      :transfer="carriedAway"
      :point="transfer.point.value"
    />
    <slot />
    <div v-if="order.length === 0 && transferCell === null" :class="emptyWrapClass">
      <slot name="empty">
        <p :class="emptyTextClass">
          {{ t('grDashboard.dashboard.empty', 'No widgets yet') }}
        </p>
      </slot>
    </div>
  </div>
</template>
