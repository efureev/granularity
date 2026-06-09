<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

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
    zIndex: undefined,
    closeLabel: 'Close image viewer',
    prevLabel: 'Previous image',
    nextLabel: 'Next image',
    zoomInLabel: 'Zoom in',
    zoomOutLabel: 'Zoom out',
    resetZoomLabel: 'Reset zoom',
    rotateLeftLabel: 'Rotate left',
    rotateRightLabel: 'Rotate right',
    emptyText: 'No image',
  },
)

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
const TRAILING_ZERO_DECIMAL_RE = /\.0$/
// Чувствительность масштабирования колесом/трекпадом: чем больше — тем резче реакция.
const WHEEL_ZOOM_SENSITIVITY = 0.0015
// Сколько ms простоя после последнего wheel-события считаем «зум завершён»
// (после этого возвращаем плавный CSS-переход).
const WHEEL_IDLE_MS = 120

const open = computed(() => props.modelValue)
const total = computed(() => props.urlList.length)
const hasImages = computed(() => total.value > 0)

const currentIndex = ref(0)
const scale = ref(1)
const rotation = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)

const imageEl = ref<HTMLImageElement | null>(null)

// Флаг активного зума колесом/трекпадом. Пока true — CSS-переход отключён,
// чтобы непрерывное масштабирование не «наслаивалось» и не дёргалось.
const isWheelZooming = ref(false)

// Накопленный deltaY между кадрами и id запланированного rAF.
let pendingWheelDelta = 0
let wheelFrameId: number | null = null
let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null

// Натуральный (исходный) размер картинки, читается из `<img>` при загрузке.
const naturalWidth = ref(0)
const naturalHeight = ref(0)

// Layout-размер вписанного (`object-contain`) изображения без учёта CSS transform/scale.
const fittedWidth = ref(0)
const fittedHeight = ref(0)

let resizeObserver: ResizeObserver | null = null

const currentUrl = computed(() => {
  if (!hasImages.value) {
    return undefined
  }

  return props.urlList[currentIndex.value]
})

const displayIndex = computed(() => {
  if (!hasImages.value) {
    return 0
  }

  return currentIndex.value + 1
})

const viewerStyle = computed(() => ({
  zIndex: String(Number.isFinite(props.zIndex) ? props.zIndex : DEFAULT_Z_INDEX),
}))

