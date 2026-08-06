<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useTeleportEnabled } from '../../composables/internal/useTeleportEnabled'
import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useScrollLock } from '../../composables/internal/useScrollLock'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'
import IconMinus from '~icons/lucide/minus'
import IconPlus from '~icons/lucide/plus'
import IconRotateCcw from '~icons/lucide/rotate-ccw'
import IconRotateCw from '~icons/lucide/rotate-cw'
import IconX from '~icons/lucide/x'

import GrIcon from '../GrIcon/GrIcon.vue'

import {
  badgeClass,
  chromeButtonClass,
  emptyStateClass,
  scrimClass,
  toolbarButtonClass,
  toolbarSeparatorClass,
  toolbarShellClass,
} from './grImageViewerStyles'
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
/** Кадр просмотрщика: только адрес или адрес с альтернативным текстом. */
export type GrImageViewerItem = { src: string, alt?: string }
export type GrImageViewerSource = string | GrImageViewerItem

import { useGrThemeAttrs } from '../GrConfigProvider/context'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    /**
     * Кадры. Строка — только адрес; объект `{ src, alt }` даёт изображению
     * альтернативный текст: без него просмотрщик пуст для незрячего
     * пользователя, а придумать текст за потребителя компонент не может.
     */
    urlList: GrImageViewerSource[]
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
    /** Слой поверх шкалы. По умолчанию — `--gr-z-modal`, как у остальных модальных оверлеев. */
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
    /**
     * Доступное имя слоя. Модальный диалог без имени — нарушение
     * `aria-dialog-name`: диктор объявит «диалог» и замолчит.
     */
    ariaLabel?: string
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
    ariaLabel: undefined,
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
const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.imageViewer.label', 'Image viewer'))

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  /** Показан другой кадр. */
  (e: 'change', newIndex: number): void
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
  /** Текущий кадр — адрес и альтернативный текст. */
  src?: string
  alt: string
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

const open = computed(() => props.modelValue)

// SSR-guard для teleport + общий reference-counted scroll-lock (как в GrModal/GrDrawer).
// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const teleportEnabled = useTeleportEnabled()

// Тема поддерева на телепортированную панель: в DOM она уезжает в `body`, то
// есть вне обёртки провайдера, и `data-theme` с неё не наследуется. В дереве
// компонентов панель остаётся внутри — `inject` доходит, и тему она ставит себе
// сама.
const themeAttrs = useGrThemeAttrs()
const { lock: lockBodyScroll, unlock: unlockBodyScroll } = useScrollLock()

const items = computed<GrImageViewerItem[]>(() =>
  props.urlList.map(item => (typeof item === 'string' ? { src: item } : item)),
)

const total = computed(() => items.value.length)
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

const currentItem = computed(() => (hasImages.value ? items.value[currentIndex.value] : undefined))
const currentUrl = computed(() => currentItem.value?.src)
const currentAlt = computed(() => currentItem.value?.alt ?? '')
const displayIndex = computed(() => (hasImages.value ? currentIndex.value + 1 : 0))

/**
 * Живой регион пуст до первой смены кадра: регион, который появляется сразу с
 * текстом, часть AT не объявляет вовсе, а объявлять «изображение 1 из 5» в
 * момент открытия и незачем — это скажет имя диалога.
 */
const liveMessage = ref('')

watch(displayIndex, (index) => {
  liveMessage.value = hasImages.value
    ? t('gr.imageViewer.position', 'Image {index} of {total}', { index, total: total.value })
    : ''
})

