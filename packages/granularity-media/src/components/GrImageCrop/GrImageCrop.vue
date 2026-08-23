<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import GrSlider from '@feugene/granularity/components/GrSlider'
import { useDragGesture } from '@feugene/granularity/composables/useDragGesture'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import type { GrCropOffset, GrCropRect } from './cropGeometry'
import { outputSize } from '../../internal/outputSize'
import { clampOffset, cropRect, viewportFor } from './cropGeometry'
import type { GrImageCropShape, GrImageCropSize } from './grImageCropStyles'
import {
  circleMaskClass,
  controlsClass,
  emptyClass,
  imageClass,
  imageTransitionClass,
  rectGuideClass,
  rootClass,
  sizeEmptyClass,
  sizeTextClass,
  viewportClass,
} from './grImageCropStyles'

export interface GrImageCropOutput {
  /** Ширина результата. По умолчанию — ширина захваченной области исходника. */
  width?: number
  height?: number
  /** MIME результата: `image/png` (по умолчанию), `image/jpeg`, `image/webp`. */
  type?: string
  quality?: number
}

export interface GrImageCropProps {
  /** Файл из `GrFileUpload`, blob из камеры или готовый адрес. */
  src?: string | File | Blob | null
  /** Отношение ширины кадра к высоте: `1` — аватар, `16 / 9` — обложка. */
  aspectRatio?: number
  shape?: GrImageCropShape
  /**
   * Увеличение относительно вписанного кадра, не меньше единицы.
   *
   * Проп необязателен: без `v-model:zoom` компонент ведёт увеличение сам —
   * иначе встроенный слайдер оказывался бы мёртвым у всех, кто модель не
   * подключил, а это самый частый случай.
   */
  zoom?: number
  maxZoom?: number
  output?: GrImageCropOutput
  size?: GrImageCropSize
  disabled?: boolean
  ariaLabel?: string
}

export interface GrImageCropEmits {
  (e: 'update:zoom', value: number): void
  /** Кадр изменился: сдвиг, увеличение или новая картинка. */
  (e: 'change', rect: GrCropRect): void
  (e: 'load', size: { width: number, height: number }): void
  (e: 'error', error: unknown): void
}

