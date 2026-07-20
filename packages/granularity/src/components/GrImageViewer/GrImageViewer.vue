<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useScrollLock } from '../../composables/internal/useScrollLock'
import { useZoomPan } from './composables/useZoomPan'
import { useWheelGesture } from './composables/useWheelGesture'
import { useViewerKeyboard } from './composables/useViewerKeyboard'

/**
 * Usage:
 *
 * <GrImageViewer
 *   v-model="open"
 *   :url-list="images"
 *   :initial-index="0"
 *   show-progress
 *   hide-on-click-modal
 * />
 *
 * Логика вынесена в composables: `useZoomPan` (масштаб/поворот/пан + метрики),
 * `useWheelGesture` (зум колесом/трекпадом с rAF-батчингом), `useViewerKeyboard`
 * (клавиатура). Сам SFC отвечает за оверлей, индекс изображений и композицию.
 */
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    urlList: string[]
    initialIndex?: number
    zoomRate?: number
    minScale?: number
    maxScale?: number
    hideOnClickModal?: boolean
    closeOnPressEscape?: boolean
    showProgress?: boolean
    showZoomValue?: boolean
    /** Включает масштабирование колесом мыши / жестом на трекпаде. По умолчанию включено. */
    wheelZoom?: boolean
    /** Включает перетаскивание (pan) картинки мышью. При наведении курсор «рука». По умолчанию выключено. */
    draggable?: boolean
    zIndex?: number
    /** i18n: aria-label кнопки закрытия. */
    closeLabel?: string
    /** i18n: aria-label кнопки «предыдущее изображение». */
    prevLabel?: string
    /** i18n: aria-label кнопки «следующее изображение». */
    nextLabel?: string
    /** i18n: aria-label кнопки «увеличить». */
    zoomInLabel?: string
    /** i18n: aria-label кнопки «уменьшить». */
    zoomOutLabel?: string
    /** i18n: aria-label кнопки «сбросить масштаб». */
    resetZoomLabel?: string
    /** i18n: aria-label кнопки «повернуть влево». */
    rotateLeftLabel?: string
    /** i18n: aria-label кнопки «повернуть вправо». */
    rotateRightLabel?: string
    /** i18n: текст в пустом состоянии (нет изображений). */
    emptyText?: string
  }>(),
  {
    initialIndex: 0,
    zoomRate: 1.2,
    minScale: 0.5,
    maxScale: 5,
    hideOnClickModal: false,
    closeOnPressEscape: true,
    showProgress: false,
    showZoomValue: true,
    wheelZoom: true,
    draggable: false,
    zIndex: undefined,
    closeLabel: undefined,
    prevLabel: undefined,
    nextLabel: undefined,
    zoomInLabel: undefined,
    zoomOutLabel: undefined,
    resetZoomLabel: undefined,
    rotateLeftLabel: undefined,
    rotateRightLabel: undefined,
    emptyText: undefined,
  },
)

const { t } = useGranularityTranslations()
const resolvedCloseLabel = computed(() => props.closeLabel ?? t('gr.imageViewer.close', 'Close image viewer'))
const resolvedPrevLabel = computed(() => props.prevLabel ?? t('gr.imageViewer.prev', 'Previous image'))
const resolvedNextLabel = computed(() => props.nextLabel ?? t('gr.imageViewer.next', 'Next image'))
const resolvedZoomInLabel = computed(() => props.zoomInLabel ?? t('gr.imageViewer.zoomIn', 'Zoom in'))
const resolvedZoomOutLabel = computed(() => props.zoomOutLabel ?? t('gr.imageViewer.zoomOut', 'Zoom out'))
const resolvedResetZoomLabel = computed(() => props.resetZoomLabel ?? t('gr.imageViewer.resetZoom', 'Reset zoom'))
const resolvedRotateLeftLabel = computed(() => props.rotateLeftLabel ?? t('gr.imageViewer.rotateLeft', 'Rotate left'))
const resolvedRotateRightLabel = computed(() => props.rotateRightLabel ?? t('gr.imageViewer.rotateRight', 'Rotate right'))
const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.imageViewer.empty', 'No image'))

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'switch', newIndex: number): void
  (e: 'rotate', deg: number): void
}>()

