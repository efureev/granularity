<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'

import GrCard from '@feugene/granularity/components/GrCard'
import {
  useGrComponentDefaults,
  useGrComponentProp,
  useGrComponentSize,
} from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import DragHandle from '../GrDashboardFrame/shared/DragHandle.vue'
import ResizeHandle from '../GrDashboardFrame/shared/ResizeHandle.vue'
import SettingsButton from '../GrDashboardFrame/shared/SettingsButton.vue'
import { useGrDashboardContext } from '../GrDashboard/context'
import type {
  GrDashboardItemOverflow,
  GrDashboardItemPadding,
  GrDashboardItemSize,
} from './grDashboardItemStyles'
import {
  actionsClass,
  bodyClass,
  bodySizes,
  cardBodyClass,
  cardClass,
  draggingClass,
  headerClass,
  headerSizes,
  overflowClass,
  overlayHeaderClass,
  overlayHeaderHiddenClass,
  overlayHeaderVisibleClass,
  overlaySpacerClass,
  paddingSizes,
  rootClass,
  titleClass,
} from './grDashboardItemStyles'

defineOptions({ name: 'GrDashboardItem', inheritAttrs: false })

export interface GrDashboardItemProps {
  /** Идентификатор виджета. Связывает разметку с записью раскладки. */
  itemId: string
  /** Имя виджета: заголовок, имя ручек, имя в объявлениях. */
  title?: string
  size?: GrDashboardItemSize
  /**
   * Отступы содержимого. Не задан — ступень от `size`; `none` отдаёт виджет
   * содержимому целиком, край в край.
   */
  padding?: GrDashboardItemPadding
  /** `hidden` снимает и полосу прокрутки, и остановку `Tab` у тела. */
  overflow?: GrDashboardItemOverflow
  /**
   * Можно ли этот виджет тащить и растягивать. Не задан — действует правило
   * сетки; `static` сильнее обоих, потому что он про раскладку, а не про
   * интерфейс.
   */
  draggable?: boolean
  resizable?: boolean
  /** Не двигается сам и не двигается соседями. */
  static?: boolean
  /** Кнопка настроек в действиях режима редактирования. Шапку она не включает. */
  showSettings?: boolean
  /** Границы размера. Раскладка их может не содержать — знает их виджет. */
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  ariaLabel?: string
}

const props = withDefaults(defineProps<GrDashboardItemProps>(), {
  // `undefined`, а не готовые значения: иначе `componentDefaults` до них не дошли бы.
  size: undefined,
  padding: undefined,
  overflow: undefined,
  draggable: undefined,
  resizable: undefined,
  static: undefined,
  showSettings: false,
})

export interface GrDashboardItemEmits {
  /** Нажата кнопка настроек. Сетка пересылает это наружу как `itemSettings`. */
  (e: 'settings', id: string): void
}

const emit = defineEmits<GrDashboardItemEmits>()

defineSlots<{
  default?: () => unknown
  header?: () => unknown
  actions?: () => unknown
  /** Действия режима редактирования: удалить виджет, открыть настройки. */
  editActions?: () => unknown
  footer?: () => unknown
  skeleton?: () => unknown
}>()

const dashboard = useGrDashboardContext()
const size = useGrComponentSize(() => props.size, { component: 'GrDashboardItem' })
const overflow = useGrComponentProp('GrDashboardItem', 'overflow', () => props.overflow, 'auto')

/**
 * Отступы: проп → конфиг → ступень от `size`.
 *
 * Через `useGrComponentProp` это не выражается — у него дефолт константа, а
 * здесь дефолт производный, и «`md` по умолчанию» вместо «по размеру» тихо
 * сломало бы плотные виджеты.
 */
const itemDefaults = useGrComponentDefaults('GrDashboardItem')
const padding = computed<GrDashboardItemPadding>(
  () => props.padding ?? itemDefaults.value.padding ?? size.value,
)

const titleId = useId()
const rootEl = ref<HTMLElement | null>(null)
const bodyEl = ref<HTMLElement | null>(null)
const handleEl = ref<InstanceType<typeof DragHandle> | null>(null)

const item = computed(() => dashboard?.itemFor(props.itemId))
const editing = computed(() => dashboard?.mode.value === 'edit')
const isStatic = computed(() => props.static ?? item.value?.static ?? false)
const canDrag = computed(() => (
  editing.value
  && (props.draggable ?? dashboard?.draggable.value ?? false)
  && !isStatic.value
))
const canResize = computed(() => (
  editing.value
  && (props.resizable ?? dashboard?.resizable.value ?? false)
  && !isStatic.value
))
const grabbed = computed(() => dashboard?.grabbedId.value === props.itemId)

const active = computed(() => {
  const geometry = dashboard?.activeGeometry.value

  return geometry?.id === props.itemId ? geometry : null
})

