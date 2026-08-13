<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import GrCard from '@feugene/granularity/components/GrCard'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'

import DragHandle from '../GrDashboardFrame/shared/DragHandle.vue'
import ResizeHandle from '../GrDashboardFrame/shared/ResizeHandle.vue'
import { useGrDashboardContext } from '../GrDashboard/context'
import type { GrDashboardItemSize } from './grDashboardItemStyles'
import {
  actionsClass,
  bodyClass,
  bodySizes,
  draggingClass,
  headerClass,
  headerSizes,
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
  /** Не двигается сам и не двигается соседями. */
  static?: boolean
  /** Границы размера. Раскладка их может не содержать — знает их виджет. */
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  ariaLabel?: string
}

const props = withDefaults(defineProps<GrDashboardItemProps>(), {
  // `undefined`, а не готовое значение: иначе `componentDefaults` до него не дошли бы.
  size: undefined,
  static: undefined,
})

defineSlots<{
  default?: () => unknown
  header?: () => unknown
  actions?: () => unknown
  footer?: () => unknown
  skeleton?: () => unknown
}>()

const dashboard = useGrDashboardContext()
const size = useGrComponentSize(() => props.size, { component: 'GrDashboardItem' })

const titleId = useId()
const rootEl = ref<HTMLElement | null>(null)
const handleEl = ref<InstanceType<typeof DragHandle> | null>(null)

const item = computed(() => dashboard?.itemFor(props.itemId))
const editing = computed(() => dashboard?.mode.value === 'edit')
const isStatic = computed(() => props.static ?? item.value?.static ?? false)
const canDrag = computed(() => editing.value && (dashboard?.draggable.value ?? false) && !isStatic.value)
const canResize = computed(() => editing.value && (dashboard?.resizable.value ?? false) && !isStatic.value)
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

// ————— Ленивый монтаж содержимого.

const visible = ref(!dashboard?.lazy.value)
let observer: IntersectionObserver | null = null

onMounted(() => {
  dashboard?.setItemElement(props.itemId, rootEl.value)
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
  dashboard?.unregisterItem(props.itemId)
})

watch(
  () => ({
    minW: props.minW,
    minH: props.minH,
    maxW: props.maxW,
    maxH: props.maxH,
    static: props.static,
    title: props.title,
  }),
  bounds => dashboard?.registerItem(props.itemId, bounds),
  { immediate: true, deep: true },
)

const classes = computed(() => [rootClass, active.value ? draggingClass : ''])
const dragLabel = computed(() => dashboard?.dragLabelFor(props.itemId) ?? '')
const resizeLabel = computed(() => dashboard?.resizeLabelFor(props.itemId) ?? '')
const showHeader = computed(() => Boolean(props.title) || canDrag.value)
</script>

<template>
  <div
    ref="rootEl"
    v-bind="$attrs"
    data-gr-dashboard-item
    :data-item-id="itemId"
    :data-dragging="active ? '' : undefined"
    role="group"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabel ? undefined : (title ? titleId : undefined)"
    :class="classes"
    :style="style"
  >
    <GrCard class="h-full" variant="elevated">
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
          <span v-if="$slots.actions" :class="actionsClass">
            <slot name="actions" />
          </span>
        </div>
      </template>

      <div :class="[bodyClass, bodySizes[size]]">
        <slot v-if="visible" />
        <slot v-else name="skeleton" />
      </div>

      <template v-if="$slots.footer" #footer>
        <div :class="bodySizes[size]">
          <slot name="footer" />
        </div>
      </template>
    </GrCard>

    <ResizeHandle
      v-if="canResize && item"
      :label="resizeLabel"
      @pointerdown="dashboard?.startResize(itemId, $event)"
      @keydown="dashboard?.onResizeKeydown(itemId, $event)"
    />
  </div>
</template>
