<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

/**
 * Usage:
 *
 * <DsImageViewer
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
    zIndex?: number
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
    zIndex: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'switch', newIndex: number): void
  (e: 'rotate', deg: number): void
}>()

type DsImageViewerToolbarActions = {
  close: () => void
  prev: () => void
  next: () => void
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  rotateLeft: () => void
  rotateRight: () => void
}

const DEFAULT_Z_INDEX = 2000
const TRAILING_ZERO_DECIMAL_RE = /\.0$/

const open = computed(() => props.modelValue)
const total = computed(() => props.urlList.length)
const hasImages = computed(() => total.value > 0)

const currentIndex = ref(0)
const scale = ref(1)
const rotation = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)

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

const zoomValueText = computed(() => {
  const zoomPercent = scale.value * 100

  if (Number.isInteger(zoomPercent)) {
    return String(zoomPercent)
  }

  return zoomPercent.toFixed(1).replace(TRAILING_ZERO_DECIMAL_RE, '')
})

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

function setIndex(nextIndex: number, options?: { emitSwitch?: boolean }): void {
  const normalizedIndex = normalizeIndex(nextIndex)

  if (normalizedIndex === currentIndex.value) {
    return
  }

  currentIndex.value = normalizedIndex
  resetTransform()

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

function zoomIn(): void {
  scale.value = Math.min(props.maxScale, Number((scale.value * props.zoomRate).toFixed(4)))
}

function zoomOut(): void {
  scale.value = Math.max(props.minScale, Number((scale.value / props.zoomRate).toFixed(4)))
}

function rotateLeft(): void {
  rotation.value -= 90
  emit('rotate', rotation.value)
}

function rotateRight(): void {
  rotation.value += 90
  emit('rotate', rotation.value)
}

const toolbarActions: DsImageViewerToolbarActions = {
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
  (isOpen) => {
    if (!isOpen) {
      return
    }

    syncIndexFromInitial()
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
                    aria-label="Close image viewer"
                    class="h-11 w-11 flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    @click="closeViewer"
                  >
                    <span aria-hidden="true" class="text-lg leading-none">✕</span>
                  </button>
                </div>
              </div>

              <div class="relative z-10 h-full w-full flex items-center justify-center px-16 py-16 sm:px-24 sm:py-20">
                <button
                  v-if="total > 1"
                  type="button"
                  data-ds-image-viewer-prev
                  aria-label="Previous image"
                  class="absolute left-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:left-6"
                  @click="prev"
                >
                  <span aria-hidden="true" class="text-xl leading-none">‹</span>
                </button>

                <button
                  v-if="total > 1"
                  type="button"
                  data-ds-image-viewer-next
                  aria-label="Next image"
                  class="absolute right-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 flex items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-6"
                  @click="next"
                >
                  <span aria-hidden="true" class="text-xl leading-none">›</span>
                </button>

                <div class="h-full w-full flex items-center justify-center">
                  <img
                    v-if="currentUrl"
                    data-ds-image-viewer-image
                    :src="currentUrl"
                    alt=""
                    draggable="false"
                    class="max-h-full max-w-full select-none object-contain will-change-transform transition-transform duration-150 ease-out"
                    :style="imageStyle"
                  >

                  <div
                    v-else
                    class="rounded-[var(--ds-radius-xl)] border border-white/20 bg-black/25 px-4 py-3 text-sm text-white/80"
                  >
                    No image
                  </div>
                </div>
              </div>

              <div class="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-6 sm:pb-6">
                <div class="pointer-events-auto mx-auto w-full max-w-max">
                  <slot
                    name="toolbar"
                    :index="currentIndex"
                    :display-index="displayIndex"
                    :total="total"
                    :scale="scale"
                    :rotation="rotation"
                    :actions="toolbarActions"
                  >
                    <div class="rounded-full border border-white/20 bg-black/35 p-1 backdrop-blur-sm flex items-center gap-1">
                      <button
                        type="button"
                        data-ds-image-viewer-zoom-out
                        aria-label="Zoom out"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="zoomOut"
                      >
                        −
                      </button>

                      <button
                        type="button"
                        data-ds-image-viewer-zoom-reset
                        aria-label="Reset zoom"
                        class="h-11 min-w-11 px-3 flex items-center justify-center rounded-full text-xs font-700 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="resetTransform"
                      >
                        100%
                      </button>

                      <button
                        type="button"
                        data-ds-image-viewer-zoom-in
                        aria-label="Zoom in"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="zoomIn"
                      >
                        +
                      </button>

                      <template v-if="$slots['toolbar-actions']">
                        <div class="mx-1 h-6 w-px bg-white/25" aria-hidden="true" />

                        <slot
                          name="toolbar-actions"
                          :index="currentIndex"
                          :display-index="displayIndex"
                          :total="total"
                          :scale="scale"
                          :rotation="rotation"
                          :actions="toolbarActions"
                        />

                        <div class="mx-1 h-6 w-px bg-white/25" aria-hidden="true" />
                      </template>

                      <div v-else class="mx-1 h-6 w-px bg-white/25" aria-hidden="true" />

                      <button
                        type="button"
                        data-ds-image-viewer-rotate-left
                        aria-label="Rotate left"
                        class="h-11 min-w-11 px-2 flex items-center justify-center rounded-full text-sm font-600 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        @click="rotateLeft"
                      >
                        ↺
                      </button>

                      <button
                        type="button"
                        data-ds-image-viewer-rotate-right
                        aria-label="Rotate right"
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