/**
 * Размещение — `grid-area`: браузер сам пересчитает его при смене ширины окна.
 * На время жеста виджет выходит из потока в абсолютные координаты, снятые на
 * `pointerdown`, — и дальше двигается только CSS-переменными.
 */
const style = computed(() => {
  const geometry = active.value

  if (geometry) {
    const { rect, kind } = geometry

    return {
      position: 'absolute' as const,
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: kind === 'resize' ? `var(--gr-dashboard-resize-w, ${rect.width}px)` : `${rect.width}px`,
      height: kind === 'resize' ? `var(--gr-dashboard-resize-h, ${rect.height}px)` : `${rect.height}px`,
      transform: kind === 'move'
        ? 'translate3d(var(--gr-dashboard-drag-x, 0px), var(--gr-dashboard-drag-y, 0px), 0)'
        : undefined,
    }
  }

  const placed = item.value
  if (!placed) return undefined

  return {
    gridColumn: `${placed.x + 1} / span ${placed.w}`,
    gridRow: `${placed.y + 1} / span ${placed.h}`,
  }
})

/**
 * Тело прокручивается, когда содержимое не влезло в ячейку, — и ровно тогда
 * обязано встать в таб-порядок: до прокручиваемой области, которую нельзя
 * сфокусировать, с клавиатуры не добраться (axe: `scrollable-region-focusable`).
 *
 * Проверяется по факту переполнения, а не «на всякий случай»: постоянный
 * `tabindex` добавил бы остановку `Tab` каждому виджету, и на дашборде из
 * тридцати их стало бы тридцать лишних.
 */
const scrollable = ref(false)

function syncScrollable(): void {
  const el = bodyEl.value
  if (!el || overflow.value === 'hidden') return

  scrollable.value = el.scrollHeight - el.clientHeight > 1
}

// ————— Панель режима редактирования у виджета без шапки.

const hovered = ref(false)
const focusWithin = ref(false)

/**
 * Указатель без наведения — палец. Читается в `onMounted`, а не в `setup`:
 * `matchMedia` на сервере нет, и первый клиентский рендер обязан повторить
 * серверный (`docs/ssr.md`, правило 6).
 */
const coarsePointer = ref(false)

const overlayVisible = computed(() => (
  coarsePointer.value || hovered.value || focusWithin.value || grabbed.value
))

// ————— Ленивый монтаж содержимого.

const visible = ref(!dashboard?.lazy.value)
let observer: IntersectionObserver | null = null

let hoverQuery: MediaQueryList | null = null

function syncCoarsePointer(): void {
  coarsePointer.value = hoverQuery?.matches ?? false
}

onMounted(() => {
  dashboard?.setItemElement(props.itemId, rootEl.value)

  if (typeof matchMedia !== 'undefined') {
    hoverQuery = matchMedia('(hover: none)')
    syncCoarsePointer()
    hoverQuery.addEventListener('change', syncCoarsePointer)
  }

  // Непрокручиваемое тело наблюдать незачем: остановки `Tab` у него не будет.
  if (bodyEl.value && overflow.value === 'auto') {
    syncScrollable()
    dashboard?.observeBody(bodyEl.value, syncScrollable)
  }

  dashboard?.setHandleElement(props.itemId, (handleEl.value?.$el ?? null) as HTMLElement | null)

  if (visible.value || typeof IntersectionObserver === 'undefined') {
    visible.value = true
    return
  }

  observer = new IntersectionObserver((entries) => {
    // Смонтировалось — остаётся смонтированным: размонтировать уехавший за
    // край виджет значит терять его состояние на каждой прокрутке.
    if (!entries.some(entry => entry.isIntersecting)) return

    visible.value = true
    observer?.disconnect()
    observer = null
  }, { rootMargin: '200px' })

  if (rootEl.value) observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  hoverQuery?.removeEventListener('change', syncCoarsePointer)
  hoverQuery = null
  if (bodyEl.value) dashboard?.unobserveBody(bodyEl.value)

  dashboard?.unregisterItem(props.itemId)
})

watch(
  () => ({
    minW: props.minW,
    minH: props.minH,
    maxW: props.maxW,
    maxH: props.maxH,
    draggable: props.draggable,
    resizable: props.resizable,
    static: props.static,
    title: props.title,
  }),
  bounds => dashboard?.registerItem(props.itemId, bounds),
  { immediate: true, deep: true },
)

const classes = computed(() => [rootClass, active.value ? draggingClass : ''])
const dragLabel = computed(() => dashboard?.dragLabelFor(props.itemId) ?? '')
const resizeLabel = computed(() => dashboard?.resizeLabelFor(props.itemId) ?? '')

const slots = useSlots()