const props = withDefaults(defineProps<GrImageCropProps>(), {
  src: null,
  aspectRatio: 1,
  shape: 'rect',
  zoom: undefined,
  maxZoom: 4,
  output: undefined,
  // `undefined`, а не `md`: настоящий дефолт живёт в `useGrComponentSize`,
  // иначе `GrConfigProvider` не смог бы его переопределить.
  size: undefined,
  disabled: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrImageCropEmits>()

defineSlots<{
  /** Замена встроенного слайдера увеличения. */
  controls?: (props: { zoom: number, setZoom: (value: number) => void }) => unknown
  /** Что показать, пока картинки нет. */
  empty?: () => unknown
}>()

/** Шаг клавиатурного сдвига в пикселях кадра. */
const KEYBOARD_STEP_PX = 12
/** Шаг увеличения с клавиатуры и колеса. */
const ZOOM_STEP = 0.15

const { t } = useGranularityTranslations()
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrImageCrop' })

const viewportEl = ref<HTMLElement | null>(null)
const image = shallowRef<HTMLImageElement | null>(null)
const naturalSize = ref({ width: 0, height: 0 })
const viewportSize = ref({ width: 0, height: 0 })
const offset = ref<GrCropOffset>({ x: 0, y: 0 })
const objectUrl = ref<string | null>(null)

/**
 * Окно измеряется, а не вычисляется.
 *
 * Высота, посчитанная как `ширина / aspectRatio`, расходится с настоящей: её
 * задаёт CSS (`aspect-ratio` плюс рамка), и при `box-sizing: border-box`
 * расхождение систематическое. Кадр от такой высоты вырезался **не тот**, что
 * пользователь видел в рамке. До первого измерения остаётся расчёт — иначе
 * геометрия вырождена.
 */
const viewport = computed(() => (
  viewportSize.value.height > 0
    ? viewportSize.value
    : viewportFor(viewportSize.value.width, props.aspectRatio)
))
const hasImage = computed(() => image.value !== null && naturalSize.value.width > 0)
/**
 * Своё увеличение — как `useControlledOpen` у оверлеев ядра: проп перекрывает
 * его, когда потребитель подключил модель, и не мешает, когда не подключил.
 */
const internalZoom = ref(1)
const isZoomControlled = computed(() => props.zoom !== undefined)
const currentZoom = computed(() => Math.min(
  props.maxZoom,
  Math.max(1, props.zoom ?? internalZoom.value),
))

const imageStyle = computed(() => {
  const scale = viewport.value.width > 0 && naturalSize.value.width > 0
    ? Math.max(
      viewport.value.width / naturalSize.value.width,
      viewport.value.height / naturalSize.value.height,
    ) * currentZoom.value
    : 1

  return {
    width: `${naturalSize.value.width}px`,
    height: `${naturalSize.value.height}px`,
    transform: `translate(-50%, -50%) translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale})`,
  }
})

function currentRect(): GrCropRect {
  return cropRect(naturalSize.value, viewport.value, currentZoom.value, offset.value)
}

function announceChange(): void {
  if (hasImage.value)
    emit('change', currentRect())
}

function moveBy(dx: number, dy: number): void {
  if (props.disabled || !hasImage.value)
    return

  offset.value = clampOffset(
    { x: offset.value.x + dx, y: offset.value.y + dy },
    naturalSize.value,
    viewport.value,
    currentZoom.value,
  )
  announceChange()
}

function setZoom(value: number): void {
  if (props.disabled)
    return

  const next = Math.min(props.maxZoom, Math.max(1, value))

  if (!isZoomControlled.value)
    internalZoom.value = next

  emit('update:zoom', next)
  // Уменьшение сокращает пределы сдвига, и прежнее смещение вывело бы кадр за
  // край картинки — подрезаем сразу, не дожидаясь следующего жеста.
  offset.value = clampOffset(offset.value, naturalSize.value, viewport.value, next)
  announceChange()
}

function reset(): void {
  offset.value = { x: 0, y: 0 }

  if (!isZoomControlled.value)
    internalZoom.value = 1

  emit('update:zoom', 1)
  announceChange()
}

const dragOrigin = ref<GrCropOffset>({ x: 0, y: 0 })
const dragStart = ref<GrCropOffset>({ x: 0, y: 0 })

const drag = useDragGesture({
  disabled: () => props.disabled || !hasImage.value,
  onStart: (event) => {
    dragOrigin.value = { x: event.clientX, y: event.clientY }
    dragStart.value = { ...offset.value }
  },
  onMove: (event) => {
    offset.value = clampOffset(
      {
        x: dragStart.value.x + (event.clientX - dragOrigin.value.x),
        y: dragStart.value.y + (event.clientY - dragOrigin.value.y),
      },
      naturalSize.value,
      viewport.value,
      currentZoom.value,
    )
  },
  onEnd: () => announceChange(),
  // Обрыв жеста возвращает картинку туда, где её взяли: браузер забрал
  // указатель (системный жест, потеря окна), а не пользователь выбрал кадр.
  onCancel: () => {
    offset.value = dragStart.value
  },
})

function onWheel(event: WheelEvent): void {
  if (props.disabled || !hasImage.value)
    return

  event.preventDefault()
  setZoom(currentZoom.value + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))
}

function onKeydown(event: KeyboardEvent): void {
  const handlers: Record<string, () => void> = {
    'ArrowLeft': () => moveBy(KEYBOARD_STEP_PX, 0),
    'ArrowRight': () => moveBy(-KEYBOARD_STEP_PX, 0),
    'ArrowUp': () => moveBy(0, KEYBOARD_STEP_PX),
    'ArrowDown': () => moveBy(0, -KEYBOARD_STEP_PX),
    '+': () => setZoom(currentZoom.value + ZOOM_STEP),
    '=': () => setZoom(currentZoom.value + ZOOM_STEP),
    '-': () => setZoom(currentZoom.value - ZOOM_STEP),
    'Home': () => reset(),
  }

  const handler = handlers[event.key]
  if (!handler)
    return

  event.preventDefault()
  handler()
}

function releaseObjectUrl(): void {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
}

function sourceUrl(source: GrImageCropProps['src']): string | null {
  if (!source)
    return null

  if (typeof source === 'string')
    return source

  const url = URL.createObjectURL(source)
  objectUrl.value = url

  return url
}

/**
 * Загрузка живёт в `onMounted` и в `watch` без `immediate`, а не в теле
 * `setup`: `new Image()` на сервере роняет рендер, а `URL.createObjectURL` там
 * не существует вовсе.
 */
function load(source: GrImageCropProps['src']): void {
  releaseObjectUrl()
  const url = sourceUrl(source)

  if (!url) {
    image.value = null
    naturalSize.value = { width: 0, height: 0 }

    return
  }

  const element = new Image()
  element.crossOrigin = 'anonymous'
  element.addEventListener('load', () => {
    image.value = element
    naturalSize.value = { width: element.naturalWidth, height: element.naturalHeight }
    offset.value = { x: 0, y: 0 }
    emit('load', { ...naturalSize.value })

    // Рамка получает своё соотношение вместе с картинкой — меряем уже после
    // того, как раскладка это учла.
    void nextTick(() => {
      measureViewport()
      announceChange()
    })
  })
  element.addEventListener('error', event => emit('error', event))
  element.src = url
}

let observer: ResizeObserver | null = null

/**
 * Замер окна.
 *
 * Зовётся ещё раз после загрузки картинки: до неё рамка не имеет своего
 * соотношения (`aspect-ratio` ставится вместе с картинкой), и первое измерение
 * приходит на переходной высоте. Кадр от неё считался бы не тем, что видно.
 */
function measureViewport(): void {
  const element = viewportEl.value
  if (!element)
    return

  viewportSize.value = { width: element.clientWidth, height: element.clientHeight }
}

onMounted(() => {
  if (viewportEl.value) {
    measureViewport()
    observer = new ResizeObserver(([entry]) => {
      viewportSize.value = {
        width: entry?.contentRect.width ?? 0,
        height: entry?.contentRect.height ?? 0,
      }
      offset.value = clampOffset(offset.value, naturalSize.value, viewport.value, currentZoom.value)
      // Размер окна изменился — изменилась и вырезаемая область: у адаптивной
      // раскладки это происходит и без участия пользователя, а первое
      // измерение приходит уже после `load`. Потребитель, собравший файл по
      // прежнему кадру, получил бы не то, что видит на экране.
      announceChange()
    })
    observer.observe(viewportEl.value)
  }

  load(props.src)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  releaseObjectUrl()
})

watch(() => props.src, source => load(source))

/**
 * Кадр в виде картинки.
 *
 * Размер по умолчанию — сама захваченная область в пикселях **исходника**, а не
 * окна на экране: окно вдвое меньше картинки на любом ноутбуке, и вывод по нему
 * молча ополовинил бы разрешение аватара.
 */
async function toBlob(): Promise<Blob | null> {
  const element = image.value
  if (!element || !hasImage.value)
    return null

  const rect = currentRect()
  const canvas = document.createElement('canvas')
  const size = outputSize(rect, props.output)
  canvas.width = size.width
  canvas.height = size.height

  const context = canvas.getContext('2d')
  if (!context)
    return null

  context.drawImage(element, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, canvas.width, canvas.height)

  try {
    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, props.output?.type ?? 'image/png', props.output?.quality)
    })
  }
  catch (error) {
    // Картинка с чужого домена без `Access-Control-Allow-Origin` помечает
    // холст, и экспорт падает `SecurityError` — уже после того, как
    // пользователь выбрал кадр. На экране до этого момента всё правильно, так
    // что причину не угадать: сообщение называет её прямо.
    if (__GR_DEV__) {
      console.warn(
        '[granularity-media] GrImageCrop: экспорт кадра запрещён политикой источника. '
        + 'Картинка приехала с другого домена без заголовка `Access-Control-Allow-Origin`, '
        + 'и холст стал непригоден для чтения.',
      )
    }

    emit('error', error)

    return null
  }
}