const imageStyle = computed(() => ({
  transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${scale.value}) rotate(${rotation.value}deg)`,
}))

// Плавный CSS-переход transform только для дискретных зумов (кнопки/клавиши).
// При непрерывном зуме колесом переход отключаем — иначе картинка «дёргается» и наслаивается.
const imageTransitionClass = computed(() =>
  isWheelZooming.value ? '' : 'transition-transform duration-150 ease-out',
)

function formatPercent(value: number): string {
  if (Number.isInteger(value)) {
    return String(value)
  }

  return value.toFixed(1).replace(TRAILING_ZERO_DECIMAL_RE, '')
}

const zoomValueText = computed(() => formatPercent(scale.value * 100))

// Фактический размер изображения на экране вдоль его осей (footprint), c учётом scale.
const renderedWidth = computed(() => Math.round(fittedWidth.value * scale.value))
const renderedHeight = computed(() => Math.round(fittedHeight.value * scale.value))

// Реальный масштаб относительно натурального размера (доля). Не зависит от rotation,
// так как scale равномерный по осям картинки.
const realScale = computed(() => {
  if (!naturalWidth.value) {
    return 0
  }

  return (fittedWidth.value * scale.value) / naturalWidth.value
})

const realScalePercent = computed(() => formatPercent(realScale.value * 100))

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

function normalizeIndex(value: number): number {
  if (!hasImages.value) {
    return 0
  }

  const normalized = Number.isFinite(value) ? Math.trunc(value) : 0

  return ((normalized % total.value) + total.value) % total.value
}

function resetTransform(): void {
  scale.value = 1
  rotation.value = 0
  offsetX.value = 0
  offsetY.value = 0
}

function resetImageMetrics(): void {
  naturalWidth.value = 0
  naturalHeight.value = 0
  fittedWidth.value = 0
  fittedHeight.value = 0
}

function measureFitted(): void {
  const el = imageEl.value

  if (!el) {
    return
  }

  // offsetWidth/Height — layout-размер вписанного изображения, без учёта CSS transform.
  fittedWidth.value = el.offsetWidth
  fittedHeight.value = el.offsetHeight
}

function onImageLoad(event: Event): void {
  const el = event.target as HTMLImageElement

  naturalWidth.value = el.naturalWidth
  naturalHeight.value = el.naturalHeight
  measureFitted()
}

function startObservingImage(): void {
  const el = imageEl.value

  if (!el || typeof ResizeObserver === 'undefined') {
    return
  }

  if (!resizeObserver) {
    resizeObserver = new ResizeObserver(() => measureFitted())
  }

  resizeObserver.observe(el)

  // Если картинка уже в кэше и `load` не сработал — считаем метрики сразу.
  if (el.complete && el.naturalWidth) {
    naturalWidth.value = el.naturalWidth
    naturalHeight.value = el.naturalHeight
  }

  measureFitted()
}

function stopObservingImage(): void {
  resizeObserver?.disconnect()
}

function setIndex(nextIndex: number, options?: { emitSwitch?: boolean }): void {
  const normalizedIndex = normalizeIndex(nextIndex)

  if (normalizedIndex === currentIndex.value) {
    return
  }

  currentIndex.value = normalizedIndex
  resetTransform()
  resetImageMetrics()
  endWheelZoom()

  if (options?.emitSwitch !== false) {
    emit('switch', normalizedIndex)
  }
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

  if (!url) {
    return
  }

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

function setScale(value: number): void {
  const clamped = Math.min(props.maxScale, Math.max(props.minScale, value))

  scale.value = Number(clamped.toFixed(4))
}

function zoomIn(): void {
  setScale(scale.value * props.zoomRate)
}

function zoomOut(): void {
  setScale(scale.value / props.zoomRate)
}

function cancelWheelFrame(): void {
  if (wheelFrameId !== null) {
    cancelAnimationFrame(wheelFrameId)
    wheelFrameId = null
  }
}

function endWheelZoom(): void {
  if (wheelIdleTimer !== null) {
    clearTimeout(wheelIdleTimer)
    wheelIdleTimer = null
  }

  isWheelZooming.value = false
  pendingWheelDelta = 0
  cancelWheelFrame()
}

// Применяем накопленный за кадр deltaY одним обновлением scale — так рендер
// происходит не чаще одного раза в кадр (без «дёрганья» от частых обновлений).
function flushWheelZoom(): void {
  wheelFrameId = null

  const delta = pendingWheelDelta
  pendingWheelDelta = 0

  if (!delta) {
    return
  }

  // Экспоненциальный шаг — плавно и одинаково ощущается и для колеса, и для трекпада.
  // delta < 0 (от себя / scroll up) — приближение, delta > 0 — отдаление.
  const factor = Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY)

  setScale(scale.value * factor)
}

function onWheel(event: WheelEvent): void {
  if (!props.wheelZoom || !hasImages.value) {
    return
  }

  // Не даём странице/оверлею проскроллиться — колесо отдаём под зум.
  event.preventDefault()

  // Во время непрерывного зума отключаем CSS-переход: плавность даёт само
  // покадровое обновление, а transition на каждом микрошаге вызывает лаг/наслоение.
  isWheelZooming.value = true

  pendingWheelDelta += event.deltaY

  if (wheelFrameId === null) {
    wheelFrameId = requestAnimationFrame(flushWheelZoom)
  }

  if (wheelIdleTimer !== null) {
    clearTimeout(wheelIdleTimer)
  }

  // По завершении жеста возвращаем плавный переход для последующих дискретных зумов.
  wheelIdleTimer = setTimeout(() => {
    wheelIdleTimer = null
    isWheelZooming.value = false
  }, WHEEL_IDLE_MS)
}

function rotateLeft(): void {
  rotation.value -= 90
  emit('rotate', rotation.value)
}

function rotateRight(): void {
  rotation.value += 90
  emit('rotate', rotation.value)
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

function onBackdropClick(): void {
  if (!props.hideOnClickModal) {
    return
  }

  closeViewer()
}

function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'Escape':
      if (!props.closeOnPressEscape) {
        return
      }

      event.preventDefault()
      closeViewer()
      return

    case 'ArrowLeft':
      event.preventDefault()
      prev()
      return

    case 'ArrowRight':
      event.preventDefault()
      next()
      return

    case '+':
    case '=':
    case 'Add':
      event.preventDefault()
      zoomIn()
      return

    case '-':
    case '_':
    case 'Subtract':
      event.preventDefault()
      zoomOut()
      return

    case '0':
      event.preventDefault()
      resetTransform()
      break

    default:
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      stopObservingImage()
      endWheelZoom()
      return
    }

    syncIndexFromInitial()
    await nextTick()
    startObservingImage()
  },
  { immediate: true },
)

watch(
  () => props.initialIndex,
  () => {
    if (!props.modelValue) {
      return
    }

    syncIndexFromInitial()
  },
)

watch(
  () => props.urlList,
  () => {
    if (!props.modelValue) {
      return
    }

    syncIndexFromInitial()
  },
  { deep: true },
)

watch(
  currentIndex,
  (index) => {
    if (!hasImages.value || total.value < 2) {
      return
    }

    preloadAt(normalizeIndex(index - 1))
    preloadAt(normalizeIndex(index + 1))
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopObservingImage()
  endWheelZoom()
})
</script>

<template>
  <teleport to="body">
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
              data-ds-image-viewer-overlay
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
              data-ds-image-viewer-panel
              class="relative z-10 h-full w-full outline-none"
              tabindex="-1"
            >
              <div class="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 py-3 sm:px-6">
                <div class="pointer-events-auto flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <div
                      v-if="showProgress"
                      data-ds-image-viewer-progress
                      class="rounded-full bg-black/35 px-3 py-1 text-xs font-600 text-white/95 sm:text-sm"
                    >
                      {{ displayIndex }} / {{ total }}
                    </div>

                    <div
                      v-if="showZoomValue"
                      data-ds-image-viewer-zoom-value
                      class="rounded-full bg-black/35 px-3 py-1 text-xs font-700 text-white/95 sm:text-sm"
                    >
                      {{ zoomValueText }}%
                    </div>
                  </div>

                  <button
                    type="button"
                    data-ds-image-viewer-close
                    :aria-label="closeLabel"
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
                  data-ds-image-viewer-prev
                  :aria-label="prevLabel"
                  class="absolute left-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:left-6"
                  @click="prev"
                >
                  <span aria-hidden="true" class="text-xl leading-none">‹</span>
                </button>

                <button
                  v-if="total > 1"
                  type="button"
                  data-ds-image-viewer-next
                  :aria-label="nextLabel"
                  class="absolute right-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-6"
                  @click="next"
                >
                  <span aria-hidden="true" class="text-xl leading-none">›</span>
                </button>

                <div class="h-full w-full flex items-center justify-center">
                  <img
                    v-if="currentUrl"
                    ref="imageEl"
                    data-ds-image-viewer-image
                    :src="currentUrl"
                    alt=""
                    draggable="false"
                    class="max-h-full max-w-full select-none object-contain will-change-transform"
                    :class="imageTransitionClass"
                    :style="imageStyle"
                    @load="onImageLoad"
                  >

                  <div
                    v-else
                    class="rounded-[var(--ds-radius-xl)] border border-white/20 bg-black/25 px-4 py-3 text-sm text-white/80"
                  >
                    {{ emptyText }}
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
                        data-ds-image-viewer-zoom-out
                        :aria-label="zoomOutLabel"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="zoomOut"
                      >
                        −
                      </button>

                      <button
                        type="button"
                        data-ds-image-viewer-zoom-reset
                        :aria-label="resetZoomLabel"
                        class="h-11 min-w-11 px-3 flex items-center justify-center rounded-full text-xs font-700 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="resetTransform"
                      >
                        100%
                      </button>

                      <button
                        type="button"
                        data-ds-image-viewer-zoom-in
                        :aria-label="zoomInLabel"
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
                        data-ds-image-viewer-rotate-left
                        :aria-label="rotateLeftLabel"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="rotateLeft"
                      >
                        ↺
                      </button>

                      <button
                        type="button"
                        data-ds-image-viewer-rotate-right
                        :aria-label="rotateRightLabel"
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