// Просмотрщик — оверлей модального класса, значит и слой у него модальный.
// Константа 2000 ставила его выше тостов: уведомление уровня приложения
// оказывалось под картинкой. Проп остаётся escape-hatch’ем.
const viewerStyle = computed(() => ({
  zIndex: Number.isFinite(props.zIndex) ? String(props.zIndex) : 'var(--gr-z-modal)',
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
    emit('change', normalizedIndex)
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
  const url = items.value[index]?.src
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

// Наружу отдаём тот же набор, что получает слот тулбара. Открытия здесь нет
// намеренно: оно принадлежит `v-model`, и вторая точка входа рассинхронизировала
// бы состояние с моделью.
defineExpose(toolbarActions)

const toolbarSlotProps = computed<GrImageViewerSlotProps>(() => ({
  index: currentIndex.value,
  src: currentUrl.value,
  alt: currentAlt.value,
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
  actions: { close: closeViewer, prev, next, zoomIn, zoomOut, reset: resetTransform },
})

// Esc — через общий стек слоёв: просмотрщик поверх модалки обязан закрывать себя.
// Просмотрщик — модальный класс: бэкдроп, scroll-lock, фокус-ловушка HeadlessUI.
// Значит он и участвует в вычислении `inert` наравне с модалками и drawer'ом.
const isTopmost = ref(true)
const inertAttr = computed(() => (props.modelValue && !isTopmost.value ? '' : undefined))

useOverlayLayer(
  computed(() => props.modelValue),
  closeViewer,
  {
    modal: true,
    closeOnEscape: () => props.closeOnPressEscape,
    onTopmostChange: (value) => { isTopmost.value = value },
    restoreFocus: false,
  },
)

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

/**
 * Список кадров меняется у живой галереи постоянно: догрузилась следующая
 * страница, заменили один url. Раньше на любое такое изменение просмотрщик
 * дёргал `syncIndexFromInitial()` — то есть выбрасывал пользователя на
 * `initialIndex` и сбрасывал зум с поворотом.
 *
 * Держимся кадра, а не позиции: если текущий `src` остался в наборе, идём за
 * ним (и трансформации не трогаем). Исчез — остаёмся на своём месте в списке,
 * прижав индекс к границам, и только тогда сбрасываем трансформации: показываем
 * уже другую картинку.
 */
watch(
  items,
  (next, prev) => {
    if (!props.modelValue)
      return

    if (!next.length) {
      currentIndex.value = 0
      resetTransform()
      resetImageMetrics()
      endWheelZoom()
      return
    }

    const shownSrc = prev?.[currentIndex.value]?.src
    const keptIndex = shownSrc ? next.findIndex(item => item.src === shownSrc) : -1

    if (keptIndex >= 0) {
      currentIndex.value = keptIndex
      return
    }

    currentIndex.value = Math.min(currentIndex.value, next.length - 1)
    resetTransform()
    resetImageMetrics()
    endWheelZoom()
  },
  { deep: true },
)

// `new Image()` существует только в браузере, поэтому предзагрузка соседей
// стартует с `onMounted`, а не с `immediate: true`: иначе она выполнялась бы
// синхронно в setup и роняла серверный рендер страницы, где просмотрщик просто
// присутствует закрытым.
function preloadNeighbours(index: number): void {
  if (!hasImages.value || total.value < 2)
    return
  preloadAt(normalizeIndex(index - 1))
  preloadAt(normalizeIndex(index + 1))
}

watch(currentIndex, preloadNeighbours)

onMounted(() => {
  preloadNeighbours(currentIndex.value)
})

onBeforeUnmount(() => {
  unlockBodyScroll()
  stopObservingImage()
  endWheelZoom()
})
</script>

<template>
  <teleport to="body" :disabled="!teleportEnabled">
    <TransitionRoot :show="open" as="template">
      <Dialog
        as="div"
        v-bind="themeAttrs"
        :inert="inertAttr"
        class="fixed inset-0"
        :style="viewerStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="resolvedAriaLabel"
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
              :class="scrimClass"
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
                      class="font-600"
                      :class="badgeClass"
                    >
                      {{ displayIndex }} / {{ total }}
                    </div>

                    <span
                      data-gr-image-viewer-live
                      class="sr-only"
                      role="status"
                      aria-live="polite"
                    >{{ liveMessage }}</span>

                    <div
                      v-if="showZoomValue"
                      data-gr-image-viewer-zoom-value
                      class="font-700"
                      :class="badgeClass"
                    >
                      {{ zoomValueText }}%
                    </div>
                  </div>

                  <button
                    type="button"
                    data-gr-image-viewer-close
                    :aria-label="resolvedCloseLabel"
                    class="h-11 w-11"
                    :class="chromeButtonClass"
                    @click="closeViewer"
                  >
                    <GrIcon size="md">
                      <IconX />
                    </GrIcon>
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
                  class="absolute left-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 sm:left-6"
                  :class="chromeButtonClass"
                  @click="prev"
                >
                  <GrIcon size="lg">
                    <IconChevronLeft />
                  </GrIcon>
                </button>

                <button
                  v-if="total > 1"
                  type="button"
                  data-gr-image-viewer-next
                  :aria-label="resolvedNextLabel"
                  class="absolute right-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 sm:right-6"
                  :class="chromeButtonClass"
                  @click="next"
                >
                  <GrIcon size="lg">
                    <IconChevronRight />
                  </GrIcon>
                </button>

                <div class="h-full w-full flex items-center justify-center">
                  <img
                    v-if="currentUrl"
                    ref="imageEl"
                    data-gr-image-viewer-image
                    :src="currentUrl"
                    :alt="currentAlt"
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
                    :class="emptyStateClass"
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
                    <div :class="toolbarShellClass">
                      <button
                        type="button"
                        data-gr-image-viewer-zoom-out
                        :aria-label="resolvedZoomOutLabel"
                        class="h-11 min-w-11 px-2 text-sm font-600"
                        :class="toolbarButtonClass"
                        @click="zoomOut"
                      >
                        <GrIcon size="sm">
                          <IconMinus />
                        </GrIcon>
                      </button>

                      <button
                        type="button"
                        data-gr-image-viewer-zoom-reset
                        :aria-label="resolvedResetZoomLabel"
                        class="h-11 min-w-11 px-3 text-xs font-700"
                        :class="toolbarButtonClass"
                        @click="resetTransform"
                      >
                        100%
                      </button>

                      <button
                        type="button"
                        data-gr-image-viewer-zoom-in
                        :aria-label="resolvedZoomInLabel"
                        class="h-11 min-w-11 px-2 text-sm font-600"
                        :class="toolbarButtonClass"
                        @click="zoomIn"
                      >
                        <GrIcon size="sm">
                          <IconPlus />
                        </GrIcon>
                      </button>

                      <template v-if="$slots['toolbar-actions']">
                        <div :class="toolbarSeparatorClass" aria-hidden="true" />

                        <slot
                          name="toolbar-actions"
                          v-bind="toolbarSlotProps"
                        />

                        <div :class="toolbarSeparatorClass" aria-hidden="true" />
                      </template>

                      <div v-else :class="toolbarSeparatorClass" aria-hidden="true" />

                      <button
                        type="button"
                        data-gr-image-viewer-rotate-left
                        :aria-label="resolvedRotateLeftLabel"
                        class="h-11 min-w-11 px-2 text-sm font-600"
                        :class="toolbarButtonClass"
                        @click="rotateLeft"
                      >
                        <GrIcon size="sm">
                          <IconRotateCcw />
                        </GrIcon>
                      </button>

                      <button
                        type="button"
                        data-gr-image-viewer-rotate-right
                        :aria-label="resolvedRotateRightLabel"
                        class="h-11 min-w-11 px-2 text-sm font-600"
                        :class="toolbarButtonClass"
                        @click="rotateRight"
                      >
                        <GrIcon size="sm">
                          <IconRotateCw />
                        </GrIcon>
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