type GrImageViewerToolbarActions = {
  close: () => void
  prev: () => void
  next: () => void
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  rotateLeft: () => void
  rotateRight: () => void
}

type GrImageViewerSlotProps = {
  index: number
  displayIndex: number
  total: number
  scale: number
  rotation: number
  /** Натуральный (исходный) размер картинки, px. 0 пока изображение не загружено. */
  naturalWidth: number
  naturalHeight: number
  /** Фактический размер изображения на экране c учётом scale, px (footprint вдоль осей картинки). */
  renderedWidth: number
  renderedHeight: number
  /** Реальный масштаб относительно натурального размера (доля): renderedWidth / naturalWidth. */
  realScale: number
  /** Реальный масштаб в процентах, отформатированный (например `67`). */
  realScalePercent: string
  actions: GrImageViewerToolbarActions
}

const DEFAULT_Z_INDEX = 2000

const open = computed(() => props.modelValue)

// SSR-guard для teleport + общий reference-counted scroll-lock (как в GrModal/GrDrawer).
const isClient = typeof window !== 'undefined'
const { lock: lockBodyScroll, unlock: unlockBodyScroll } = useScrollLock()

const total = computed(() => props.urlList.length)
const hasImages = computed(() => total.value > 0)

const currentIndex = ref(0)
const imageEl = ref<HTMLImageElement | null>(null)

// Масштаб / поворот / панорамирование + метрики изображения.
const {
  scale,
  rotation,
  isDragging,
  naturalWidth,
  naturalHeight,
  renderedWidth,
  renderedHeight,
  realScale,
  realScalePercent,
  imageStyle,
  zoomValueText,
  setScale,
  zoomIn,
  zoomOut,
  rotateLeft,
  rotateRight,
  resetTransform,
  resetImageMetrics,
  onImageLoad,
  startObservingImage,
  stopObservingImage,
  onPointerDown,
  onPointerMove,
  onPointerUp,
} = useZoomPan({
  minScale: () => props.minScale,
  maxScale: () => props.maxScale,
  zoomRate: () => props.zoomRate,
  draggable: () => props.draggable,
  imageEl,
  onRotate: deg => emit('rotate', deg),
})

// Зум колесом мыши / жестом трекпада.
const { isWheelZooming, onWheel, endWheelZoom } = useWheelGesture({
  enabled: () => props.wheelZoom && hasImages.value,
  applyZoomFactor: factor => setScale(scale.value * factor),
})

const currentUrl = computed(() => (hasImages.value ? props.urlList[currentIndex.value] : undefined))
const displayIndex = computed(() => (hasImages.value ? currentIndex.value + 1 : 0))

const viewerStyle = computed(() => ({
  zIndex: String(Number.isFinite(props.zIndex) ? props.zIndex : DEFAULT_Z_INDEX),
}))

// Плавный CSS-переход только для дискретных зумов; при wheel-зуме/перетаскивании отключаем.
const imageTransitionClass = computed(() =>
  isWheelZooming.value || isDragging.value ? '' : 'transition-transform duration-150 ease-out',
)

// Курсор «рука» (grab/grabbing), только если включён drag.
const imageCursorClass = computed(() => {
  if (!props.draggable)
    return ''
  return isDragging.value ? 'cursor-grabbing' : 'cursor-grab'
})

function normalizeIndex(value: number): number {
  if (!hasImages.value)
    return 0
  const normalized = Number.isFinite(value) ? Math.trunc(value) : 0
  return ((normalized % total.value) + total.value) % total.value
}

function setIndex(nextIndex: number, options?: { emitSwitch?: boolean }): void {
  const normalizedIndex = normalizeIndex(nextIndex)
  if (normalizedIndex === currentIndex.value)
    return

  currentIndex.value = normalizedIndex
  resetTransform()
  resetImageMetrics()
  endWheelZoom()

  if (options?.emitSwitch !== false)
    emit('switch', normalizedIndex)
}

