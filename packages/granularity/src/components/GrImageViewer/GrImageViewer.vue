<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { useAnnouncer } from '../../composables/useAnnouncer'
import { useModalOverlay } from '../../composables/internal/useModalOverlay'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'
import IconDownload from '~icons/lucide/download'
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
import { usePointerGestures } from './composables/usePointerGestures'
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


export interface GrImageViewerProps {
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
  /**
   * Имя CSS-переменной слоя — escape-hatch мимо `--gr-z-modal`. Сырое число
   * компонент не принимает: слой задаётся шкалой, см. `docs/z-index.md`.
   */
  zIndexVar?: string
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
  /** i18n: aria-label кнопки «до натурального размера». */
  zoomToNaturalLabel?: string
  /** i18n: aria-label кнопки «повернуть влево». */
  rotateLeftLabel?: string
  /** i18n: aria-label кнопки «повернуть вправо». */
  rotateRightLabel?: string
  /** Показывать кнопку скачивания текущего кадра. */
  showDownload?: boolean
  /** i18n: aria-label кнопки «скачать». */
  downloadLabel?: string
  /** i18n: текст в пустом состоянии (нет изображений). */
  emptyText?: string
  /**
   * Доступное имя слоя. Модальный диалог без имени — нарушение
   * `aria-dialog-name`: диктор объявит «диалог» и замолчит.
   */
  ariaLabel?: string
}

export interface GrImageViewerEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  /** Показан другой кадр. */
  (e: 'change', newIndex: number): void
  (e: 'rotate', deg: number): void
  /** Нажата кнопка скачивания. Само скачивание компонент уже запустил. */
  (e: 'download', payload: { src: string, alt: string, index: number }): void
}