defineExpose({ crop: toBlob, reset, rect: currentRect })
</script>

<template>
  <div :class="rootClass" role="group" :aria-label="ariaLabel ?? t('grMedia.imageCrop.label', 'Image crop')">
    <!--
      `role="application"` — не перестраховка: окно кадра держит собственную
      двумерную клавиатуру, и в режиме чтения скринридер забрал бы стрелки себе.
      Без роли `aria-label` на этом узле и вовсе запрещён (axe:
      `aria-prohibited-attr`), а без подписи область остаётся безымянной.
    -->
    <div
      ref="viewportEl"
      role="application"
      :class="[viewportClass, hasImage ? '' : [emptyClass, sizeEmptyClass[resolvedSize]]]"
      :style="hasImage ? { aspectRatio: String(aspectRatio) } : undefined"
      :tabindex="disabled || !hasImage ? -1 : 0"
      :aria-label="t('grMedia.imageCrop.frame', 'Frame: arrow keys move the image, plus and minus zoom')"
      :aria-disabled="disabled || undefined"
      @pointerdown="drag.start"
      @wheel="onWheel"
      @keydown="onKeydown"
    >
      <template v-if="hasImage">
        <img
          :src="image!.src"
          alt=""
          :class="[imageClass, drag.isDragging.value ? '' : imageTransitionClass]"
          :style="imageStyle"
        >
        <div v-if="shape === 'circle'" :class="circleMaskClass" />
        <div v-else :class="rectGuideClass" />
      </template>

      <slot v-else name="empty">
        <span :class="sizeTextClass[resolvedSize]">
          {{ t('grMedia.imageCrop.empty', 'No image selected') }}
        </span>
      </slot>
    </div>

    <div v-if="hasImage" :class="controlsClass">
      <slot name="controls" :zoom="currentZoom" :set-zoom="setZoom">
        <GrSlider
          :model-value="currentZoom"
          :min="1"
          :max="maxZoom"
          :step="0.01"
          :size="resolvedSize"
          :disabled="disabled"
          :aria-label="t('grMedia.imageCrop.zoom', 'Zoom')"
          @update:model-value="value => setZoom(Number(value))"
        />
      </slot>
    </div>
  </div>
</template>