/**
 * Шапка есть, только если ей есть что показать.
 *
 * Раньше сюда входил и `canDrag`: в режиме редактирования шапка появлялась ради
 * одной ручки, и содержимое сжималось на её высоту при каждом переключении
 * режима. Теперь ручка безголового виджета живёт в панели поверх содержимого.
 */
const showHeader = computed(() => Boolean(props.title) || Boolean(slots.header) || Boolean(slots.actions))

/** Панель нужна там, где шапки нет, а показать в режиме редактирования есть что. */
const showOverlayHeader = computed(() => (
  !showHeader.value && editing.value && (canDrag.value || Boolean(slots.editActions) || props.showSettings)
))

const { t } = useGranularityTranslations()

/**
 * Настройки — действие режима редактирования, как и `#editActions`.
 *
 * Шапку кнопка не включает, в отличие от `#actions`: иначе переключение режима
 * сдвигало бы содержимое на её высоту.
 */
const canSettings = computed(() => editing.value && props.showSettings)

const settingsLabel = computed(() => t('grDashboard.item.settings', 'Settings for {title}', {
  title: props.title ?? t('grDashboard.item.untitled', 'Widget'),
}))

function openSettings(): void {
  emit('settings', props.itemId)
  dashboard?.requestSettings(props.itemId)
}

const overlayClasses = computed(() => [
  overlayHeaderClass,
  overlayVisible.value ? overlayHeaderVisibleClass : overlayHeaderHiddenClass,
])

/**
 * Роль без имени скринридеру бесполезна: «группа» и больше ничего. Безымянный
 * виджет остаётся обычным блоком.
 */
const named = computed(() => Boolean(props.ariaLabel) || Boolean(props.title))
</script>

<template>
  <div
    ref="rootEl"
    v-bind="$attrs"
    data-gr-dashboard-item
    :data-item-id="itemId"
    :data-dragging="active ? '' : undefined"
    :role="named ? 'group' : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabel ? undefined : (title ? titleId : undefined)"
    :class="classes"
    :style="style"
    @pointerenter="hovered = true"
    @pointerleave="hovered = false"
    @focusin="focusWithin = true"
    @focusout="focusWithin = false"
  >
    <GrCard :class="cardClass" :body-class="cardBodyClass" variant="elevated">
      <template v-if="showHeader" #header>
        <div :class="[headerClass, headerSizes[size]]">
          <DragHandle
            v-if="canDrag"
            ref="handleEl"
            :label="dragLabel"
            :grabbed="grabbed"
            :tabindex="dashboard?.tabindexFor(itemId) ?? 0"
            @pointerdown="dashboard?.startMove(itemId, $event)"
            @keydown="dashboard?.onHandleKeydown(itemId, $event)"
            @focus="dashboard?.onHandleFocus(itemId)"
          />
          <slot name="header">
            <span :id="titleId" :class="titleClass">{{ title }}</span>
          </slot>
          <span v-if="editing && (canSettings || $slots.editActions)" :class="actionsClass">
            <SettingsButton v-if="canSettings" :label="settingsLabel" @click="openSettings" />
            <slot name="editActions" />
          </span>
          <span v-if="$slots.actions" :class="actionsClass">
            <slot name="actions" />
          </span>
        </div>
      </template>

      <div
        ref="bodyEl"
        :class="[bodyClass, overflowClass[overflow], paddingSizes[padding]]"
        :tabindex="scrollable ? 0 : undefined"
      >
        <slot v-if="visible" />
        <slot v-else name="skeleton" />
      </div>

      <template v-if="$slots.footer" #footer>
        <div :class="bodySizes[size]">
          <slot name="footer" />
        </div>
      </template>
    </GrCard>

    <div v-if="showOverlayHeader" data-gr-dashboard-overlay-header :class="overlayClasses">
      <DragHandle
        v-if="canDrag"
        ref="handleEl"
        :label="dragLabel"
        :grabbed="grabbed"
        :tabindex="dashboard?.tabindexFor(itemId) ?? 0"
        @pointerdown="dashboard?.startMove(itemId, $event)"
        @keydown="dashboard?.onHandleKeydown(itemId, $event)"
        @focus="dashboard?.onHandleFocus(itemId)"
      />

      <span :class="overlaySpacerClass" />

      <span v-if="canSettings || $slots.editActions" :class="actionsClass">
        <SettingsButton v-if="canSettings" :label="settingsLabel" @click="openSettings" />
        <slot name="editActions" />
      </span>
    </div>

    <ResizeHandle
      v-if="canResize && item"
      :label="resizeLabel"
      @pointerdown="dashboard?.startResize(itemId, $event)"
      @keydown="dashboard?.onResizeKeydown(itemId, $event)"
    />
  </div>
</template>