const props = withDefaults(
  defineProps<GrImageViewerProps>(),
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
    zIndexVar: undefined,
    closeLabel: undefined,
    prevLabel: undefined,
    nextLabel: undefined,
    zoomInLabel: undefined,
    zoomOutLabel: undefined,
    resetZoomLabel: undefined,
    zoomToNaturalLabel: undefined,
    rotateLeftLabel: undefined,
    rotateRightLabel: undefined,
    showDownload: false,
    downloadLabel: undefined,
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
const resolvedZoomToNaturalLabel = computed(() => props.zoomToNaturalLabel ?? t('gr.imageViewer.zoomToNatural', 'Actual size (1:1)'))
const resolvedRotateLeftLabel = computed(() => props.rotateLeftLabel ?? t('gr.imageViewer.rotateLeft', 'Rotate left'))
const resolvedRotateRightLabel = computed(() => props.rotateRightLabel ?? t('gr.imageViewer.rotateRight', 'Rotate right'))
const resolvedDownloadLabel = computed(() => props.downloadLabel ?? t('gr.imageViewer.download', 'Download image'))
const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.imageViewer.empty', 'No image'))
const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.imageViewer.label', 'Image viewer'))

const emit = defineEmits<GrImageViewerEmits>()

type GrImageViewerToolbarActions = {
  close: () => void
  prev: () => void
  next: () => void
  zoomIn: () => void
  zoomOut: () => void
  /** Масштаб «один к одному»: реальные 100%, а не номинальные. */
  zoomToNatural: () => void
  reset: () => void
  rotateLeft: () => void
  rotateRight: () => void
  /** Скачать текущий кадр — то же, что делает кнопка тулбара. */
  download: () => void
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

const items = computed<GrImageViewerItem[]>(() =>
  props.urlList.map(item => (typeof item === 'string' ? { src: item } : item)),
)

const total = computed(() => items.value.length)
const hasImages = computed(() => total.value > 0)

const currentIndex = ref(0)
const imageEl = ref<HTMLImageElement | null>(null)
// Область кадра: система координат для якорного зума и границы перетаскивания.
const stageEl = ref<HTMLElement | null>(null)

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
  zoomIn,
  zoomOut,
  zoomToNatural,
  rotateLeft,
  rotateRight,
  resetTransform,
  resetImageMetrics,
  onImageLoad,
  startObservingImage,
  stopObservingImage,
  isPannable,
  setScaleAt,
  startPan,
  movePan,
  endPan,
  cancelPan,
  onPointerDown: onPanPointerDown,
} = useZoomPan({
  minScale: () => props.minScale,
  maxScale: () => props.maxScale,
  zoomRate: () => props.zoomRate,
  draggable: () => props.draggable,
  imageEl,
  viewportEl: stageEl,
  onRotate: deg => emit('rotate', deg),
})

// Зум колесом мыши / жестом трекпада — с якорем в точке под курсором.
const { isWheelZooming, onWheel, endWheelZoom } = useWheelGesture({
  enabled: () => props.wheelZoom && hasImages.value,
  applyZoomFactor: (factor, anchor) => setScaleAt(scale.value * factor, anchor),
})

const currentItem = computed(() => (hasImages.value ? items.value[currentIndex.value] : undefined))
const currentUrl = computed(() => currentItem.value?.src)
const currentAlt = computed(() => currentItem.value?.alt ?? '')
const displayIndex = computed(() => (hasImages.value ? currentIndex.value + 1 : 0))

/**
 * Позицию объявляем только на смене кадра: при открытии её скажет имя диалога.
 *
 * Регион общий и живёт вне просмотрщика — он помечен `data-gr-live-region` и
 * потому не гасится `inert`, которым просмотрщик накрывает страницу.
 */
const { announce } = useAnnouncer()

watch(displayIndex, (index) => {
  if (!hasImages.value) return

  announce(t('gr.imageViewer.position', 'Image {index} of {total}', { index, total: total.value }))
})

// Просмотрщик — оверлей модального класса, значит и слой у него модальный.
// `zIndexVar` подменяет переменную слоя своей — тот же escape-hatch, что у
// `useFloating` и `GrLoading`.
const viewerStyle = computed(() => ({
  zIndex: `var(${props.zIndexVar ?? '--gr-z-modal'})`,
}))

// Сенсорные жесты: pinch двумя пальцами и свайп для листания. Мышь идёт мимо —
// у неё своя ветка перетаскивания в `useZoomPan`.
const {
  isPinching,
  onPointerDown: onGesturePointerDown,
  onPointerMove: onGesturePointerMove,
  onPointerUp: onGesturePointerUp,
  onPointerCancel: onGesturePointerCancel,
  reset: resetGestures,
} = usePointerGestures({
  enabled: () => hasImages.value,
  scale: () => scale.value,
  canSwipe: () => total.value > 1,
  setScaleAt,
  pan: { start: startPan, move: movePan, end: endPan },
  onSwipeLeft: () => next(),
  onSwipeRight: () => prev(),
})

function onPointerDown(event: PointerEvent): void {
  onGesturePointerDown(event)
  onPanPointerDown(event)
}

// Движение и отпускание — только сенсорная ветка: панораму мышью и пером ведёт
// `useDragGesture` со своими слушателями на `window`.
function onPointerMove(event: PointerEvent): void {
  onGesturePointerMove(event)
}

function onPointerUp(event: PointerEvent): void {
  onGesturePointerUp(event)
}

function onPointerCancel(event: PointerEvent): void {
  onGesturePointerCancel(event)
}

// Плавный CSS-переход только для дискретных зумов; при wheel-зуме/перетаскивании отключаем.
const imageTransitionClass = computed(() =>
  isWheelZooming.value || isDragging.value || isPinching.value
    ? ''
    : 'transition-transform duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]',
)

// Курсор «рука» (grab/grabbing), только если включён drag.
const imageCursorClass = computed(() => {
  if (!isPannable.value)
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

/**
 * Предзагруженные соседи. Держим ссылки, чтобы загрузку можно было оборвать:
 * сброс `src` у `Image` отменяет незавершённый запрос. Без этого быстрое
 * перелистывание галереи копит запросы, которые уже никому не нужны.
 */
let preloadedImages: HTMLImageElement[] = []

function cancelPreload(): void {
  for (const image of preloadedImages) image.src = ''
  preloadedImages = []
}

function preloadAt(index: number): void {
  const url = items.value[index]?.src
  if (!url)
    return
  const image = new Image()
  image.decoding = 'async'
  image.src = url
  preloadedImages.push(image)
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
  zoomToNatural,
  reset: resetTransform,
  rotateLeft,
  rotateRight,
  download,
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

/**
 * Скачивание текущего кадра.
 *
 * Компонент делает очевидное — `<a download>` на текущий `src` — и сообщает о
 * нажатии событием. Кросс-доменный адрес браузер всё равно скачает не всегда
 * (атрибут `download` он там игнорирует), поэтому подписанные ссылки и свои
 * запросы делаются иначе: `showDownload: false` плюс своя кнопка в слоте
 * `#toolbar-actions`.
 */
function download(): void {
  const item = currentItem.value
  if (!item?.src) return

  emit('download', { src: item.src, alt: item.alt ?? '', index: currentIndex.value })

  if (typeof document === 'undefined') return

  const link = document.createElement('a')
  link.href = item.src
  link.download = ''
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const { onKeydown } = useViewerKeyboard({
  actions: { close: closeViewer, prev, next, zoomIn, zoomOut, reset: resetTransform },
})

// Просмотрщик — модальный класс: бэкдроп, scroll-lock, ловушка фокуса, место в
// общем стеке. Открытый поверх модалки, он закрывает по Esc себя, а не её.
const panelEl = ref<HTMLElement | null>(null)

const {
  rootEl,
  isMounted,
  isVisible,
  inertAttr,
  portalTarget,
  teleportEnabled,
  themeAttrs,
  onPanelAfterLeave: releasePresence,
  backdrop,
} = useModalOverlay(open, closeViewer, {
  panel: panelEl,
  closeOnEscape: () => props.closeOnPressEscape,
  closeOnBackdrop: () => props.hideOnClickModal,
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      stopObservingImage()
      endWheelZoom()
      resetGestures()
      cancelPan()
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
    if (!props.modelValue)
      return
    syncIndexFromInitial()
  },
)

/**
 * Список кадров меняется у живой галереи постоянно: догрузилась следующая
 * страница, заменили один url. Дёрни на любое такое изменение
 * `syncIndexFromInitial()` — пользователя выбросит на `initialIndex` вместе со
 * сброшенным зумом и поворотом.
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

/**
 * Соседние кадры греются только у **открытого** просмотрщика: закрытый на
 * странице не должен тянуть два полноразмерных изображения просто потому, что
 * он там есть. `new Image()` существует только в браузере — на сервере эта
 * ветка не выполняется, потому что закрытый просмотрщик до неё не доходит.
 */
function preloadNeighbours(index: number): void {
  cancelPreload()

  if (!props.modelValue || !hasImages.value || total.value < 2)
    return

  preloadAt(normalizeIndex(index - 1))
  preloadAt(normalizeIndex(index + 1))
}

watch([currentIndex, open], ([index]) => preloadNeighbours(index), { immediate: true })

onBeforeUnmount(() => {
  stopObservingImage()
  endWheelZoom()
  cancelPreload()
  resetGestures()
  cancelPan()
})

defineSlots<{
  /** Панель инструментов целиком вместо встроенной. */
  toolbar?: (props: GrImageViewerSlotProps) => any
  /** Свои кнопки рядом со встроенными — поворот, скачивание, печать. */
  'toolbar-actions'?: (props: GrImageViewerSlotProps) => any
}>()

</script>

<template>
  <teleport :to="portalTarget" :disabled="!teleportEnabled">
    <div
      v-if="teleportEnabled && isMounted"
      ref="rootEl"
      v-bind="themeAttrs"
      data-gr-overlay-root
      :inert="inertAttr"
      class="fixed inset-0"
      :style="viewerStyle"
      role="dialog"
      aria-modal="true"
      :aria-label="resolvedAriaLabel"
      @keydown="onKeydown"
    >
      <div class="fixed inset-0 overflow-hidden">
        <Transition
          appear
          enter-active-class="duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]"
          enter-from-class="opacity-0"
          leave-active-class="duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-in)]"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isVisible"
            data-gr-image-viewer-overlay
            :class="scrimClass"
            aria-hidden="true"
            v-on="backdrop"
          />
        </Transition>

        <Transition
          appear
          enter-active-class="duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]"
          enter-from-class="opacity-0 scale-98"
          leave-active-class="duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-in)]"
          leave-to-class="opacity-0 scale-98"
          @after-leave="releasePresence"
        >
          <div
            v-if="isVisible"
            ref="panelEl"
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
              ref="stageEl"
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
                  class="max-h-full max-w-full select-none object-contain will-change-transform [touch-action:none]"
                  :class="[imageTransitionClass, imageCursorClass]"
                  :style="imageStyle"
                  @load="onImageLoad"
                  @pointerdown="onPointerDown"
                  @pointermove="onPointerMove"
                  @pointerup="onPointerUp"
                  @pointercancel="onPointerCancel"
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
                      class="h-11 min-w-11 px-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600"
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
                      class="h-11 min-w-11 px-3 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] font-700"
                      :class="toolbarButtonClass"
                      @click="resetTransform"
                    >
                      100%
                    </button>

                    <!--
                      «1:1» рядом с «100%» не дубль: сброс возвращает вписанный в
                      окно кадр (номинальные 100%), а это — пиксель в пиксель, то
                      есть реальные 100%. У крупной фотографии между ними разница
                      в разы, и собирать эту кнопку из `naturalWidth`/`renderedWidth`
                      каждому потребителю незачем.
                    -->
                    <button
                      type="button"
                      data-gr-image-viewer-zoom-natural
                      :aria-label="resolvedZoomToNaturalLabel"
                      class="h-11 min-w-11 px-3 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] font-700"
                      :class="toolbarButtonClass"
                      @click="zoomToNatural"
                    >
                      1:1
                    </button>

                    <button
                      type="button"
                      data-gr-image-viewer-zoom-in
                      :aria-label="resolvedZoomInLabel"
                      class="h-11 min-w-11 px-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600"
                      :class="toolbarButtonClass"
                      @click="zoomIn"
                    >
                      <GrIcon size="sm">
                        <IconPlus />
                      </GrIcon>
                    </button>

                    <button
                      v-if="showDownload"
                      type="button"
                      data-gr-image-viewer-download
                      :aria-label="resolvedDownloadLabel"
                      class="h-11 min-w-11 px-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600"
                      :class="toolbarButtonClass"
                      @click="download"
                    >
                      <GrIcon size="sm">
                        <IconDownload />
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
                      class="h-11 min-w-11 px-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600"
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
                      class="h-11 min-w-11 px-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600"
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
          </div>
        </Transition>
      </div>
    </div>
  </teleport>
</template>