function syncIndexFromInitial(): void {
  if (!hasImages.value) {
    currentIndex.value = 0
    return
  }
  currentIndex.value = normalizeIndex(props.initialIndex)
  resetTransform()
  resetImageMetrics()
  endWheelZoom()
}

function preloadAt(index: number): void {
  const url = props.urlList[index]
  if (!url)
    return
  const image = new Image()
  image.decoding = 'async'
  image.src = url
}

function closeViewer(): void {
  emit('update:modelValue', false)
  emit('close')
}

function prev(): void {
  setIndex(currentIndex.value - 1)
}

function next(): void {
  setIndex(currentIndex.value + 1)
}

const toolbarActions: GrImageViewerToolbarActions = {
  close: closeViewer,
  prev,
  next,
  zoomIn,
  zoomOut,
  reset: resetTransform,
  rotateLeft,
  rotateRight,
}

const toolbarSlotProps = computed<GrImageViewerSlotProps>(() => ({
  index: currentIndex.value,
  displayIndex: displayIndex.value,
  total: total.value,
  scale: scale.value,
  rotation: rotation.value,
  naturalWidth: naturalWidth.value,
  naturalHeight: naturalHeight.value,
  renderedWidth: renderedWidth.value,
  renderedHeight: renderedHeight.value,
  realScale: realScale.value,
  realScalePercent: realScalePercent.value,
  actions: toolbarActions,
}))

function onBackdropClick(): void {
  if (!props.hideOnClickModal)
    return
  closeViewer()
}

const { onKeydown } = useViewerKeyboard({
  closeOnEscape: () => props.closeOnPressEscape,
  actions: { close: closeViewer, prev, next, zoomIn, zoomOut, reset: resetTransform },
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      unlockBodyScroll()
      stopObservingImage()
      endWheelZoom()
      isDragging.value = false
      return
    }

    lockBodyScroll()
    syncIndexFromInitial()
    await nextTick()
    startObservingImage()
  },
  { immediate: true },
)

watch(
  () => props.initialIndex,
  () => {
    if (!props.modelValue)
      return
    syncIndexFromInitial()
  },
)

watch(
  () => props.urlList,
  () => {
    if (!props.modelValue)
      return
    syncIndexFromInitial()
  },
  { deep: true },
)

watch(
  currentIndex,
  (index) => {
    if (!hasImages.value || total.value < 2)
      return
    preloadAt(normalizeIndex(index - 1))
    preloadAt(normalizeIndex(index + 1))
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unlockBodyScroll()
  stopObservingImage()
  endWheelZoom()
})
</script>

<template>
  <teleport to="body" :disabled="!isClient">
    <TransitionRoot :show="open" as="template">
      <Dialog
        as="div"
        class="fixed inset-0"
        :style="viewerStyle"
        role="dialog"
        aria-modal="true"
        :static="true"
        @keydown="onKeydown"
      >
        <div class="fixed inset-0 overflow-hidden">
          <TransitionChild
            as="template"
            enter="duration-150 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-120 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div
              data-gr-image-viewer-overlay
              class="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
              @click="onBackdropClick"
            />
          </TransitionChild>

          <TransitionChild
            as="template"
            enter="duration-180 ease-out"
            enter-from="opacity-0 scale-98"
            enter-to="opacity-100 scale-100"
            leave="duration-130 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-98"
          >
            <DialogPanel
              data-gr-image-viewer-panel
              class="relative z-10 h-full w-full outline-none"
              tabindex="-1"
            >
              <div class="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 py-3 sm:px-6">
                <div class="pointer-events-auto flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <div
                      v-if="showProgress"
                      data-gr-image-viewer-progress
                      class="rounded-full bg-black/35 px-3 py-1 text-xs font-600 text-white/95 sm:text-sm"
                    >
                      {{ displayIndex }} / {{ total }}
                    </div>

                    <div
                      v-if="showZoomValue"
                      data-gr-image-viewer-zoom-value
                      class="rounded-full bg-black/35 px-3 py-1 text-xs font-700 text-white/95 sm:text-sm"
                    >
                      {{ zoomValueText }}%
                    </div>
                  </div>

                  <button
                    type="button"
                    data-gr-image-viewer-close
                    :aria-label="resolvedCloseLabel"
                    class="h-11 w-11 flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    @click="closeViewer"
                  >
                    <span aria-hidden="true" class="text-lg leading-none">✕</span>
                  </button>
                </div>
              </div>

              <div
                class="relative z-10 h-full w-full flex items-center justify-center px-16 py-16 sm:px-24 sm:py-20"
                @wheel="onWheel"
              >
                <button
                  v-if="total > 1"
                  type="button"
                  data-gr-image-viewer-prev
                  :aria-label="resolvedPrevLabel"
                  class="absolute left-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:left-6"
                  @click="prev"
                >
                  <span aria-hidden="true" class="text-xl leading-none">‹</span>
                </button>

                <button
                  v-if="total > 1"
                  type="button"
                  data-gr-image-viewer-next
                  :aria-label="resolvedNextLabel"
                  class="absolute right-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-6"
                  @click="next"
                >
                  <span aria-hidden="true" class="text-xl leading-none">›</span>
                </button>

                <div class="h-full w-full flex items-center justify-center">
                  <img
                    v-if="currentUrl"
                    ref="imageEl"
                    data-gr-image-viewer-image
                    :src="currentUrl"
                    alt=""
                    draggable="false"
                    class="max-h-full max-w-full select-none object-contain will-change-transform"
                    :class="[imageTransitionClass, imageCursorClass]"
                    :style="imageStyle"
                    @load="onImageLoad"
                    @pointerdown="onPointerDown"
                    @pointermove="onPointerMove"
                    @pointerup="onPointerUp"
                    @pointercancel="onPointerUp"
                  >

                  <div
                    v-else
                    class="rounded-[var(--gr-radius-xl)] border border-white/20 bg-black/25 px-4 py-3 text-sm text-white/80"
                  >
                    {{ resolvedEmptyText }}
                  </div>
                </div>
              </div>

              <div class="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-6 sm:pb-6">
                <div class="pointer-events-auto mx-auto w-full max-w-max">
                  <slot
                    name="toolbar"
                    v-bind="toolbarSlotProps"
                  >
                    <div class="rounded-full border border-white/20 bg-black/35 p-1 backdrop-blur-sm flex items-center gap-1">
                      <button
                        type="button"
                        data-gr-image-viewer-zoom-out
                        :aria-label="resolvedZoomOutLabel"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="zoomOut"
                      >
                        −
                      </button>

                      <button
                        type="button"
                        data-gr-image-viewer-zoom-reset
                        :aria-label="resolvedResetZoomLabel"
                        class="h-11 min-w-11 px-3 flex items-center justify-center rounded-full text-xs font-700 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="resetTransform"
                      >
                        100%
                      </button>

                      <button
                        type="button"
                        data-gr-image-viewer-zoom-in
                        :aria-label="resolvedZoomInLabel"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="zoomIn"
                      >
                        +
                      </button>

                      <template v-if="$slots['toolbar-actions']">
                        <div class="mx-1 h-6 w-px bg-white/25" aria-hidden="true" />

                        <slot
                          name="toolbar-actions"
                          v-bind="toolbarSlotProps"
                        />

                        <div class="mx-1 h-6 w-px bg-white/25" aria-hidden="true" />
                      </template>

                      <div v-else class="mx-1 h-6 w-px bg-white/25" aria-hidden="true" />

                      <button
                        type="button"
                        data-gr-image-viewer-rotate-left
                        :aria-label="resolvedRotateLeftLabel"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="rotateLeft"
                      >
                        ↺
                      </button>

                      <button
                        type="button"
                        data-gr-image-viewer-rotate-right
                        :aria-label="resolvedRotateRightLabel"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="rotateRight"
                      >
                        ↻
                      </button>
                    </div>
                  </slot>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>
</template>